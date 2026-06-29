import { useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';

export function useEmergencies() {
  const { user } = useContext(AuthContext);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.hospitalId) return undefined;

    const q = query(
      collection(db, 'emergencies'),
      where('hospitalId', '==', user.hospitalId),
      orderBy('startTime', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEmergencies(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [user?.hospitalId]);

  const activeCount = emergencies.filter((e) => e.status === 'active').length;
  const criticalCount = emergencies.filter((e) => e.priority === 'critical').length;
  const highPriorityCount = emergencies.filter((e) => e.priority === 'high').length;
  const dispatchedCount = emergencies.filter((e) => e.status === 'dispatched').length;

  return {
    emergencies,
    loading,
    error,
    activeCount,
    criticalCount,
    highPriorityCount,
    dispatchedCount,
    totalCount: emergencies.length,
  };
}

export function useEmergency(emergencyId) {
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!emergencyId) return undefined;

    const unsub = onSnapshot(
      doc(db, 'emergencies', emergencyId),
      (snap) => {
        setEmergency(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [emergencyId]);

  return { emergency, loading, error };
}

export function useEmergencyStats() {
  const { emergencies, activeCount, criticalCount, highPriorityCount, dispatchedCount, totalCount } = useEmergencies();

  const averageEta = emergencies.length
    ? Math.round(
        emergencies.reduce((sum, e) => {
          const match = e.eta?.match(/(\d+)/);
          return sum + (match ? parseInt(match[1], 10) : 0);
        }, 0) / emergencies.length
      )
    : 0;

  const systemStatus = () => {
    if (totalCount === 0) return 'idle';
    if (criticalCount > 0) return 'critical';
    if (activeCount > 0) return 'active';
    if (dispatchedCount > 0) return 'monitoring';
    return 'standby';
  };

  return {
    totalCount,
    activeCount,
    criticalCount,
    highPriorityCount,
    dispatchedCount,
    averageEta,
    systemStatus: systemStatus(),
  };
}