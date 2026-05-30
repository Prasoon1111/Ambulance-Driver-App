/**
 * AmbulanceDriverApp — App.tsx
 * - Email OTP login (pure Firestore, no Firebase Auth)
 * - Session persisted via AsyncStorage (survives app kill)
 * - Home: dispatch button toggles Availability (available ↔ busy)
 * - Real-time GPS location written to Firestore when on duty
 * - Profile: all driver details + Sign Out button
 * - Login sets Availability → available
 * - Go On Duty sets Availability → busy
 * - Logout sets Availability → inactive + clears location
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Dimensions,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Easing, Alert, PermissionsAndroid,
} from 'react-native';
import firestore, { FirebaseFirestoreTypes, FieldValue } from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Ellipse, Line, Polygon } from 'react-native-svg';

// ─── EmailJS ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_k1f34qu';
const EMAILJS_TEMPLATE_ID = 'template_1ta0fsw';
const EMAILJS_PUBLIC_KEY  = 'l-W1Mxol-x9br9Typ';
const OTP_EXPIRY_MS       = 10 * 60 * 1000;

const { width } = Dimensions.get('window');

// ─── Driver type ──────────────────────────────────────────────────────────────
type Driver = {
  'Name':          string;
  'Email ID':      string;
  'Phone Number':  string;
  'Gender':        string;
  'Hospital Name': string;
  'Role':          string;
  'City':          string;
  'State':         string;
  'Documents':     string;
  docId?:          string;
};

// ─── Availability values ──────────────────────────────────────────────────────
// Firestore field: "Availability" (capital A)
// Values: 'available' | 'busy' | 'inactive'
type AvailabilityStatus = 'available' | 'busy' | 'inactive';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (toEmail: string, otp: string) => {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id:     EMAILJS_PUBLIC_KEY,
      template_params: { to_email: toEmail, otp, app_name: 'AmbulanceDriver' },
    }),
  });
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
};

// ─── Location permission ──────────────────────────────────────────────────────
const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const fineGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'AmbulanceDriver needs your location to track your position.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    if (fineGranted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    // Android 10+ (API 29+) requires background location to be requested separately
    if (Platform.Version >= 29) {
      const bgGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message:
            'AmbulanceDriver needs background location to track you while the app is in the background.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      // Background location not strictly required for foreground tracking;
      // warn but don't block if denied.
      if (bgGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Background location permission denied; tracking may stop when app is backgrounded.');
      }
    }
    return true;
  }
  return true;
};

// ─── Illustration ─────────────────────────────────────────────────────────────
const HeaderIllustration = () => (
  <Svg width={width} height={200} viewBox="0 0 375 200">
    <Path d="M0 0 H375 V200 H0 Z" fill="#FFF5F7" />
    <Path
      d="M30 190 Q80 170 120 150 Q170 125 200 140 Q240 158 270 135 Q310 110 340 80 Q360 60 370 40"
      stroke="#FF3B5C" strokeWidth="2.5" fill="none" strokeDasharray="6 4"
    />
    <Circle cx="60" cy="138" r="22" fill="#FFD6DD" />
    <Line x1="60"  y1="160" x2="60"  y2="183" stroke="#FF3B5C" strokeWidth="2" />
    <Line x1="95"  y1="113" x2="95"  y2="158" stroke="#FF3B5C" strokeWidth="2" />
    <Line x1="95"  y1="123" x2="82"  y2="138" stroke="#FF3B5C" strokeWidth="1.5" />
    <Line x1="95"  y1="131" x2="108" y2="143" stroke="#FF3B5C" strokeWidth="1.5" />
    <Path d="M170 128 H210 V158 H170 Z" fill="#FFD6DD" stroke="#FF3B5C" strokeWidth="1" />
    <Ellipse cx="285" cy="158" rx="22" ry="6" fill="#FFD6DD" />
    <Line x1="285" y1="151" x2="285" y2="113" stroke="#FF3B5C" strokeWidth="1.5" />
    <Path d="M285 115 L305 138 L285 141 Z" fill="#FFF5F7" stroke="#FF3B5C" strokeWidth="1" />
    <Polygon points="240,73 270,23 300,73"  fill="#FF3B5C" />
    <Polygon points="265,73 300,13 335,73"  fill="#FF3B5C" />
    <Polygon points="270,25 280,43 260,43"  fill="#FF8FA3" />
    <Polygon points="300,15 312,35 288,35"  fill="#FF8FA3" />
    <Circle cx="60" cy="193" r="5" fill="#FF3B5C" />
  </Svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 48 }: { name: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
};

type Screen = 'email' | 'otp' | 'home' | 'profile';

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Email Entry
// ═════════════════════════════════════════════════════════════════════════════
const EmailScreen = ({
  onOtpSent,
}: {
  onOtpSent: (email: string, otp: string, expiry: number, driver: Driver) => void;
}) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const snap = await firestore()
        .collection('drivers')
        .where('Email ID', '==', cleaned)
        .limit(1)
        .get();

      if (snap.empty) {
        setError('No driver account found for this email.\nContact your admin.');
        setLoading(false);
        return;
      }

      const doc    = snap.docs[0];
      const driver = { ...doc.data(), docId: doc.id } as Driver;
      const otp    = generateOtp();
      const expiry = Date.now() + OTP_EXPIRY_MS;

      await sendOtpEmail(cleaned, otp);
      onOtpSent(cleaned, otp, expiry, driver);
    } catch (e: any) {
      console.error('handleSend:', e.message);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderIllustration />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your registered email to receive an OTP
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#AAAAAA"
                value={email}
                onChangeText={t => { setError(''); setEmail(t); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.primaryButtonText}>Send OTP  ›</Text>}
            </TouchableOpacity>
            <Text style={styles.hintText}>
              A 6-digit OTP will be sent to your registered email
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — OTP Verification
// ═════════════════════════════════════════════════════════════════════════════
const OtpScreen = ({
  email, expectedOtp, otpExpiry, onVerified, onBack,
}: {
  email: string; expectedOtp: string; otpExpiry: number;
  onVerified: () => void; onBack: () => void;
}) => {
  const [otp,      setOtp]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [timeLeft, setTimeLeft] = useState(
    Math.ceil((otpExpiry - Date.now()) / 1000),
  );

  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.ceil((otpExpiry - Date.now()) / 1000);
      setTimeLeft(r > 0 ? r : 0);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [otpExpiry]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleVerify = () => {
    const cleaned = otp.trim();
    if (cleaned.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    if (Date.now() > otpExpiry) { setError('OTP expired. Go back and request a new one.'); return; }
    if (cleaned !== expectedOtp) { setError('Incorrect OTP. Please try again.'); return; }
    setLoading(true);
    onVerified();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderIllustration />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.highlight}>{email}</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="— — — — — —"
                placeholderTextColor="#CCCCCC"
                value={otp}
                onChangeText={t => { setError(''); setOtp(t.replace(/[^0-9]/g, '')); }}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
            <Text style={[
              styles.hintText,
              timeLeft < 60 && { color: '#FF3B5C', fontWeight: '600' },
            ]}>
              {timeLeft > 0
                ? `OTP expires in ${fmt(timeLeft)}`
                : 'OTP expired. Go back to resend.'}
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (loading || timeLeft === 0) && styles.disabledButton,
              ]}
              onPress={handleVerify}
              disabled={loading || timeLeft === 0}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.primaryButtonText}>Verify & Sign In  ›</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryRow}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryText}>← Change email / Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Home
// ═════════════════════════════════════════════════════════════════════════════
const HomeScreen = ({
  driver, onProfile, onLogout,
}: {
  driver: Driver; onProfile: () => void; onLogout: () => void;
}) => {
  const [availability, setAvailability] = useState<AvailabilityStatus>('available');
  const [toggling,     setToggling]     = useState(false);
  const locationWatchId                 = useRef<number | null>(null);
  const pulse                           = useRef(new Animated.Value(1)).current;

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.09, duration: 950,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1, duration: 950,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // On mount: set Availability → available in Firestore (just logged in)
  useEffect(() => {
    if (!driver.docId) return;
    firestore()
      .collection('drivers')
      .doc(driver.docId)
      .update({ Availability: 'available' })
      .then(() => setAvailability('available'))
      .catch(e => console.error('Set available on login:', e));
  }, [driver.docId]);

  // Start/stop GPS based on availability
  useEffect(() => {
    if (availability === 'busy') {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    return () => stopLocationTracking();
  }, [availability]);

  const startLocationTracking = async () => {
    locationWatchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        if (!driver.docId) return;
        firestore()
          .collection('drivers')
          .doc(driver.docId)
          .update({
            location: {
              latitude,
              longitude,
              updatedAt: FieldValue.serverTimestamp(),
            },
          })
          .catch(e => console.error('Location update:', e));
      },
      error => console.error('Geolocation error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      },
    );
  };

  const stopLocationTracking = () => {
    if (locationWatchId.current !== null) {
      Geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
  };

  const toggleAvailability = async () => {
    if (!driver.docId || toggling) return;
    setToggling(true);

    // Toggle between available ↔ busy only
    const newStatus: AvailabilityStatus =
      availability === 'available' ? 'busy' : 'available';

    try {
      if (newStatus === 'busy') {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to go on duty.',
          );
          setToggling(false);
          return;
        }
      }

      await firestore()
        .collection('drivers')
        .doc(driver.docId)
        .update({ Availability: newStatus });

      setAvailability(newStatus);
    } catch (e: any) {
      console.error('Toggle Availability:', e.message);
      Alert.alert('Error', 'Could not update status. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const isBusy = availability === 'busy';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.homeWelcome}>Welcome,</Text>
          <Text style={styles.homeDriverName}>{driver['Name']}</Text>
        </View>
        <TouchableOpacity onPress={onProfile} activeOpacity={0.8}>
          <Avatar name={driver['Name']} size={48} />
        </TouchableOpacity>
      </View>

      {/* Status strip */}
      <View style={[
        styles.statusRow,
        { backgroundColor: isBusy ? '#FFF0F0' : '#F0FFF4' },
      ]}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isBusy ? '#FF3B5C' : '#22C55E' },
        ]} />
        <Text style={[
          styles.statusText,
          { color: isBusy ? '#FF3B5C' : '#16A34A' },
        ]}>
          {isBusy ? 'On Duty (Busy)' : 'Available'}  •  {driver['Hospital Name']}
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.homeContent}>
        <Text style={styles.emergencyTitle}>
          {isBusy ? 'You are\nOn Duty' : 'Ready for\nEmergency Dispatch'}
        </Text>
        <Text style={styles.emergencySubtitle}>
          {isBusy
            ? 'Your location is being tracked.\nTap the button to go off duty.'
            : 'Tap the button below to go\non duty and start tracking.'}
        </Text>

        {/* Pulsing dispatch button */}
        <TouchableOpacity
          onPress={toggleAvailability}
          disabled={toggling}
          activeOpacity={0.85}
          style={styles.pulseContainer}
        >
          <Animated.View style={[
            styles.pulseRing2,
            {
              transform: [{ scale: pulse }],
              backgroundColor: isBusy
                ? 'rgba(255,59,92,0.08)'
                : 'rgba(34,197,94,0.08)',
            },
          ]} />
          <Animated.View style={[
            styles.pulseRing1,
            {
              transform: [{ scale: pulse }],
              backgroundColor: isBusy
                ? 'rgba(255,59,92,0.14)'
                : 'rgba(34,197,94,0.14)',
            },
          ]} />
          <View style={[
            styles.emergencyButton,
            { backgroundColor: isBusy ? '#FF3B5C' : '#22C55E' },
          ]}>
            {toggling
              ? <ActivityIndicator color="#FFF" size="large" />
              : <>
                  <Text style={styles.emergencyButtonIcon}>
                    {isBusy ? '🚑' : '▶'}
                  </Text>
                  <Text style={styles.emergencyButtonLabel}>
                    {isBusy ? 'On Duty\nTap to Stop' : 'Go On\nDuty'}
                  </Text>
                </>
            }
          </View>
        </TouchableOpacity>

        {/* Live tracking indicator */}
        {isBusy && (
          <View style={styles.locationIndicator}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>
              📍 Live location tracking active
            </Text>
          </View>
        )}
      </View>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarItem} activeOpacity={0.7}>
          <Text style={styles.bottomBarIconActive}>⌂</Text>
          <Text style={styles.bottomBarLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBarItem}
          onPress={onProfile}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomBarIcon}>👤</Text>
          <Text style={styles.bottomBarLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Profile (with Sign Out)
// ═════════════════════════════════════════════════════════════════════════════
const ProfileScreen = ({
  driver, onBack, onLogout,
}: {
  driver: Driver; onBack: () => void; onLogout: () => void;
}) => {
  const fields: { label: string; key: keyof Driver; icon: string }[] = [
    { label: 'Full Name',    key: 'Name',          icon: '👤' },
    { label: 'Email',        key: 'Email ID',       icon: '✉️' },
    { label: 'Phone Number', key: 'Phone Number',   icon: '📞' },
    { label: 'Gender',       key: 'Gender',         icon: '⚧'  },
    { label: 'Role',         key: 'Role',           icon: '🪪'  },
    { label: 'Hospital',     key: 'Hospital Name',  icon: '🏥' },
    { label: 'City',         key: 'City',           icon: '🏙️' },
    { label: 'State',        key: 'State',          icon: '📍' },
    { label: 'Documents',    key: 'Documents',      icon: '📄' },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onLogout },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.profileHeaderTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar block */}
        <View style={styles.profileTop}>
          <Avatar name={driver['Name']} size={80} />
          <Text style={styles.profileName}>{driver['Name']}</Text>
          <Text style={styles.profileRole}>{driver['Role']}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              ✓  Documents {driver['Documents']}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.profileCard}>
          {fields.map((f, i) => (
            <View
              key={f.key}
              style={[
                styles.profileRow,
                i < fields.length - 1 && styles.profileRowBorder,
              ]}
            >
              <Text style={styles.profileRowIcon}>{f.icon}</Text>
              <View style={styles.profileRowText}>
                <Text style={styles.profileRowLabel}>{f.label}</Text>
                <Text style={styles.profileRowValue}>
                  {driver[f.key] || '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutText}>⏻  Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,  setScreen]  = useState<Screen>('email');
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [expiry,  setExpiry]  = useState(0);
  const [driver,  setDriver]  = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('driverSession');
        if (saved) {
          const parsed = JSON.parse(saved) as Driver;
          setDriver(parsed);
          setScreen('home');
        }
      } catch (e) {
        console.error('Session restore error:', e);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Session is persisted explicitly on successful OTP verification (see onVerified below).
  // We intentionally do NOT auto-save on every driver state change to avoid
  // persisting a driver record before the user has actually verified their OTP.

  // ── Logout:
  //    1. Set Availability → inactive  (capital A, your Firestore field)
  //    2. Delete location field
  //    3. Clear AsyncStorage session
  const handleLogout = async () => {
    try {
      if (driver?.docId) {
        await firestore()
          .collection('drivers')
          .doc(driver.docId)
          .update({
            Availability: 'inactive',
            location: FieldValue.delete(),
          });
      }
      await AsyncStorage.removeItem('driverSession');
    } catch (e) {
      console.error('Logout error:', e);
    }
    setDriver(null);
    setEmail('');
    setOtp('');
    setScreen('email');
  };

  // Splash while restoring session
  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashIcon}>🚑</Text>
        <Text style={styles.splashTitle}>AmbulanceDriver</Text>
        <ActivityIndicator
          size="large"
          color="#FF3B5C"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  if (screen === 'profile' && driver) {
    return (
      <ProfileScreen
        driver={driver}
        onBack={() => setScreen('home')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'home' && driver) {
    return (
      <HomeScreen
        driver={driver}
        onProfile={() => setScreen('profile')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'otp') {
    return (
      <OtpScreen
        email={email}
        expectedOtp={otp}
        otpExpiry={expiry}
        onVerified={() => {
          // Persist session only AFTER successful OTP verification
          if (driver) {
            AsyncStorage.setItem('driverSession', JSON.stringify(driver)).catch(
              e => console.error('Session save error:', e),
            );
          }
          setScreen('home');
        }}
        onBack={() => { setOtp(''); setDriver(null); setScreen('email'); }}
      />
    );
  }

  return (
    <EmailScreen
      onOtpSent={(em, o, ex, driverData) => {
        setEmail(em);
        setOtp(o);
        setExpiry(ex);
        setDriver(driverData); // held in memory only; saved to storage after OTP verified
        setScreen('otp');
      }}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  contentContainer: {
    paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40,
  },

  splashContainer: {
    flex: 1, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  splashIcon:  { fontSize: 56, marginBottom: 12 },
  splashTitle: { fontSize: 24, fontWeight: '800', color: '#FF3B5C', letterSpacing: 0.5 },

  title:    { fontSize: 30, fontWeight: '800', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 22 },
  highlight:{ color: '#FF3B5C', fontWeight: '700' },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 14,
    marginBottom: 14, paddingHorizontal: 16,
  },
  input:    { flex: 1, height: 52, fontSize: 15, color: '#222' },
  otpInput: { fontSize: 26, fontWeight: '700', letterSpacing: 10, textAlign: 'center' },

  primaryButton: {
    backgroundColor: '#FF3B5C', borderRadius: 14, height: 56,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    shadowColor: '#FF3B5C', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  disabledButton:    { opacity: 0.5 },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
  hintText:          { fontSize: 13, color: '#AAA', textAlign: 'center', marginBottom: 12 },
  errorText:         { color: '#FF3B5C', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  secondaryRow:      { alignItems: 'center', marginTop: 4 },
  secondaryText:     { fontSize: 14, color: '#888' },

  avatar:     { backgroundColor: '#FF3B5C', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800' },

  homeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  homeWelcome:    { fontSize: 13, color: '#888', fontWeight: '500' },
  homeDriverName: { fontSize: 20, fontWeight: '800', color: '#111', marginTop: 2 },

  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 10,
  },
  statusDot:  { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },

  homeContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingBottom: 20,
  },
  emergencyTitle: {
    fontSize: 26, fontWeight: '800', color: '#111',
    textAlign: 'center', marginBottom: 10,
  },
  emergencySubtitle: {
    fontSize: 14, color: '#888',
    textAlign: 'center', lineHeight: 22, marginBottom: 48,
  },

  pulseContainer: { alignItems: 'center', justifyContent: 'center' },
  pulseRing2: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  pulseRing1: { position: 'absolute', width: 185, height: 185, borderRadius: 93 },
  emergencyButton: {
    width: 150, height: 150, borderRadius: 75,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  emergencyButtonIcon:  { fontSize: 36, marginBottom: 6 },
  emergencyButtonLabel: {
    color: '#FFF', fontSize: 13, fontWeight: '700',
    textAlign: 'center', lineHeight: 18,
  },

  locationIndicator: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 24, backgroundColor: '#FFF0F0',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  locationDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B5C', marginRight: 8 },
  locationText: { fontSize: 13, color: '#FF3B5C', fontWeight: '600' },

  bottomBar: {
    flexDirection: 'row', borderTopWidth: 1,
    borderTopColor: '#F0F0F0', paddingBottom: 8,
  },
  bottomBarItem:        { flex: 1, alignItems: 'center', paddingVertical: 10 },
  bottomBarIcon:        { fontSize: 22, marginBottom: 2 },
  bottomBarLabel:       { fontSize: 11, color: '#AAA', fontWeight: '500' },
  bottomBarIconActive:  { fontSize: 22, marginBottom: 2 },
  bottomBarLabelActive: { fontSize: 11, color: '#FF3B5C', fontWeight: '700' },

  profileHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backButton:         { padding: 6 },
  backArrow:          { fontSize: 22, color: '#FF3B5C', fontWeight: '700' },
  profileHeaderTitle: { fontSize: 17, fontWeight: '800', color: '#111' },

  profileTop: {
    alignItems: 'center', paddingVertical: 28, backgroundColor: '#FFF5F7',
  },
  profileName: {
    fontSize: 22, fontWeight: '800', color: '#111', marginTop: 12, marginBottom: 4,
  },
  profileRole:   { fontSize: 14, color: '#FF3B5C', fontWeight: '600', marginBottom: 10 },
  verifiedBadge: { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  verifiedText:  { fontSize: 13, color: '#2E7D32', fontWeight: '600' },

  profileCard: {
    margin: 16, backgroundColor: '#FFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  profileRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  profileRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  profileRowIcon:   { fontSize: 20, marginRight: 14, width: 28, textAlign: 'center' },
  profileRowText:   { flex: 1 },
  profileRowLabel:  {
    fontSize: 11, color: '#AAA', fontWeight: '600',
    marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  profileRowValue: { fontSize: 15, color: '#111', fontWeight: '600' },

  signOutButton: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: '#FFF0F0', borderRadius: 14,
    height: 56, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFD6DD',
  },
  signOutText: { color: '#FF3B5C', fontSize: 16, fontWeight: '700' },
});
