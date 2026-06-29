import { useContext, useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function distanceInMetres(previous, next) {
  const radius = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(next.lat - previous.lat);
  const dLng = toRadians(next.lng - previous.lng);
  const lat1 = toRadians(previous.lat);
  const lat2 = toRadians(next.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function DriverApp() {
  const { user, logout, completeDriverPasswordChange } = useContext(AuthContext);
  const [ambulance, setAmbulance] = useState(null);
  const [message, setMessage] = useState('');
  const [lastLocation, setLastLocation] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || user.requiresPasswordChange) return;

    const q = query(
      collection(db, 'ambulances'),
      where('assignedDrivers', 'array-contains', user.uid),
      where('approvalStatus', '==', 'approved')
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAmbulance({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setMessage('No approved ambulance assigned to you yet.');
      }
    });

    return unsub;
  }, [user?.uid, user?.requiresPasswordChange]);

  useEffect(() => {
    if (!ambulance || user.requiresPasswordChange) return;

    let watchId = null;

    async function startSession() {
      await updateDoc(doc(db, 'ambulances', ambulance.id), {
        activeDriverId: user.uid,
      });

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setLastLocation((prev) => {
            if (!prev || distanceInMetres(prev, nextLocation) >= 10) {
              setDoc(doc(db, 'live_locations', ambulance.id), {
                ambulanceId: ambulance.id,
                driverUid: user.uid,
                hospitalId: user.hospitalId,
                lat: nextLocation.lat,
                lng: nextLocation.lng,
                updatedAt: serverTimestamp(),
              });
              return nextLocation;
            }
            return prev;
          });
        },
        () => setMessage('Location permission is needed to update ambulance GPS.'),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    startSession();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      updateDoc(doc(db, 'ambulances', ambulance.id), { activeDriverId: null });
    };
  }, [ambulance, user]);

  async function handlePasswordChange(event) {
    event.preventDefault();
    setMessage('');
    setPasswordLoading(true);
    try {
      await completeDriverPasswordChange(newPassword);
      setNewPassword('');
      setMessage('Password updated. Driver app access granted.');
    } catch (error) {
      setMessage(error.message || 'Unable to update password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Driver app</p>
        <h2>Approved Driver Session</h2>
      </div>
      <div className="panel">
        {message && <div className="status-card submitted">{message}</div>}
        {user.requiresPasswordChange && (
          <form className="ops-details" onSubmit={handlePasswordChange}>
            <strong>Set New Password</strong>
            <span>Your phone number was only a temporary credential. Set a new password before using the driver app.</span>
            <Input.Password
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              minLength={8}
              required
            />
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              Set password
            </Button>
          </form>
        )}
        {!user.requiresPasswordChange && ambulance && (
          <div className="ops-details">
            <strong>{user.displayName || user.email}</strong>
            <span>Hospital: {user.hospitalName || 'Your Hospital'}</span>
            <span>Ambulance: {ambulance.numberPlate}</span>
            <span>GPS tracking is active</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default DriverApp;