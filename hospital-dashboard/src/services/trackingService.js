import { writeDriverLocation } from './hospitalDataService';

let subscribers = [];

export function subscribeToTracking(callback) {
  // TODO: Replace with Firestore onSnapshot of driver GPS docs
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((c) => c !== callback);
  };
}

export function notifyTrackingUpdate(data) {
  subscribers.forEach((cb) => cb(data));
}

// TODO: Integrate with GPS provider and call notifyTrackingUpdate on updates

export function writeActiveDriverLocation({ driverUid, ambulanceId, latitude, longitude }) {
  writeDriverLocation({
    driverUid,
    ambulanceId,
    lat: latitude,
    lng: longitude,
  });
  notifyTrackingUpdate({ driverUid, ambulanceId, latitude, longitude });
}
