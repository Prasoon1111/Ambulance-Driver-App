import { useEffect, useState } from 'react';
import { subscribeToEmergencies, startRealTimeSimulation } from '../services/emergencyService';

/**
 * Custom hook for managing real-time emergencies
 * Features:
 * - Live emergency subscriptions
 * - Real-time simulation engine
 * - Emergency statistics (active, critical, etc.)
 * - Automatic cleanup
 *
 * Future: When Firebase is integrated, this hook will automatically
 * work with Firestore onSnapshot listeners without component changes.
 *
 * @param {Object} options - Hook configuration
 * @param {boolean} options.autoStart - Auto-start real-time simulation (default: true)
 * @returns {Object} { emergencies, loading, error, activeCount, criticalCount, highPriorityCount }
 */
export function useEmergencies(options = {}) {
  const { autoStart = true } = options;
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stopSimulation = null;

    try {
      // Start real-time simulation engine
      if (autoStart) {
        stopSimulation = startRealTimeSimulation();
      }

      // Subscribe to emergency updates
      // Future: This will automatically work with Firestore onSnapshot
      const unsubscribe = subscribeToEmergencies((updatedEmergencies) => {
        setEmergencies(updatedEmergencies);
        setLoading(false);
      });

      // Cleanup on unmount
      return () => {
        unsubscribe();
        if (stopSimulation) {
          stopSimulation();
        }
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return () => {
        if (stopSimulation) {
          stopSimulation();
        }
      };
    }
  }, [autoStart]);

  // Calculate statistics
  const activeCount = emergencies.filter((e) => e.status === 'active').length;
  const criticalCount = emergencies.filter((e) => e.priority === 'critical').length;
  const highPriorityCount = emergencies.filter((e) => e.priority === 'high').length;
  const dispatchedCount = emergencies.filter((e) => e.status === 'dispatched').length;

  return {
    emergencies,
    loading,
    error,
    // Statistics
    activeCount,
    criticalCount,
    highPriorityCount,
    dispatchedCount,
    totalCount: emergencies.length,
    // Helper methods
    getCriticalEmergencies: () => emergencies.filter((e) => e.priority === 'critical'),
    getHighPriorityEmergencies: () => emergencies.filter((e) => e.priority === 'high'),
    getActiveEmergencies: () => emergencies.filter((e) => e.status === 'active'),
    getEmergencyById: (id) => emergencies.find((e) => e.id === id),
  };
}

/**
 * Hook to get a single emergency with real-time updates
 * @param {string} emergencyId - Emergency ID to monitor
 * @returns {Object} { emergency, loading, error }
 */
export function useEmergency(emergencyId) {
  const { emergencies, loading, error } = useEmergencies({ autoStart: false });
  const emergency = emergencies.find((e) => e.id === emergencyId);

  return {
    emergency,
    loading,
    error,
  };
}

/**
 * Hook for emergency statistics and monitoring
 * Provides calculated statistics for dashboard widgets
 * @returns {Object} Statistics object
 */
export function useEmergencyStats() {
  const {
    emergencies,
    activeCount,
    criticalCount,
    highPriorityCount,
    dispatchedCount,
    totalCount,
  } = useEmergencies();

  // Calculate average ETA
  const averageEta = emergencies.length
    ? Math.round(
        emergencies.reduce((sum, e) => {
          const match = e.eta?.match(/(\d+)/);
          return sum + (match ? parseInt(match[1], 10) : 0);
        }, 0) / emergencies.length
      )
    : 0;

  // Determine system status
  const getSystemStatus = () => {
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
    systemStatus: getSystemStatus(),
  };
}
