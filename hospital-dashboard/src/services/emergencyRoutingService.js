import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const URBAN_RESPONSE_SPEED_KMH = 32;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(origin, destination) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.latitude - origin.latitude);
  const lonDelta = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);
  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function estimateEta(distanceKm) {
  const minutes = Math.max(2, Math.ceil((distanceKm / URBAN_RESPONSE_SPEED_KMH) * 60));
  return `${minutes} mins`;
}

function toCoordinate(location) {
  return [location.latitude || location.lat, location.longitude || location.lng];
}

export async function fetchNearestAmbulance(emergency) {
  if (!emergency?.location) {
    throw new Error('Emergency location is missing');
  }

  const snap = await getDocs(
    query(
      collection(db, 'ambulances'),
      where('hospitalId', '==', emergency.hospitalId),
      where('approvalStatus', '==', 'approved')
    )
  );

  if (snap.empty) {
    throw new Error('No approved ambulances found for this hospital');
  }

  const liveSnap = await getDocs(
    query(
      collection(db, 'live_locations'),
      where('hospitalId', '==', emergency.hospitalId)
    )
  );

  const liveMap = {};
  liveSnap.docs.forEach((item) => {
    const data = item.data();
    liveMap[item.id] = {
      latitude: data.lat,
      longitude: data.lng,
    };
  });

  const ambulances = snap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((a) => !a.activeDriverId)
    .map((a) => ({
      ...a,
      location: liveMap[a.id] || null,
    }))
    .filter((a) => a.location);

  if (ambulances.length === 0) {
    throw new Error('No ambulances with live GPS location available');
  }

  const nearest = ambulances
    .map((a) => ({
      ...a,
      distanceToEmergencyKm: calculateDistanceKm(a.location, emergency.location),
    }))
    .sort((a, b) => a.distanceToEmergencyKm - b.distanceToEmergencyKm)[0];

  const totalDistanceKm = nearest.distanceToEmergencyKm;

  return {
    ambulanceId: nearest.id,
    driverName: nearest.assignedDriverName || 'On Duty Driver',
    status: nearest.approvalStatus,
    eta: estimateEta(totalDistanceKm),
    distance: `${totalDistanceKm.toFixed(1)} km`,
    distanceKm: Number(totalDistanceKm.toFixed(2)),
    currentLocation: nearest.location,
    emergencyLocation: emergency.location,
    emergencyId: emergency.id,
    emergencyTitle: emergency.incidentType || emergency.id,
    emergencyPriority: emergency.priority,
    routeCoordinates: [
      toCoordinate(nearest.location),
      toCoordinate(emergency.location),
    ],
  };
}