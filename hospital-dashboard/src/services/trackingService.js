import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function writeActiveDriverLocation({ driverUid, ambulanceId, latitude, longitude }) {
  await updateDoc(doc(db, 'live_locations', ambulanceId), {
    driverUid,
    ambulanceId,
    lat: latitude,
    lng: longitude,
    updatedAt: serverTimestamp(),
  });
}