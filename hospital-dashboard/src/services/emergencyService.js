import { mockEmergencies as originalMockEmergencies } from '../mock/emergencies';

// ========================================
// REAL-TIME SIMULATION STATE MANAGEMENT
// ========================================
// This architecture is Firebase-ready. When backend is ready:
// Replace these mock functions with Firestore onSnapshot() listeners
// and live GPS updates from the driver app.

// In-memory storage for simulated real-time state
let simulatedEmergencies = JSON.parse(JSON.stringify(originalMockEmergencies));
let activeSubscriptions = [];

/**
 * Simulates an emergency status change
 * Future: Replace with Firestore document updates
 */
export function updateEmergencyStatus(emergencyId, newStatus, newEta = null) {
  const emergency = simulatedEmergencies.find((e) => e.id === emergencyId);
  if (emergency) {
    emergency.status = newStatus;
    if (newEta) emergency.eta = newEta;
    notifySubscribers();
  }
}

/**
 * Simulates ambulance GPS movement
 * Future: Replace with real driver GPS coordinates from Firebase
 */
export function updateEmergencyLocation(emergencyId, latitude, longitude) {
  const emergency = simulatedEmergencies.find((e) => e.id === emergencyId);
  if (emergency) {
    emergency.location = { latitude, longitude };
    notifySubscribers();
  }
}

/**
 * Simulates ETA countdown
 * Future: Replace with real-time GPS-based ETA calculations
 */
export function decrementEmergencyEta(emergencyId) {
  const emergency = simulatedEmergencies.find((e) => e.id === emergencyId);
  if (emergency && emergency.eta) {
    const match = emergency.eta.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      if (minutes > 0) {
        emergency.eta = `${minutes - 1} mins`;
        notifySubscribers();
      }
    }
  }
}

/**
 * Simulates new emergency appearing (critical incidents)
 * Future: Replace with real-time Firestore document creation from dispatch system
 */
export function simulateNewEmergency(emergencyData) {
  const newEmergency = {
    id: `EMG${String(simulatedEmergencies.length + 1).padStart(3, '0')}`,
    status: 'active',
    priority: 'critical',
    eta: '8 mins',
    ...emergencyData,
  };
  simulatedEmergencies.push(newEmergency);
  notifySubscribers();
  return newEmergency;
}

/**
 * Removes an emergency (completed/resolved)
 * Future: Replace with Firestore document deletion or status change
 */
export function completeEmergency(emergencyId) {
  simulatedEmergencies = simulatedEmergencies.filter((e) => e.id !== emergencyId);
  notifySubscribers();
}

/**
 * Notifies all active subscribers of state changes
 * This is the core of the real-time simulation
 */
function notifySubscribers() {
  activeSubscriptions.forEach((callback) => {
    callback([...simulatedEmergencies]);
  });
}

/**
 * Resets simulated data to original mock state
 * Useful for testing and UI state resets
 */
export function resetSimulatedData() {
  simulatedEmergencies = JSON.parse(JSON.stringify(originalMockEmergencies));
  notifySubscribers();
}

// ========================================
// PUBLIC API (Firebase-ready)
// ========================================

export function getMockEmergencies() {
  return [...simulatedEmergencies];
}

export function getMockEmergencyById(id) {
  return simulatedEmergencies.find((emergency) => emergency.id === id);
}

/**
 * Firebase-ready subscription architecture
 * Currently uses mock data and interval-based simulation
 * Future: Replace with Firestore onSnapshot(collection(db, 'emergencies'), callback)
 *
 * @param {Function} callback - Called immediately with current emergencies, then on updates
 * @returns {Function} Unsubscribe function
 *
 * Location structure (GPS-ready):
 * - location.latitude: number
 * - location.longitude: number
 *
 * Status types: 'active', 'dispatched', 'arrived', 'completed'
 * Priority types: 'critical', 'high', 'medium', 'low'
 */
export function subscribeToEmergencies(callback) {
  // Call immediately with current state
  callback([...simulatedEmergencies]);

  // Add this callback to active subscribers
  activeSubscriptions.push(callback);

  // Return unsubscribe function
  return () => {
    activeSubscriptions = activeSubscriptions.filter((sub) => sub !== callback);
  };
}

/**
 * Starts the real-time simulation engine
 * Simulates emergency updates, ETA countdowns, and new incidents
 * Future: Remove this when Firebase provides real-time data
 *
 * @returns {Function} Function to stop the simulation
 */
export function startRealTimeSimulation() {
  const intervals = [];

  // Simulate ETA decrements every 15 seconds
  intervals.push(
    setInterval(() => {
      simulatedEmergencies.forEach((emergency) => {
        if (emergency.status === 'active' || emergency.status === 'dispatched') {
          decrementEmergencyEta(emergency.id);
        }
      });
    }, 15000) // 15 seconds
  );

  // Simulate random status changes every 20 seconds
  intervals.push(
    setInterval(() => {
      if (simulatedEmergencies.length > 0 && Math.random() > 0.7) {
        const randomEmergency = simulatedEmergencies[Math.floor(Math.random() * simulatedEmergencies.length)];
        const statuses = ['active', 'dispatched', 'arrived'];
        const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
        updateEmergencyStatus(randomEmergency.id, nextStatus);
      }
    }, 20000) // 20 seconds
  );

  // Simulate subtle GPS movement (ambulances don't teleport)
  intervals.push(
    setInterval(() => {
      simulatedEmergencies.forEach((emergency) => {
        const latDrift = (Math.random() - 0.5) * 0.0005;
        const lonDrift = (Math.random() - 0.5) * 0.0005;
        updateEmergencyLocation(
          emergency.id,
          emergency.location.latitude + latDrift,
          emergency.location.longitude + lonDrift
        );
      });
    }, 5000) // 5 seconds
  );

  // Simulate occasional new critical emergencies (rare)
  intervals.push(
    setInterval(() => {
      if (Math.random() > 0.85) {
        // 15% chance every 30 seconds
        const newAmbulance = Math.floor(Math.random() * 100) + 30;
        simulateNewEmergency({
          ambulanceId: `AMB${newAmbulance}`,
          driverName: 'On-Duty Driver',
          patientName: 'Incoming Patient',
          incidentType: 'Emergency Response',
          hospitalId: 'HSP01',
          location: {
            latitude: 18.5204 + (Math.random() - 0.5) * 0.1,
            longitude: 73.8567 + (Math.random() - 0.5) * 0.1,
          },
        });
      }
    }, 30000) // 30 seconds
  );

  // Return stop function
  return () => {
    intervals.forEach((interval) => clearInterval(interval));
  };
}
