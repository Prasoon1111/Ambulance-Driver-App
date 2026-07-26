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
  Animated, Easing, Alert, PermissionsAndroid, NativeModules,
  Modal, PanResponder, LogBox,
} from 'react-native';
import firestore, {
  FieldValue,
  deleteField,
  doc as firestoreDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Ellipse, Line, Polygon } from 'react-native-svg';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// ─── EmailJS ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_k1f34qu';
const EMAILJS_TEMPLATE_ID = 'template_1ta0fsw';
const EMAILJS_PUBLIC_KEY  = 'l-W1Mxol-x9br9Typ';
const OTP_EXPIRY_MS       = 10 * 60 * 1000;
const GOOGLE_MAPS_API_KEY = '***REMOVED***';

const { width, height: screenHeight } = Dimensions.get('window');
const { DriverLocationService } = NativeModules;

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

// ─── Driver type ──────────────────────────────────────────────────────────────
type Driver = {
  'Name'?:          string;
  'Email ID'?:      string;
  'Phone Number'?:  string;
  'Gender'?:        string;
  'Hospital Name'?: string;
  'Role'?:          string;
  'City'?:          string;
  'State'?:         string;
  'licenseNumber'?: string;
  'aadhaarNumber'?: string;
  'hospitalId'?:    string;
  'Documents'?:     string;
  docId?:           string;
  [key: string]:    any;
};

// ─── Emergency type ───────────────────────────────────────────────────────────
type EmergencyLocation = {
  latitude: number;
  longitude: number;
};

type Emergency = {
  id: string;
  address?: string;
  ambulanceId?: string;
  driverId?: string;
  driverName?: string;
  eta?: string | null;
  hospitalId?: string;
  incidentType?: string;
  location?: EmergencyLocation | { latitude: number; longitude: number } | any;
  patientName?: string;
  priority?: string;
  startTime?: any;
  status?: 'requested' | 'accepted' | 'rejected' | string;
  [key: string]: any;
};

// ─── Availability values ──────────────────────────────────────────────────────
// Firestore field: "Availability" (capital A)
// Values: 'available' | 'busy' | 'inactive'
type AvailabilityStatus = 'available' | 'busy' | 'inactive';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type RouteStep = {
  instruction: string;
  distance: string;
  duration: string;
  endLocation: Coordinate;
};

type TripStatus =
  | 'going_to_patient'
  | 'reached_patient'
  | 'patient_onboard'
  | 'near_hospital'
  | 'trip_completed';

const TRIP_STATUS_STEPS: { label: string; value: TripStatus; action: string }[] = [
  { label: 'Going to Patient', value: 'going_to_patient', action: 'Reached Patient' },
  { label: 'Reached Patient', value: 'reached_patient', action: 'Patient Onboard' },
  { label: 'Patient Onboard', value: 'patient_onboard', action: 'Near Hospital' },
  { label: 'Near Hospital', value: 'near_hospital', action: 'Trip Completed' },
  { label: 'Trip Completed', value: 'trip_completed', action: 'Trip Completed' },
];

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

const startPersistentDriverTracking = async (driverDocId?: string) => {
  if (Platform.OS !== 'android' || !driverDocId || !DriverLocationService?.start) return;
  await DriverLocationService.start(driverDocId);
};

const stopPersistentDriverTracking = async () => {
  if (Platform.OS !== 'android' || !DriverLocationService?.stop) return;
  await DriverLocationService.stop();
};

const decodePolyline = (encoded: string): Coordinate[] => {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Coordinate[] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const reverseGeocode = async (coordinate: Coordinate) => {
  const params = [
    `latlng=${coordinate.latitude},${coordinate.longitude}`,
    `key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`,
  ].join('&');
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
  );
  const json = await response.json();

  if (json.status !== 'OK' || !json.results?.length) {
    throw new Error(json.error_message || `Geocode failed: ${json.status}`);
  }

  return json.results[0].formatted_address as string;
};

const distanceMeters = (a: Coordinate, b: Coordinate) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const calculateBearing = (from: Coordinate, to: Coordinate) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const fromLat = toRad(from.latitude);
  const toLat = toRad(to.latitude);
  const deltaLng = toRad(to.longitude - from.longitude);
  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
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
    if (Platform.Version >= 33) {
      const notificationPermission = (PermissionsAndroid.PERMISSIONS as any).POST_NOTIFICATIONS;
      if (notificationPermission) {
        await PermissionsAndroid.request(notificationPermission, {
          title: 'Tracking Notification Permission',
          message:
            'AmbulanceDriver shows a persistent notification while live trip tracking is active.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        });
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

const NavigationArrow = ({ heading }: { heading: number }) => (
  <Svg width={40} height={40} viewBox="0 0 40 40" style={{ transform: [{ rotate: `${heading}deg` }] }}>
    <Circle cx="20" cy="20" r="16" fill="rgba(255, 59, 92, 0.2)" />
    <Polygon points="20,8 32,32 20,26 8,32" fill="#FF3B5C" stroke="#FFFFFF" strokeWidth={2} />
  </Svg>
);

type Screen = 'email' | 'otp' | 'home' | 'maps' | 'profile';

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
  driver, initialAvailability, markAvailableOnMount, onAvailabilityChange, onProfile, onOpenMaps,
}: {
  driver: Driver;
  initialAvailability: AvailabilityStatus;
  markAvailableOnMount: boolean;
  onAvailabilityChange: (status: AvailabilityStatus) => void;
  onProfile: () => void;
  onOpenMaps: () => void;
}) => {
  const [availability, setAvailability] = useState<AvailabilityStatus>(initialAvailability);
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
  }, [pulse]);

  useEffect(() => {
    setAvailability(initialAvailability);
  }, [initialAvailability]);

  // On normal login/session restore, keep the driver ready for dispatch.
  // After MapsScreen returns from trip completion, initialAvailability remains busy
  // so Home can show the red End Duty action.
  useEffect(() => {
    if (!markAvailableOnMount || !driver.docId || initialAvailability === 'busy') return;
    const driverRef = firestoreDoc(getFirestore(), 'drivers', driver.docId);
    updateDoc(driverRef, { Availability: 'available' })
      .then(() => {
        setAvailability('available');
        onAvailabilityChange('available');
      })
      .catch(e => console.error('Set available on login:', e));
  }, [driver.docId, initialAvailability, markAvailableOnMount, onAvailabilityChange]);

  // Start/stop GPS based on availability
  useEffect(() => {
    if (availability === 'busy') {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    return () => stopLocationTracking();
  // startLocationTracking reads the latest driver doc id inside the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const isEndingDuty = availability === 'busy';

    try {
      const driverRef = firestoreDoc(getFirestore(), 'drivers', driver.docId);

      if (isEndingDuty) {
        await updateDoc(driverRef, {
          Availability: 'available',
          tripStatus: deleteField(),
          location: deleteField(),
        });
        await stopPersistentDriverTracking();
        setAvailability('available');
        onAvailabilityChange('available');
        return;
      }

      {
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

      await updateDoc(driverRef, { Availability: 'busy' });
      await startPersistentDriverTracking(driver.docId);
      setAvailability('busy');
      onAvailabilityChange('busy');
      onOpenMaps();
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
            ? 'Trip completed.\nTap the button to end duty.'
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
                    {isBusy ? 'End\nDuty' : 'Go On\nDuty'}
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
// SCREEN 4 — Maps
// ═════════════════════════════════════════════════════════════════════════════
const MapsScreen = ({
  driver, activeEmergency, onTripComplete, onProfile,
}: {
  driver: Driver; activeEmergency?: Emergency | null; onTripComplete: () => void; onProfile: () => void;
}) => {
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [liveLocation, setLiveLocation] = useState<Coordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [destinationCoordinate, setDestinationCoordinate] = useState<Coordinate | null>(null);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [eta, setEta] = useState('');
  const [distance, setDistance] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [directionsActive, setDirectionsActive] = useState(false);
  const [tripStatusIndex, setTripStatusIndex] = useState(0);
  const [tripStatusUpdating, setTripStatusUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospitalSearchText, setHospitalSearchText] = useState('');
  
  // Navigation State
  const [isFollowing, setIsFollowing] = useState(true);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [heading, setHeading] = useState(0);
  const lastRerouteRef = useRef<number>(0);
  const lastRouteFetchLocationRef = useRef<Coordinate | null>(null);
  const lastRouteFetchTimeRef = useRef<number>(0);
  const lastAddressFetchLocationRef = useRef<Coordinate | null>(null);
  const isFetchingRouteRef = useRef<boolean>(false);

  const watchId = useRef<number | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Bottom Sheet
  const SHEET_MAX_HEIGHT = screenHeight * 0.58;
  const SHEET_MIN_HEIGHT = 180;
  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 = expanded, positive = collapsed
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const sheetScrollEnabled = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const newVal = Math.max(0, Math.min(gestureState.dy, SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT));
        sheetAnim.setValue(newVal);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = (SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT) / 3;
        if (gestureState.dy > threshold) {
          // Collapse
          Animated.spring(sheetAnim, {
            toValue: SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT,
            useNativeDriver: false,
            bounciness: 4,
          }).start(() => {
            setSheetExpanded(false);
            sheetScrollEnabled.current = false;
          });
        } else {
          // Expand
          Animated.spring(sheetAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start(() => {
            setSheetExpanded(true);
            sheetScrollEnabled.current = true;
          });
        }
      },
    }),
  ).current;

  const expandSheet = () => {
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 4,
    }).start(() => {
      setSheetExpanded(true);
      sheetScrollEnabled.current = true;
    });
  };

  const collapseSheet = () => {
    Animated.spring(sheetAnim, {
      toValue: SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      bounciness: 4,
    }).start(() => {
      setSheetExpanded(false);
      sheetScrollEnabled.current = false;
    });
  };

  const initialRegion: Region = {
    latitude: liveLocation?.latitude ?? 20.5937,
    longitude: liveLocation?.longitude ?? 78.9629,
    latitudeDelta: liveLocation ? 0.05 : 18,
    longitudeDelta: liveLocation ? 0.05 : 18,
  };

  useEffect(() => {
    if (!activeEmergency) return;

    if (activeEmergency.address) {
      setDestinationText(activeEmergency.address);
    } else if (activeEmergency.patientName) {
      setDestinationText(`Patient: ${activeEmergency.patientName}`);
    }

    if (activeEmergency.location) {
      const loc = activeEmergency.location;
      if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        setDestinationCoordinate({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    }
  }, [activeEmergency]);

  const updateDriverLocation = (coordinate: Coordinate) => {
    setLiveLocation(coordinate);
    if (!driver.docId) return;

    firestore()
      .collection('drivers')
      .doc(driver.docId)
      .update({
        location: {
          ...coordinate,
          updatedAt: FieldValue.serverTimestamp(),
        },
      })
      .catch(e => console.error('Navigation location update:', e));
  };

  const updateCurrentAddress = async (coordinate: Coordinate) => {
    try {
      const address = await reverseGeocode(coordinate);
      setCurrentLocationText(address);
    } catch (e: any) {
      console.error('Reverse geocode error:', e.message);
      setCurrentLocationText(`${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`);
    }
  };

  const writeTripStatus = async (status: TripStatus) => {
    if (!driver.docId) return;

    const driverRef = firestoreDoc(getFirestore(), 'drivers', driver.docId);
    await setDoc(driverRef, {
      tripStatus: status,
      tripStatusUpdatedAt: serverTimestamp(),
    }, { merge: true });
  };

  useEffect(() => {
    writeTripStatus(TRIP_STATUS_STEPS[0].value)
      .catch(e => console.error('Create tripStatus field:', e));
    startPersistentDriverTracking(driver.docId)
      .catch(e => console.error('Start persistent tracking:', e));
  // writeTripStatus is scoped to the current driver doc id.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.docId]);

  useEffect(() => {
    const startLiveLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission is required for live navigation.');
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const coordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          if (position.coords.heading !== null && position.coords.heading >= 0) {
            setHeading(position.coords.heading);
          }
          updateDriverLocation(coordinate);
          updateCurrentAddress(coordinate);
        },
        e => {
          console.error('Current position error:', e);
          setError('Could not get your current location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
      );

      watchId.current = Geolocation.watchPosition(
        position => {
          const coordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          if (position.coords.heading !== null && position.coords.heading >= 0) {
            setHeading(position.coords.heading);
          }
          updateDriverLocation(coordinate);
        },
        e => console.error('Navigation watch error:', e),
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 5000,
          fastestInterval: 3000,
        },
      );
    };

    startLiveLocation();
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  // updateDriverLocation is intentionally local to this screen and writes latest GPS samples.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.docId]);

  // 1. Live Address Update on GPS movement
  useEffect(() => {
    if (!liveLocation) return;

    const shouldUpdateAddress =
      !lastAddressFetchLocationRef.current ||
      distanceMeters(liveLocation, lastAddressFetchLocationRef.current) > 20;

    if (shouldUpdateAddress) {
      lastAddressFetchLocationRef.current = liveLocation;
      updateCurrentAddress(liveLocation);
    }
  }, [liveLocation]);

  // 2. Continuous Route Recalculation & Off-Route Rerouting
  useEffect(() => {
    if (!liveLocation || (!destinationCoordinate && !destinationText.trim())) return;
    if (routeCoordinates.length === 0 && !directionsActive) return;

    const now = Date.now();
    const timeSinceLastFetch = now - lastRouteFetchTimeRef.current;

    // Throttle route recalculation to at least 4 seconds apart unless off-route
    if (timeSinceLastFetch < 4000 || isFetchingRouteRef.current) return;

    const distanceMoved = lastRouteFetchLocationRef.current
      ? distanceMeters(liveLocation, lastRouteFetchLocationRef.current)
      : 999;

    let minDistanceToPolyline = Infinity;
    if (routeCoordinates.length > 0) {
      for (const pt of routeCoordinates) {
        const dist = distanceMeters(liveLocation, pt);
        if (dist < minDistanceToPolyline) minDistanceToPolyline = dist;
      }
    }

    const isOffRoute = minDistanceToPolyline > 40; // 40 meters off route
    const isSignificantMove = distanceMoved >= 15; // 15 meters moved

    if (isOffRoute || isSignificantMove) {
      fetchRoute(true);
    }
  }, [liveLocation, directionsActive, routeCoordinates, destinationCoordinate, destinationText]);

  // 3. Step progression along current step
  useEffect(() => {
    if (!liveLocation || routeSteps.length === 0) return;

    const currentStep = routeSteps[activeStepIndex];
    if (currentStep) {
      const distToCurrentEnd = distanceMeters(liveLocation, currentStep.endLocation);
      if (distToCurrentEnd < 25 && activeStepIndex < routeSteps.length - 1) {
        setActiveStepIndex(prev => prev + 1);
      }
    }
  }, [liveLocation, routeSteps, activeStepIndex]);

  useEffect(() => {
    if (!directionsActive || !liveLocation) return;

    if (isFollowing) {
      const nextStep = routeSteps[activeStepIndex];
      let camHeading = heading;
      // Fallback to route bearing if device heading is 0 or unavailable
      if (camHeading === 0 && nextStep) {
        camHeading = calculateBearing(liveLocation, nextStep.endLocation);
      }

      mapRef.current?.animateCamera(
        {
          center: liveLocation,
          pitch: 60,
          heading: camHeading,
          zoom: 18.5,
        },
        { duration: 1000 },
      );
    }
  }, [activeStepIndex, directionsActive, liveLocation, routeSteps, isFollowing, heading]);

  const useCurrentGps = async () => {
    setLocating(true);
    setError('');
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission is required to use GPS.');
        setLocating(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const coordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          updateDriverLocation(coordinate);
          updateCurrentAddress(coordinate);
          setLocating(false);
        },
        e => {
          console.error('Use GPS error:', e);
          setError('Could not refresh your GPS location.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 },
      );
    } catch {
      setError('Could not refresh your GPS location.');
      setLocating(false);
    }
  };

  const buildOrigin = () => {
    const cleaned = currentLocationText.trim();
    if (liveLocation) return `${liveLocation.latitude},${liveLocation.longitude}`;
    if (cleaned) return cleaned;
    return '';
  };

  const fetchRoute = async (isAutoUpdate = false) => {
    if (isFetchingRouteRef.current) return;

    const origin = liveLocation
      ? `${liveLocation.latitude},${liveLocation.longitude}`
      : buildOrigin();

    const destination = destinationCoordinate
      ? `${destinationCoordinate.latitude},${destinationCoordinate.longitude}`
      : destinationText.trim();

    if (!GOOGLE_MAPS_API_KEY) {
      if (!isAutoUpdate) setError('Add your Google Maps API key in App.tsx before requesting routes.');
      return;
    }
    if (!origin) {
      if (!isAutoUpdate) setError('Enter a current location or use GPS.');
      return;
    }
    if (!destination) {
      if (!isAutoUpdate) setError('Enter the patient destination.');
      return;
    }

    isFetchingRouteRef.current = true;
    setRouteLoading(true);
    if (!isAutoUpdate) setError('');

    try {
      const params = [
        `origin=${encodeURIComponent(origin)}`,
        `destination=${encodeURIComponent(destination)}`,
        'mode=driving',
        'alternatives=false',
        'traffic_model=best_guess',
        `departure_time=${Math.floor(Date.now() / 1000)}`,
        `key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`,
      ].join('&');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?${params}`,
      );
      const json = await response.json();

      if (json.status !== 'OK' || !json.routes?.length) {
        if (!isAutoUpdate) setError(json.error_message || `Route not found: ${json.status}`);
        return;
      }

      const route = json.routes[0];
      const leg = route.legs[0];
      const decoded = decodePolyline(route.overview_polyline.points);
      const steps = leg.steps.map((step: any) => ({
        instruction: stripHtml(step.html_instructions),
        distance: step.distance.text,
        duration: step.duration.text,
        endLocation: {
          latitude: step.end_location.lat,
          longitude: step.end_location.lng,
        },
      }));

      setRouteCoordinates(decoded);
      setRouteSteps(steps);
      setActiveStepIndex(0);

      if (liveLocation) {
        lastRouteFetchLocationRef.current = liveLocation;
      }
      lastRouteFetchTimeRef.current = Date.now();

      if (!isAutoUpdate && !directionsActive) {
        setDirectionsActive(false);
      }

      const calculatedEta = leg.duration_in_traffic?.text || leg.duration.text;
      setEta(calculatedEta);
      setDistance(leg.distance.text);
      setDestinationCoordinate({
        latitude: leg.end_location.lat,
        longitude: leg.end_location.lng,
      });

      if (activeEmergency?.id) {
        firestore()
          .collection('emergencies')
          .doc(activeEmergency.id)
          .update({ eta: calculatedEta })
          .catch(e => console.error('Failed to update emergency ETA:', e));
      }

      if (decoded.length > 0 && !directionsActive && !isAutoUpdate) {
        mapRef.current?.fitToCoordinates(decoded, {
          edgePadding: { top: 90, right: 45, bottom: 260, left: 45 },
          animated: true,
        });
      }
    } catch (e: any) {
      console.error('Directions error:', e.message);
      if (!isAutoUpdate) setError('Could not load the route. Check your network and API key.');
    } finally {
      setRouteLoading(false);
      isFetchingRouteRef.current = false;
    }
  };

  const activeStep = routeSteps[activeStepIndex];
  const currentTripStatus = TRIP_STATUS_STEPS[tripStatusIndex];
  const isTripCompleted = currentTripStatus.value === 'trip_completed';

  const startDirections = () => {
    if (!liveLocation) {
      setError('Current GPS location is required to start directions.');
      return;
    }
    if (routeCoordinates.length === 0 || routeSteps.length === 0) {
      setError('Show a route before starting directions.');
      return;
    }

    if (directionsActive) {
      setDirectionsActive(false);
      setIsFollowing(false);
      return;
    }

    setError('');
    setDirectionsActive(true);
    setIsFollowing(true);

    fetchRoute(true);

    mapRef.current?.animateCamera(
      {
        center: liveLocation,
        pitch: 55,
        heading: activeStep ? calculateBearing(liveLocation, activeStep.endLocation) : 0,
        zoom: 17,
      },
      { duration: 650 },
    );
  };

  const advanceTripStatus = async () => {
    if (!driver.docId || tripStatusUpdating || isTripCompleted) return;

    const nextIndex = Math.min(tripStatusIndex + 1, TRIP_STATUS_STEPS.length - 1);
    const nextStatus = TRIP_STATUS_STEPS[nextIndex];

    // Intercept: when advancing to patient_onboard, show hospital selection first
    if (nextStatus.value === 'patient_onboard') {
      setHospitalSearchText(driver['Hospital Name'] || '');
      setShowHospitalModal(true);
      return;
    }

    setTripStatusUpdating(true);
    setError('');

    try {
      if (nextStatus.value === 'trip_completed') {
        const driverRef = firestoreDoc(getFirestore(), 'drivers', driver.docId);
        await updateDoc(driverRef, {
          tripStatus: nextStatus.value,
          Availability: 'available',
          tripCompletedAt: serverTimestamp(),
          tripStatusUpdatedAt: serverTimestamp(),
        });
        setTripStatusIndex(nextIndex);
        onTripComplete();
        return;
      } else {
        await writeTripStatus(nextStatus.value);
      }

      setTripStatusIndex(nextIndex);
    } catch (e: any) {
      console.error('Trip status update:', e.message);
      setError('Could not update trip status. Please try again.');
    } finally {
      setTripStatusUpdating(false);
    }
  };

  const handleHospitalSelected = async (
    hospitalAddress: string,
    hospitalCoordinate: Coordinate | null,
  ) => {
    setShowHospitalModal(false);

    // Update destination to the selected hospital
    setDestinationText(hospitalAddress);
    if (hospitalCoordinate) {
      setDestinationCoordinate(hospitalCoordinate);
    } else {
      setDestinationCoordinate(null);
    }

    // Advance trip status to patient_onboard
    const nextIndex = TRIP_STATUS_STEPS.findIndex(s => s.value === 'patient_onboard');
    if (nextIndex >= 0) {
      setTripStatusUpdating(true);
      setError('');
      try {
        await writeTripStatus('patient_onboard');
        setTripStatusIndex(nextIndex);
      } catch (e: any) {
        console.error('Trip status update:', e.message);
        setError('Could not update trip status. Please try again.');
      } finally {
        setTripStatusUpdating(false);
      }
    }

    // Clear old route data and recalculate from live location to hospital
    setRouteCoordinates([]);
    setRouteSteps([]);
    setActiveStepIndex(0);
    setEta('');
    setDistance('');
    lastRouteFetchLocationRef.current = null;
    lastRouteFetchTimeRef.current = 0;
    isFetchingRouteRef.current = false;

    // Small delay to allow state to settle, then fetch new route
    setTimeout(() => {
      fetchRoute(false);
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={onTripComplete} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.navigationHeaderText}>
          <Text style={styles.navigationTitle}>Driver Navigation</Text>
          <Text style={styles.navigationSubtitle}>{driver['Hospital Name']}</Text>
        </View>
        <TouchableOpacity onPress={onProfile} activeOpacity={0.8}>
          <Avatar name={driver['Name']} size={40} />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        region={liveLocation && routeCoordinates.length === 0 ? initialRegion : undefined}
        showsUserLocation={!directionsActive}
        showsMyLocationButton={false}
        followsUserLocation={false}
        onPanDrag={() => {
          if (directionsActive && isFollowing) setIsFollowing(false);
        }}
      >
        {liveLocation && !directionsActive && (
          <Marker coordinate={liveLocation} title="Driver location" pinColor="#3B82F6" />
        )}
        {liveLocation && directionsActive && (
          <Marker
            coordinate={liveLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <NavigationArrow heading={heading || (activeStep ? calculateBearing(liveLocation, activeStep.endLocation) : 0)} />
          </Marker>
        )}
        {destinationCoordinate && (
          <Marker coordinate={destinationCoordinate} title="Patient destination" pinColor="#FF3B5C" />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={directionsActive ? "#3B82F6" : "#FF3B5C"}
            strokeWidth={directionsActive ? 8 : 5}
          />
        )}
      </MapView>

      {/* ── Draggable Bottom Sheet ── */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            maxHeight: SHEET_MAX_HEIGHT,
            transform: [{ translateY: sheetAnim }],
          },
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <View style={styles.sheetHandle} />
          {!sheetExpanded && (
            <TouchableOpacity onPress={expandSheet} activeOpacity={0.7}>
              <Text style={styles.sheetExpandHint}>Swipe up for trip details</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          nestedScrollEnabled
          scrollEnabled={sheetExpanded}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheetScrollContent}
        >
          <View style={styles.routeInputsRow}>
            <View style={styles.routeInputs}>
              <TextInput
                style={[styles.routeInput, styles.routeInputReadonly]}
                placeholder="Your Location"
                placeholderTextColor="#AAAAAA"
                value={currentLocationText}
                editable={false}
              />
              <GooglePlacesAutocomplete
                placeholder="Patient Address"
                fetchDetails
                minLength={2}
                debounce={300}
                disableScroll={true}
                nearbyPlacesAPI="GooglePlacesSearch"
                enablePoweredByContainer={false}
                onPress={(data, details = null) => {
                  setDestinationText(data.description);
                  if (details?.geometry?.location) {
                    setDestinationCoordinate({
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    });
                  }
                }}
                onFail={e => {
                  console.error('Places autocomplete error:', e);
                  const message =
                    typeof e === 'string'
                      ? e
                      : e?.message || e?.error_message || 'Check Places API access for this key.';
                  setError(`Address suggestions failed: ${message}`);
                }}
                onNotFound={() => {
                  setError('No matching patient address found.');
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                  components: 'country:in',
                }}
                textInputProps={{
                  value: destinationText,
                  onChangeText: text => {
                    setError('');
                    setDestinationText(text);
                    setDestinationCoordinate(null);
                  },
                  placeholderTextColor: '#AAAAAA',
                  autoCapitalize: 'words',
                }}
                styles={{
                  container: styles.placesContainer,
                  textInput: styles.routeInput,
                  listView: styles.placesList,
                  row: styles.placesRow,
                  description: styles.placesDescription,
                  separator: styles.placesSeparator,
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={useCurrentGps}
              disabled={locating}
              activeOpacity={0.8}
            >
              {locating
                ? <ActivityIndicator color="#FF3B5C" />
                : <Text style={styles.gpsButtonText}>⌖</Text>}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.tripStatusCard}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripStepper}
            >
              {TRIP_STATUS_STEPS.map((step, index) => {
                const isActive = index === tripStatusIndex;
                const isDone = index < tripStatusIndex;

                return (
                  <View key={step.value} style={styles.tripStep}>
                    <View style={[
                      styles.tripStepDot,
                      isActive && styles.tripStepDotActive,
                      isDone && styles.tripStepDotDone,
                    ]}>
                      <Text style={[
                        styles.tripStepDotText,
                        (isActive || isDone) && styles.tripStepDotTextActive,
                      ]}>
                        {isDone ? '✓' : index + 1}
                      </Text>
                    </View>
                    <Text style={[
                      styles.tripStepLabel,
                      isActive && styles.tripStepLabelActive,
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.tripStatusActionRow}>
              <View style={styles.tripStatusTextBlock}>
                <Text style={styles.tripStatusLabel}>Trip status</Text>
                <Text style={styles.tripStatusValue}>{currentTripStatus.label}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.tripStatusButton,
                  (tripStatusUpdating || isTripCompleted) && styles.disabledButton,
                ]}
                onPress={advanceTripStatus}
                disabled={tripStatusUpdating || isTripCompleted}
                activeOpacity={0.85}
              >
                {tripStatusUpdating
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.tripStatusButtonText}>{currentTripStatus.action}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, routeLoading && styles.disabledButton]}
            onPress={fetchRoute}
            disabled={routeLoading}
            activeOpacity={0.85}
          >
            {routeLoading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.primaryButtonText}>Show Shortest Route</Text>}
          </TouchableOpacity>

          {(eta || distance) && (
            <View style={styles.routeSummary}>
              <View>
                <Text style={styles.routeSummaryLabel}>ETA</Text>
                <Text style={styles.routeSummaryValue}>{eta || '—'}</Text>
              </View>
              <View>
                <Text style={styles.routeSummaryLabel}>Distance</Text>
                <Text style={styles.routeSummaryValue}>{distance || '—'}</Text>
              </View>
              <View>
                <Text style={styles.routeSummaryLabel}>Updates</Text>
                <Text style={styles.routeSummaryValue}>{liveLocation ? 'Live' : 'Waiting'}</Text>
              </View>
            </View>
          )}

          {/* ── Redesigned Directions Button ── */}
          <TouchableOpacity
            style={[
              styles.directionsButton,
              directionsActive && styles.directionsButtonActive,
              routeSteps.length === 0 && styles.disabledButton,
            ]}
            onPress={startDirections}
            disabled={routeSteps.length === 0}
            activeOpacity={0.85}
          >
            <View style={styles.directionsIconCentered}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z"
                  fill="#FFFFFF"
                />
              </Svg>
            </View>
            <Text style={styles.directionsTitleCentered}>
              {directionsActive ? 'Navigating' : 'Start Navigation'}
            </Text>
            <Text style={styles.directionsSubtitleCentered} numberOfLines={2}>
              {directionsActive && activeStep
                ? `${activeStep.instruction} • ${activeStep.distance}`
                : routeSteps.length > 0
                  ? 'Tap to begin turn-by-turn'
                  : 'Show a route to enable'}
            </Text>
          </TouchableOpacity>

          {routeSteps.length > 0 && (
            <View style={styles.stepsList}>
              {routeSteps.slice(activeStepIndex, activeStepIndex + 4).map((step, index) => (
                <View key={`${step.instruction}-${index}`} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{activeStepIndex + index + 1}</Text>
                  <View style={styles.stepTextBlock}>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    <Text style={styles.stepMeta}>{step.distance} • {step.duration}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Hospital Selection Modal ── */}
      <Modal
        visible={showHospitalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHospitalModal(false)}
      >
        <View style={styles.hospitalModalOverlay}>
          <View style={styles.hospitalModalCard}>
            <View style={styles.hospitalModalHeader}>
              <View>
                <Text style={styles.hospitalModalBadge}>SELECT HOSPITAL</Text>
                <Text style={styles.hospitalModalTitle}>Where to take the patient?</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHospitalModal(false)}
                style={styles.hospitalModalClose}
                activeOpacity={0.7}
              >
                <Text style={styles.hospitalModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.hospitalModalBody}>
              <GooglePlacesAutocomplete
                placeholder="Search hospital address..."
                fetchDetails
                minLength={2}
                debounce={300}
                nearbyPlacesAPI="GooglePlacesSearch"
                enablePoweredByContainer={false}
                onPress={(data, details = null) => {
                  const coord = details?.geometry?.location
                    ? { latitude: details.geometry.location.lat, longitude: details.geometry.location.lng }
                    : null;
                  handleHospitalSelected(data.description, coord);
                }}
                onFail={e => {
                  console.error('Hospital places error:', e);
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                  components: 'country:in',
                  type: 'hospital',
                }}
                textInputProps={{
                  value: hospitalSearchText,
                  onChangeText: setHospitalSearchText,
                  placeholderTextColor: '#AAAAAA',
                  autoCapitalize: 'words',
                  autoFocus: true,
                }}
                styles={{
                  container: { flex: 0, zIndex: 20 },
                  textInput: styles.hospitalModalInput,
                  listView: styles.hospitalModalList,
                  row: styles.placesRow,
                  description: styles.placesDescription,
                  separator: styles.placesSeparator,
                }}
              />
            </View>

            <View style={styles.hospitalModalFooter}>
              <TouchableOpacity
                style={styles.hospitalModalSkipBtn}
                onPress={() => {
                  // Skip hospital selection — proceed with existing destination
                  handleHospitalSelected(
                    destinationText || driver['Hospital Name'] || '',
                    destinationCoordinate,
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.hospitalModalSkipText}>Use Current Destination</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Profile (with Sign Out)
// ═════════════════════════════════════════════════════════════════════════════
const ProfileScreen = ({
  driver, onBack, onLogout,
}: {
  driver: Driver; onBack: () => void; onLogout: () => void;
}) => {
  const [profileData, setProfileData] = useState<Driver | null>(driver);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const fetchDriverProfile = async () => {
      setLoading(true);
      setError('');

      try {
        let docRef;

        if (driver?.docId) {
          docRef = firestore().collection('drivers').doc(driver.docId);
        } else if (driver?.['Email ID']) {
          const snap = await firestore()
            .collection('drivers')
            .where('Email ID', '==', driver['Email ID'])
            .limit(1)
            .get();

          if (!snap.empty) {
            docRef = snap.docs[0].ref;
          }
        }

        if (docRef) {
          unsubscribe = docRef.onSnapshot(
            snapshot => {
              if (snapshot.exists) {
                const data = snapshot.data();
                setProfileData({ ...data, docId: snapshot.id } as Driver);
              } else {
                setError('Driver profile not found in database.');
              }
              setLoading(false);
            },
            err => {
              console.error('Profile snapshot error:', err);
              setError('Failed to load profile details.');
              setLoading(false);
            },
          );
        } else {
          setProfileData(driver);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        setError('Error connecting to database.');
        setLoading(false);
      }
    };

    fetchDriverProfile();

    return () => {
      unsubscribe();
    };
  }, [driver]);

  const fields: { label: string; key: keyof Driver; icon: string }[] = [
    { label: 'Name',           key: 'Name',          icon: '👤' },
    { label: 'Role',           key: 'Role',          icon: '🪪' },
    { label: 'Email',          key: 'Email ID',      icon: '✉️' },
    { label: 'Phone Number',   key: 'Phone Number',  icon: '📞' },
    { label: 'Gender',         key: 'Gender',        icon: '⚧'  },
    { label: 'City',           key: 'City',          icon: '🏙️' },
    { label: 'State',          key: 'State',         icon: '📍' },
    { label: 'Hospital Name',  key: 'Hospital Name', icon: '🏥' },
    { label: 'License Number', key: 'licenseNumber', icon: '📄' },
    { label: 'Aadhaar Number', key: 'aadhaarNumber', icon: '🆔' },
    { label: 'Hospital ID',    key: 'hospitalId',    icon: '🏢' },
  ];

  const getFieldValue = (val: any): string => {
    if (val === undefined || val === null) return 'Not available';
    const str = String(val).trim();
    return str.length > 0 ? str : 'Not available';
  };

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

  const currentProfile = profileData || driver;
  const driverName = currentProfile['Name'] || '';
  const driverRole = currentProfile['Role'] || '';

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

      {loading && !profileData ? (
        <View style={styles.profileLoadingContainer}>
          <ActivityIndicator size="large" color="#FF3B5C" />
          <Text style={styles.profileLoadingText}>Loading profile details...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.profileErrorBanner}>
              <Text style={styles.profileErrorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Avatar block */}
          <View style={styles.profileTop}>
            <Avatar name={driverName || 'Driver'} size={80} />
            <Text style={styles.profileName}>{getFieldValue(driverName)}</Text>
            <Text style={styles.profileRole}>{getFieldValue(driverRole)}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ Verified Driver
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
                    {getFieldValue(currentProfile[f.key])}
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
      )}
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// EMERGENCY REQUEST MODAL
// ═════════════════════════════════════════════════════════════════════════════
const EmergencyRequestModal = ({
  emergency,
  visible,
  onAccept,
  onReject,
  processing,
}: {
  emergency: Emergency | null;
  visible: boolean;
  onAccept: (emerg: Emergency) => void;
  onReject: (emerg: Emergency) => void;
  processing: boolean;
}) => {
  if (!emergency || !visible) return null;

  const priorityLower = (emergency.priority || 'medium').toLowerCase();
  let priorityStyle = styles.priorityMedium;
  if (priorityLower.includes('critical')) priorityStyle = styles.priorityCritical;
  else if (priorityLower.includes('high')) priorityStyle = styles.priorityHigh;
  else if (priorityLower.includes('low')) priorityStyle = styles.priorityLow;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderBadge}>🚨 EMERGENCY DISPATCH REQUEST</Text>
            <View style={[styles.priorityBadge, priorityStyle]}>
              <Text style={styles.priorityBadgeText}>
                {(emergency.priority || 'NORMAL').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailIcon}>👤</Text>
              <View style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>PATIENT NAME</Text>
                <Text style={styles.modalDetailValue}>
                  {emergency.patientName || 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailIcon}>📋</Text>
              <View style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>INCIDENT TYPE</Text>
                <Text style={styles.modalDetailValue}>
                  {emergency.incidentType || 'General Emergency'}
                </Text>
              </View>
            </View>

            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailIcon}>📍</Text>
              <View style={styles.modalDetailText}>
                <Text style={styles.modalDetailLabel}>PICKUP ADDRESS</Text>
                <Text style={styles.modalDetailValue} numberOfLines={3}>
                  {emergency.address || 'Address unavailable'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[styles.modalRejectButton, processing && styles.disabledButton]}
              onPress={() => onReject(emergency)}
              disabled={processing}
              activeOpacity={0.8}
            >
              <Text style={styles.modalRejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalAcceptButton, processing && styles.disabledButton]}
              onPress={() => onAccept(emergency)}
              disabled={processing}
              activeOpacity={0.8}
            >
              {processing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalAcceptButtonText}>Accept & Navigate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  const [homeAvailability, setHomeAvailability] =
    useState<AvailabilityStatus>('available');
  const [markHomeAvailable, setMarkHomeAvailable] = useState(true);

  // Emergency request states
  const [incomingEmergency, setIncomingEmergency] = useState<Emergency | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const handledEmergencyIds = useRef<Set<string>>(new Set());

  // Listen for emergency requests assigned specifically to this driver
  useEffect(() => {
    if (!driver) return;

    const unsubscribe = firestore()
      .collection('emergencies')
      .where('status', '==', 'requested')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) {
            setIncomingEmergency(null);
            return;
          }

          const candidate = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Emergency))
            .find(emerg => {
              if (handledEmergencyIds.current.has(emerg.id)) return false;

              // Check if driver is active/available (must not be logged out or inactive)
              const isDriverActive =
                homeAvailability === 'available' || homeAvailability === 'busy';
              if (!isDriverActive) return false;

              // Match driver identity (driverName or driverId)
              const driverNameMatch =
                emerg.driverName &&
                driver['Name'] &&
                emerg.driverName.trim().toLowerCase() === driver['Name'].trim().toLowerCase();

              const driverIdMatch =
                (emerg.driverId && driver.docId && emerg.driverId === driver.docId) ||
                (emerg.driverId && driver.uid && emerg.driverId === driver.uid);

              const isDriverMatch = driverNameMatch || driverIdMatch;

              // Match hospital identity (hospitalId or Hospital Name)
              const hospitalIdMatch =
                (emerg.hospitalId && driver.hospitalId && emerg.hospitalId === driver.hospitalId) ||
                (emerg.hospitalId && driver['Hospital Name'] && emerg.hospitalId.trim().toLowerCase() === driver['Hospital Name'].trim().toLowerCase());

              const isHospitalMatch = !emerg.hospitalId || hospitalIdMatch;

              return isDriverMatch && isHospitalMatch;
            });

          if (candidate) {
            setIncomingEmergency(candidate);
          } else {
            setIncomingEmergency(null);
          }
        },
        err => {
          console.error('Emergency request listener error:', err);
        },
      );

    return () => unsubscribe();
  }, [driver, homeAvailability]);

  const handleAcceptEmergency = async (emerg: Emergency) => {
    if (processingAction) return;
    setProcessingAction(true);
    try {
      handledEmergencyIds.current.add(emerg.id);

      await firestore()
        .collection('emergencies')
        .doc(emerg.id)
        .update({
          status: 'accepted',
          acceptedAt: serverTimestamp(),
        });

      setActiveEmergency(emerg);
      setIncomingEmergency(null);
      setHomeAvailability('busy');
      setMarkHomeAvailable(false);
      setScreen('maps');
    } catch (err: any) {
      console.error('Accept emergency error:', err);
      Alert.alert('Error', 'Could not accept emergency request.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectEmergency = async (emerg: Emergency) => {
    if (processingAction) return;
    setProcessingAction(true);
    try {
      handledEmergencyIds.current.add(emerg.id);

      await firestore()
        .collection('emergencies')
        .doc(emerg.id)
        .update({
          status: 'rejected',
          rejectedAt: serverTimestamp(),
        });

      setIncomingEmergency(null);
    } catch (err: any) {
      console.error('Reject emergency error:', err);
      Alert.alert('Error', 'Could not reject emergency request.');
    } finally {
      setProcessingAction(false);
    }
  };

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
        await stopPersistentDriverTracking();
        await firestore()
          .collection('drivers')
          .doc(driver.docId)
          .update({
            Availability: 'inactive',
            tripStatus: FieldValue.delete(),
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
    setHomeAvailability('available');
    setMarkHomeAvailable(true);
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

  let activeScreenContent = null;

  if (screen === 'profile' && driver) {
    activeScreenContent = (
      <ProfileScreen
        driver={driver}
        onBack={() => setScreen('home')}
        onLogout={handleLogout}
      />
    );
  } else if (screen === 'maps' && driver) {
    activeScreenContent = (
      <MapsScreen
        driver={driver}
        activeEmergency={activeEmergency}
        onTripComplete={() => {
          setActiveEmergency(null);
          setHomeAvailability('busy');
          setMarkHomeAvailable(false);
          setScreen('home');
        }}
        onProfile={() => setScreen('profile')}
      />
    );
  } else if (screen === 'home' && driver) {
    activeScreenContent = (
      <HomeScreen
        driver={driver}
        initialAvailability={homeAvailability}
        markAvailableOnMount={markHomeAvailable}
        onAvailabilityChange={setHomeAvailability}
        onProfile={() => setScreen('profile')}
        onOpenMaps={() => setScreen('maps')}
      />
    );
  } else if (screen === 'otp') {
    activeScreenContent = (
      <OtpScreen
        email={email}
        expectedOtp={otp}
        otpExpiry={expiry}
        onVerified={() => {
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
  } else {
    activeScreenContent = (
      <EmailScreen
        onOtpSent={(em, o, ex, driverData) => {
          setEmail(em);
          setOtp(o);
          setExpiry(ex);
          setDriver(driverData);
          setScreen('otp');
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {activeScreenContent}
      <EmergencyRequestModal
        emergency={incomingEmergency}
        visible={incomingEmergency !== null}
        onAccept={handleAcceptEmergency}
        onReject={handleRejectEmergency}
        processing={processingAction}
      />
    </View>
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

  navigationHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  navigationHeaderText: { flex: 1, marginHorizontal: 12 },
  navigationTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
  navigationSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  map: { flex: 1 },
  routePanel: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    maxHeight: '58%',
    overflow: 'visible',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'visible',
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  sheetExpandHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  routeInputsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    zIndex: 10,
  },
  routeInputs: { flex: 1 },
  routeInput: {
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    fontSize: 14,
    color: '#222',
  },
  routeInputReadonly: { color: '#555' },
  placesContainer: { flex: 0, zIndex: 20 },
  placesList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: -4,
    elevation: 8,
    zIndex: 30,
  },
  placesRow: { paddingHorizontal: 14, paddingVertical: 12 },
  placesDescription: { color: '#111', fontSize: 13, fontWeight: '600' },
  placesSeparator: { height: 1, backgroundColor: '#F5F5F5' },
  tripStatusCard: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  tripStepper: { paddingBottom: 10 },
  tripStep: {
    width: 86,
    alignItems: 'center',
    marginRight: 6,
  },
  tripStepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tripStepDotActive: { backgroundColor: '#FF3B5C' },
  tripStepDotDone: { backgroundColor: '#22C55E' },
  tripStepDotText: { color: '#888', fontSize: 11, fontWeight: '800' },
  tripStepDotTextActive: { color: '#FFF' },
  tripStepLabel: {
    color: '#888',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  tripStepLabelActive: { color: '#111' },
  tripStatusActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  tripStatusTextBlock: { flex: 1, marginRight: 10 },
  tripStatusLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  tripStatusValue: { fontSize: 14, color: '#111', fontWeight: '800' },
  tripStatusButton: {
    minWidth: 132,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tripStatusButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  gpsButton: {
    width: 48,
    height: 96,
    marginLeft: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD6DD',
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButtonText: { fontSize: 24, color: '#FF3B5C', fontWeight: '800' },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 10,
  },
  routeSummaryLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  routeSummaryValue: { fontSize: 14, color: '#111', fontWeight: '800' },
  directionsButton: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD6DD',
  },
  directionsButtonActive: {
    backgroundColor: '#F0FFF4',
    borderColor: '#BBF7D0',
  },
  directionsIconCentered: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  directionsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  directionsIconText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  directionsTextBlock: { flex: 1 },
  directionsTitleCentered: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  directionsSubtitleCentered: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  directionsTitle: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  directionsSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  directionsChevron: {
    color: '#FF3B5C',
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 10,
  },
  hospitalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  hospitalModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: screenHeight * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  hospitalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 14,
  },
  hospitalModalBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF3B5C',
    letterSpacing: 1,
    marginBottom: 4,
  },
  hospitalModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  hospitalModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalModalCloseText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '700',
  },
  hospitalModalBody: {
    flex: 1,
    minHeight: 200,
    zIndex: 20,
  },
  hospitalModalInput: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#FFD6DD',
  },
  hospitalModalList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 4,
    elevation: 8,
    zIndex: 30,
  },
  hospitalModalFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 14,
  },
  hospitalModalSkipBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD6DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalModalSkipText: {
    color: '#FF3B5C',
    fontSize: 14,
    fontWeight: '700',
  },
  turnCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD6DD',
  },
  turnLabel: {
    fontSize: 11,
    color: '#FF3B5C',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  turnInstruction: {
    fontSize: 16,
    lineHeight: 22,
    color: '#111',
    fontWeight: '800',
  },
  turnMeta: { fontSize: 12, color: '#888', fontWeight: '600', marginTop: 4 },
  stepsList: { maxHeight: 145 },
  stepRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF3B5C',
    color: '#FFF',
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },
  stepTextBlock: { flex: 1 },
  stepInstruction: { fontSize: 13, color: '#111', fontWeight: '700', lineHeight: 18 },
  stepMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  navTopBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navTurnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTurnIconText: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  navTurnText: { flex: 1 },
  navDistanceText: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  navInstructionText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabRecenter: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: { fontSize: 20 },
  fabRecenterText: { fontSize: 15, fontWeight: '700', color: '#3B82F6', marginLeft: 8 },

  navBottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  navSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navEtaText: { fontSize: 26, fontWeight: '800', color: '#22C55E' },
  navDistanceSubtext: { fontSize: 14, color: '#64748B', fontWeight: '600', marginTop: 2 },
  navExitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navExitText: { color: '#FF3B5C', fontSize: 18, fontWeight: '900' },

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

  profileLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  profileLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  profileErrorBanner: {
    marginHorizontal: 24,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFEAEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCACA',
  },
  profileErrorBannerText: {
    color: '#FF3B5C',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  modalHeaderBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF3B5C',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priorityCritical: { backgroundColor: '#FFEAEA' },
  priorityHigh: { backgroundColor: '#FFF7ED' },
  priorityMedium: { backgroundColor: '#FEFCE8' },
  priorityLow: { backgroundColor: '#EFF6FF' },

  modalBody: {
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalDetailIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  modalDetailText: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalDetailValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalRejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD6DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRejectButtonText: {
    color: '#FF3B5C',
    fontSize: 15,
    fontWeight: '700',
  },
  modalAcceptButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalAcceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
