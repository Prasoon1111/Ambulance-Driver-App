import { useContext, useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { clearDriverGpsSession, getHospitalById, startDriverGpsSession, writeDriverLocation } from '../services/hospitalDataService';

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
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState('');
  const [lastLocation, setLastLocation] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const assignedHospital = getHospitalById(user.hospitalId);

  useEffect(() => {
    if (user.requiresPasswordChange) {
      return undefined;
    }

    let watchId = null;
    let activeSession = null;

    try {
      const nextSession = startDriverGpsSession(user.uid);
      activeSession = nextSession;
      setSession(nextSession);
      setLastLocation({ lat: nextSession.location.lat, lng: nextSession.location.lng });

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const nextLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            setLastLocation((previousLocation) => {
              if (!previousLocation || distanceInMetres(previousLocation, nextLocation) >= 10) {
                writeDriverLocation({
                  driverUid: user.uid,
                  ambulanceId: nextSession.ambulance.id,
                  lat: nextLocation.lat,
                  lng: nextLocation.lng,
                });
                return nextLocation;
              }
              return previousLocation;
            });
          },
          () => setMessage('Location permission is needed to update ambulance GPS.'),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
      }
    } catch (error) {
      setMessage(error.message === 'Your account is pending admin approval.' ? error.message : 'Unable to start driver session.');
      logout();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (activeSession) {
        clearDriverGpsSession({ driverUid: user.uid, ambulanceId: activeSession.ambulance.id });
      }
    };
  }, [logout, user.uid, user.requiresPasswordChange]);

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

  function writeMockGps() {
    if (!session) return;
    const nextCoords = {
      lat: (lastLocation?.lat || session.location.lat) + 0.0001,
      lng: (lastLocation?.lng || session.location.lng) + 0.0001,
    };
    writeDriverLocation({ driverUid: user.uid, ambulanceId: session.ambulance.id, ...nextCoords });
    setLastLocation(nextCoords);
    setMessage('GPS location written by active driver device.');
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
            <Button type="primary" htmlType="submit" loading={passwordLoading}>Set password</Button>
          </form>
        )}
        {!user.requiresPasswordChange && session && (
          <div className="ops-details">
            <strong>{session.driver.fullName}</strong>
            <span>You are assigned to {assignedHospital?.name || 'your hospital'}</span>
            <span>{assignedHospital?.address || 'Address not available'}</span>
            <span>Ambulance: {session.ambulance.numberPlate}</span>
            <span>activeDriverId: {session.ambulance.activeDriverId}</span>
            <Button type="primary" onClick={writeMockGps}>Write 10m GPS update</Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default DriverApp;
