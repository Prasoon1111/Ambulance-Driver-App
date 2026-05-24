import { useEffect, useState } from 'react';
import { markNotificationRead, subscribeHospitalData, getHospitalSnapshot } from '../services/hospitalDataService';

export function useNotifications({ hospitalId } = {}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!hospitalId) return undefined;
    return subscribeHospitalData(() => {
      setNotifications(
        getHospitalSnapshot(hospitalId).notifications
          .map((note) => ({
            ...note,
            title: note.type.replaceAll('_', ' '),
            timestamp: note.createdAt,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    });
  }, [hospitalId]);

  return {
    notifications,
    markRead: (notificationId) => markNotificationRead(notificationId, hospitalId),
  };
}
