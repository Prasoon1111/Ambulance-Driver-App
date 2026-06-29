import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export function subscribeToEmergencies(hospitalId, callback) {
  if (!hospitalId) return () => {};

  const q = query(
    collection(db, 'emergencies'),
    where('hospitalId', '==', hospitalId),
    orderBy('startTime', 'desc')
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}