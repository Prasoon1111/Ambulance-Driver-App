import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useNotifications({ hospitalId } = {}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!hospitalId) return undefined;

    const q = query(
      collection(db, 'notifications'),
      where('hospitalId', '==', hospitalId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          title: item.data().type?.replaceAll('_', ' ') || item.data().title || 'Notification',
          message: item.data().message || '',
          timestamp: item.data().createdAt,
          read: item.data().read || false,
        }))
      );
    });

    return unsub;
  }, [hospitalId]);

  async function markRead(notificationId) {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  }

  return { notifications, markRead };
}