export const hospitalMarker = {
  id: 'HSP01',
  name: 'Pune Smart Emergency Hospital',
  location: {
    latitude: 18.5204,
    longitude: 73.8567,
  },
};

// ========================================
// FIRESTORE-READY MOCK DATA
// ========================================
// Backend GPS streams should preserve this exact structure:
// location: { latitude: number, longitude: number }
// status: 'active' | 'dispatched' | 'arrived' | 'completed'
// priority: 'critical' | 'high' | 'medium' | 'low'

export const mockEmergencies = [
  {
    id: 'EMG001',
    ambulanceId: 'AMB12',
    driverName: 'John Doe',
    hospitalId: 'HSP01',
    patientName: 'Aarav Kulkarni',
    incidentType: 'Cardiac emergency',
    status: 'active',
    priority: 'high',
    eta: '5 mins',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    location: {
      latitude: 18.5284,
      longitude: 73.8741,
    },
  },
  {
    id: 'EMG002',
    ambulanceId: 'AMB07',
    driverName: 'Sara Khan',
    hospitalId: 'HSP01',
    patientName: 'Meera Patil',
    incidentType: 'Road collision',
    status: 'dispatched',
    priority: 'critical',
    eta: '3 mins',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    location: {
      latitude: 18.5122,
      longitude: 73.8427,
    },
  },
  {
    id: 'EMG003',
    ambulanceId: 'AMB18',
    driverName: 'Vikram Rao',
    hospitalId: 'HSP01',
    patientName: 'Riya Sharma',
    incidentType: 'Respiratory distress',
    status: 'active',
    priority: 'medium',
    eta: '9 mins',
    timestamp: new Date(Date.now() - 540000).toISOString(),
    location: {
      latitude: 18.5359,
      longitude: 73.8296,
    },
  },
  {
    id: 'EMG004',
    ambulanceId: 'AMB22',
    driverName: 'Neha Thomas',
    hospitalId: 'HSP01',
    patientName: 'Kabir Joshi',
    incidentType: 'Stroke alert',
    status: 'active',
    priority: 'high',
    eta: '7 mins',
    timestamp: new Date(Date.now() - 420000).toISOString(),
    location: {
      latitude: 18.5018,
      longitude: 73.8665,
    },
  },
  {
    id: 'EMG005',
    ambulanceId: 'AMB31',
    driverName: 'Rajesh Kumar',
    hospitalId: 'HSP01',
    patientName: 'Priya Desai',
    incidentType: 'Severe allergic reaction',
    status: 'dispatched',
    priority: 'high',
    eta: '6 mins',
    timestamp: new Date(Date.now() - 360000).toISOString(),
    location: {
      latitude: 18.5145,
      longitude: 73.8520,
    },
  },
  {
    id: 'EMG006',
    ambulanceId: 'AMB14',
    driverName: 'Monica Singh',
    hospitalId: 'HSP01',
    patientName: 'Arjun Verma',
    incidentType: 'Acute chest pain',
    status: 'active',
    priority: 'critical',
    eta: '4 mins',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    location: {
      latitude: 18.5278,
      longitude: 73.8391,
    },
  },
];

export const mockActivities = [
  {
    timestamp: new Date(Date.now() - 60000).toISOString(),
    message: 'AMB07 crossed Deccan bridge checkpoint',
    priority: 'info',
  },
  {
    timestamp: new Date(Date.now() - 120000).toISOString(),
    message: 'Critical alert escalated to trauma bay',
    priority: 'critical',
  },
  {
    timestamp: new Date(Date.now() - 180000).toISOString(),
    message: 'AMB12 shared updated GPS coordinates',
    priority: 'info',
  },
  {
    timestamp: new Date(Date.now() - 240000).toISOString(),
    message: 'Hospital HSP01 confirmed ICU availability',
    priority: 'success',
  },
  {
    timestamp: new Date(Date.now() - 300000).toISOString(),
    message: 'Driver Neha Thomas accepted dispatch sync',
    priority: 'info',
  },
  {
    timestamp: new Date(Date.now() - 360000).toISOString(),
    message: 'EMG002 emergency dispatched - ETA 3 mins',
    priority: 'critical',
  },
  {
    timestamp: new Date(Date.now() - 420000).toISOString(),
    message: 'System connected to live GPS stream',
    priority: 'success',
  },
  {
    timestamp: new Date(Date.now() - 480000).toISOString(),
    message: 'Emergency coordination center activated',
    priority: 'info',
  },
];
