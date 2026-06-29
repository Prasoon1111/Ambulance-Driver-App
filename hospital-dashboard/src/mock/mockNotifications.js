// Mock notifications data for frontend simulation
// Structure:
// { id: string, title: string, message: string, priority: 'critical'|'high'|'warning'|'success'|'info', timestamp: ISOString, type: string }

export const initialNotifications = [
  {
    id: 'N1',
    title: 'GPS stream connected',
    message: 'Live vehicle telemetry is available for dispatch operations.',
    priority: 'success',
    timestamp: new Date(Date.now() - 420000).toISOString(),
    type: 'system',
  },
  {
    id: 'N2',
    title: 'Checkpoint crossed',
    message: 'AMB07 crossed Deccan bridge checkpoint.',
    priority: 'info',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    type: 'fleet',
  },
  {
    id: 'N3',
    title: 'Critical escalation',
    message: 'Trauma bay escalation opened for EMG002.',
    priority: 'critical',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'incident',
  },
];

export const notificationExamples = [
  {
    title: 'Critical emergency detected',
    message: 'EMG006 requires immediate command center review.',
    priority: 'critical',
    type: 'incident',
  },
  {
    title: 'Ambulance dispatched',
    message: 'AMB12 dispatched to EMG001.',
    priority: 'high',
    type: 'dispatch',
  },
  {
    title: 'ETA updated',
    message: 'AMB07 estimated arrival is now 2 minutes.',
    priority: 'high',
    type: 'fleet',
  },
  {
    title: 'GPS signal warning',
    message: 'AMB31 telemetry connection requires attention.',
    priority: 'warning',
    type: 'system',
  },
  {
    title: 'Driver reconnected',
    message: 'AMB14 driver device is back online.',
    priority: 'success',
    type: 'fleet',
  },
  {
    title: 'ICU availability confirmed',
    message: 'Hospital HSP01 confirmed ICU capacity.',
    priority: 'info',
    type: 'hospital',
  },
];
