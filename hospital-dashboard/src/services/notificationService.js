import { collection, onSnapshot, orderBy, query, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export function subscribeToNotifications(hospitalId, callback) {
  if (!hospitalId) return () => {};

  const q = query(
    collection(db, 'notifications'),
    where('hospitalId', '==', hospitalId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
      title: item.data().type?.replaceAll('_', ' ') || item.data().title || 'Notification',
      message: item.data().message || '',
      timestamp: item.data().createdAt,
      read: item.data().read || false,
    }));
    callback(notifications);
  });
}

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}