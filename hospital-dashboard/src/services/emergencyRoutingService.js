import { hospitalMarker, mockEmergencies } from '../mock/emergencies';
import { mockAmbulances } from '../mock/mockAmbulances';
import { getMockEmergencyById } from './emergencyService';

const AVAILABLE_STATUSES = new Set(['available', 'standby', 'idle']);
const URBAN_RESPONSE_SPEED_KMH = 32;

function toCoordinate(location) {
  return [location.latitude, location.longitude];
}

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
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function estimateEta(distanceKm) {
  const minutes = Math.max(2, Math.ceil((distanceKm / URBAN_RESPONSE_SPEED_KMH) * 60));
  return `${minutes} mins`;
}

function getAvailableAmbulances() {
  return mockAmbulances.filter((ambulance) => AVAILABLE_STATUSES.has(ambulance.status));
}

function getEmergency(id) {
  return getMockEmergencyById(id) || mockEmergencies.find((emergency) => emergency.id === id);
}

function normalizeEmergency(emergencyOrId) {
  if (typeof emergencyOrId === 'string') {
    return getEmergency(emergencyOrId);
  }

  return emergencyOrId;
}

export async function getNearestAmbulanceForEmergency(emergencyOrId) {
  const emergency = normalizeEmergency(emergencyOrId);

  if (!emergency) {
    throw new Error('Emergency was not found');
  }

  const availableAmbulances = getAvailableAmbulances();

  if (availableAmbulances.length === 0) {
    throw new Error('No available ambulances are currently reporting standby status');
  }

  const nearest = availableAmbulances
    .map((ambulance) => ({
      ...ambulance,
      distanceToEmergencyKm: calculateDistanceKm(ambulance.location, emergency.location),
    }))
    .sort((first, second) => first.distanceToEmergencyKm - second.distanceToEmergencyKm)[0];

  const hospitalDistanceKm = calculateDistanceKm(emergency.location, hospitalMarker.location);
  const totalDistanceKm = nearest.distanceToEmergencyKm + hospitalDistanceKm;

  return {
    ambulanceId: nearest.id,
    driverName: nearest.driverName,
    status: nearest.status,
    eta: estimateEta(totalDistanceKm),
    distance: `${totalDistanceKm.toFixed(1)} km`,
    distanceKm: Number(totalDistanceKm.toFixed(2)),
    currentLocation: nearest.location,
    emergencyLocation: emergency.location,
    hospitalLocation: hospitalMarker.location,
    emergencyId: emergency.id,
    emergencyTitle: emergency.incidentType || emergency.title || emergency.id,
    emergencyPriority: emergency.priority,
    routeCoordinates: [
      toCoordinate(nearest.location),
      toCoordinate(emergency.location),
      toCoordinate(hospitalMarker.location),
    ],
  };
}

// Temporary API-shaped adapter for GET /api/emergency/:id/nearest-ambulance.
// Replace this function body with an Axios/fetch call when the backend route exists.
export async function fetchNearestAmbulance(emergencyOrId) {
  return getNearestAmbulanceForEmergency(emergencyOrId);
}
