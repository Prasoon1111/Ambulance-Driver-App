const DATA_KEY = 'hospitalDashboardDataV2';

export const APPROVAL_STATUSES = ['pending', 'approved', 'needs_correction', 'rejected'];
export const VEHICLE_TYPES = [
  { label: 'Basic Ambulance', value: 'Basic' },
  { label: 'ICU Ambulance', value: 'ICU' },
  { label: 'Cardiac Ambulance', value: 'Cardiac' },
  { label: 'Ventilator Ambulance', value: 'Ventilator' },
];
export const CAPACITIES = ['12 Seater', '17 Seater'];
export const MEDICAL_CAPABILITIES = ['Oxygen Support', 'Ventilator', 'Defibrillator', 'Trauma Kit'];

const now = new Date().toISOString();

const initialData = {
  hospitals: [
    {
      id: 'HSP01',
      hospitalId: 'HSP01',
      name: 'CityCare General Hospital',
      address: '12 Sassoon Road, Pune, Maharashtra 411001',
      phone: '+91 20 4000 1122',
      createdAt: now,
    },
    {
      id: 'HSP02',
      hospitalId: 'HSP02',
      name: 'Metro Trauma Institute',
      address: '44 Ring Road, Pune, Maharashtra 411045',
      phone: '+91 20 4000 3344',
      createdAt: now,
    },
  ],
  users: [
    { uid: 'admin-001', role: 'admin', hospitalId: null, email: 'admin@example.com', createdAt: now },
    { uid: 'hospital-admin-001', role: 'hospital_admin', hospitalId: 'HSP01', email: 'dispatcher@example.com', createdAt: now },
    { uid: 'driver-001', role: 'driver', hospitalId: 'HSP01', email: 'driver@example.com', createdAt: now },
  ],
  drivers: [
    {
      id: 'driver-001',
      uid: 'driver-001',
      fullName: 'Ravi Sharma',
      phone: '+91 98765 43210',
      email: 'driver@example.com',
      streetAddress: '18 MG Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      aadhaarNumber: '1234-5678-9012',
      aadhaarCardUrl: 'storage://drivers/driver-001/aadhaar.pdf',
      licenseNumber: 'MH12-2024-4421',
      licenseUrl: 'storage://drivers/driver-001/license.pdf',
      licenseExpiry: '2027-04-30',
      emergencyContact: '+91 90000 11111',
      assignedAmbulances: ['amb-001'],
      hospitalId: 'HSP01',
      approvalStatus: 'approved',
      passwordChanged: true,
      credentialsCreatedAt: '2026-05-21T09:10:00.000Z',
      adminReviewMessage: '',
      createdAt: '2026-05-21T09:00:00.000Z',
    },
    {
      id: 'driver-002',
      uid: 'driver-002',
      fullName: 'Neha Patil',
      phone: '+91 99887 76655',
      email: 'neha.driver@example.com',
      streetAddress: '',
      city: '',
      state: '',
      pincode: '',
      aadhaarNumber: '5432-1111-2222',
      aadhaarCardUrl: 'storage://drivers/driver-002/aadhaar.pdf',
      licenseNumber: 'MH12-2025-9132',
      licenseUrl: 'storage://drivers/driver-002/license.pdf',
      licenseExpiry: '2028-02-12',
      emergencyContact: '+91 91111 22222',
      assignedAmbulances: [],
      hospitalId: 'HSP01',
      approvalStatus: 'pending',
      passwordChanged: false,
      adminReviewMessage: '',
      createdAt: '2026-05-23T10:15:00.000Z',
    },
  ],
  ambulances: [
    {
      id: 'amb-001',
      numberPlate: 'MH 12 AB 4411',
      manufacturer: 'Force',
      model: 'Traveller',
      registrationNumber: 'REG-MH12-4411',
      vehicleType: 'ICU',
      capacity: '12 Seater',
      medicalCapabilities: ['Oxygen Support', 'Ventilator', 'Trauma Kit'],
      rcBookUrl: 'storage://ambulances/amb-001/rc.pdf',
      insuranceUrl: 'storage://ambulances/amb-001/insurance.pdf',
      pucUrl: 'storage://ambulances/amb-001/puc.pdf',
      vehiclePhotoUrl: 'storage://ambulances/amb-001/photo.jpg',
      assignedDrivers: ['driver-001'],
      activeDriverId: 'driver-001',
      hospitalId: 'HSP01',
      approvalStatus: 'approved',
      adminReviewMessage: '',
      createdAt: '2026-05-21T10:00:00.000Z',
    },
    {
      id: 'amb-002',
      numberPlate: 'MH 12 CD 8890',
      manufacturer: 'Tata',
      model: 'Winger',
      registrationNumber: 'REG-MH12-8890',
      vehicleType: 'Basic',
      capacity: '17 Seater',
      medicalCapabilities: ['Oxygen Support', 'Defibrillator'],
      rcBookUrl: 'storage://ambulances/amb-002/rc.pdf',
      insuranceUrl: 'storage://ambulances/amb-002/insurance.pdf',
      pucUrl: 'storage://ambulances/amb-002/puc.pdf',
      vehiclePhotoUrl: 'storage://ambulances/amb-002/photo.jpg',
      assignedDrivers: [],
      activeDriverId: null,
      hospitalId: 'HSP01',
      approvalStatus: 'pending',
      adminReviewMessage: '',
      createdAt: '2026-05-23T11:30:00.000Z',
    },
  ],
  emergencies: [
    {
      id: 'emg-001',
      ambulanceId: 'amb-001',
      driverId: 'driver-001',
      hospitalId: 'HSP01',
      status: 'active',
      startTime: '2026-05-24T11:05:00.000Z',
      pickupTime: null,
      arrivalTime: null,
      totalDuration: null,
      patientLocation: { latitude: 18.5204, longitude: 73.8567 },
      resolvedAt: null,
    },
  ],
  liveLocations: [
    {
      id: 'amb-001',
      ambulanceId: 'amb-001',
      driverId: 'driver-001',
      hospitalId: 'HSP01',
      lat: 18.5204,
      lng: 73.8567,
      updatedAt: '2026-05-24T11:12:00.000Z',
    },
  ],
  notifications: [
    {
      id: 'note-001',
      hospitalId: 'HSP01',
      type: 'ambulance_approaching',
      message: 'Ambulance MH 12 AB 4411 is approaching hospital.',
      read: false,
      createdAt: '2026-05-24T11:14:00.000Z',
    },
  ],
  analytics: [
    {
      id: 'analytics-001',
      emergencyId: 'emg-000',
      hospitalId: 'HSP01',
      driverId: 'driver-001',
      ambulanceId: 'amb-001',
      responseTime: 8,
      pickupTime: 14,
      arrivalTime: 22,
      totalDuration: 36,
      createdAt: '2026-05-20T10:00:00.000Z',
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadData() {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
    return clone(initialData);
  }

  const parsed = JSON.parse(raw);
  const merged = sanitizeData({ ...clone(initialData), ...parsed });
  localStorage.setItem(DATA_KEY, JSON.stringify(merged));
  return merged;
}

function sanitizeData(data) {
  return {
    ...data,
    hospitals: (data.hospitals || []).map((hospital) => ({
      hospitalId: hospital.hospitalId || hospital.id,
      id: hospital.id || hospital.hospitalId,
      name: hospital.name || 'Hospital',
      address: hospital.address || 'Address not available',
      phone: hospital.phone || 'Phone not available',
      createdAt: hospital.createdAt || now,
    })),
    users: (data.users || []).filter((user) => user.role !== 'police'),
    drivers: (data.drivers || []).map(({ passwordHash, ...driver }) => ({
      ...driver,
      streetAddress: driver.streetAddress || '',
      city: driver.city || '',
      state: driver.state || '',
      pincode: driver.pincode || '',
    })),
    ambulances: (data.ambulances || []).map((ambulance) => ({
      ...ambulance,
      vehicleType: String(ambulance.vehicleType || '').replace(' Ambulance', ''),
    })),
    liveLocations: (data.liveLocations || []).map((location) => ({
      id: location.id || location.ambulanceId,
      ambulanceId: location.ambulanceId,
      driverId: location.driverId,
      hospitalId: location.hospitalId,
      lat: location.lat ?? location.coords?.latitude ?? 18.5204,
      lng: location.lng ?? location.coords?.longitude ?? 73.8567,
      updatedAt: location.updatedAt,
    })),
    analytics: (data.analytics || []).map(({ driverSnapshot, ambulanceSnapshot, hospitalSnapshot, ...row }) => row),
    notifications: (data.notifications || []).map(({ priority, ...note }) => note),
  };
}

function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('hospital-data-changed'));
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function storageUrl(folder, file) {
  return file?.name ? `storage://${folder}/${Date.now()}-${file.name}` : '';
}

function phonePassword(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

function plainError(message) {
  return new Error(message || 'Something went wrong. Please try again.');
}

function createMockDriverCredentials(data, driver) {
  const authUid = driver.uid || `auth-${driver.id}`;
  driver.uid = authUid;
  driver.passwordChanged = false;
  driver.credentialsCreatedAt = new Date().toISOString();

  if (!data.users.some((user) => user.uid === authUid)) {
    data.users.push({
      uid: authUid,
      role: 'driver',
      hospitalId: driver.hospitalId,
      email: driver.email,
      createdAt: new Date().toISOString(),
    });
  }

  data.notifications.unshift({
    id: id('note'),
    hospitalId: driver.hospitalId,
    type: 'driver_approved',
    message: `Driver ${driver.fullName} has been approved. Login: ${driver.email} / Password: ${phonePassword(driver.phone)}`,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function subscribeHospitalData(callback) {
  const emit = () => callback(loadData());
  emit();
  window.addEventListener('hospital-data-changed', emit);
  window.addEventListener('storage', emit);
  return () => {
    window.removeEventListener('hospital-data-changed', emit);
    window.removeEventListener('storage', emit);
  };
}

export function getHospitalName(hospitalId) {
  return loadData().hospitals.find((hospital) => hospital.id === hospitalId)?.name || 'Hospital';
}

export function getHospitalById(hospitalId) {
  return loadData().hospitals.find((hospital) => hospital.hospitalId === hospitalId || hospital.id === hospitalId) || null;
}

export function getDriverById(driverId, hospitalId) {
  return loadData().drivers.find((driver) =>
    driver.hospitalId === hospitalId && (driver.id === driverId || driver.uid === driverId)
  ) || null;
}

export function getHospitalSnapshot(hospitalId) {
  const data = loadData();
  return {
    hospital: data.hospitals.find((hospital) => hospital.id === hospitalId),
    drivers: data.drivers.filter((driver) => driver.hospitalId === hospitalId),
    ambulances: data.ambulances.filter((ambulance) => ambulance.hospitalId === hospitalId),
    emergencies: data.emergencies.filter((emergency) => emergency.hospitalId === hospitalId),
    liveLocations: data.liveLocations.filter((location) => location.hospitalId === hospitalId),
    notifications: data.notifications.filter((note) => note.hospitalId === hospitalId),
    analytics: data.analytics.filter((row) => row.hospitalId === hospitalId),
  };
}

export function submitDriverRegistration(hospitalId, values) {
  const data = loadData();
  const driverId = id('driver');
  const driver = {
    id: driverId,
    uid: driverId,
    fullName: values.fullName,
    phone: values.phone,
    email: values.email,
    streetAddress: values.streetAddress || '',
    city: values.city || '',
    state: values.state || '',
    pincode: values.pincode || '',
    aadhaarNumber: values.aadhaarNumber,
    aadhaarCardUrl: storageUrl(`drivers/${driverId}`, values.aadhaarCard),
    licenseNumber: values.licenseNumber,
    licenseUrl: storageUrl(`drivers/${driverId}`, values.licenseFile),
    licenseExpiry: values.licenseExpiry,
    emergencyContact: values.emergencyContact,
    assignedAmbulances: [],
    hospitalId,
    approvalStatus: 'pending',
    passwordChanged: false,
    adminReviewMessage: '',
    createdAt: new Date().toISOString(),
  };
  data.drivers.unshift(driver);
  saveData(data);
  return driver;
}

export function submitAmbulanceRegistration(hospitalId, values) {
  const data = loadData();
  const ambulanceId = id('amb');
  const ambulance = {
    id: ambulanceId,
    numberPlate: values.numberPlate,
    manufacturer: values.manufacturer,
    model: values.model,
    registrationNumber: values.registrationNumber,
    vehicleType: values.vehicleType,
    capacity: values.capacity,
    medicalCapabilities: values.medicalCapabilities || [],
    rcBookUrl: storageUrl(`ambulances/${ambulanceId}`, values.rcBook),
    insuranceUrl: storageUrl(`ambulances/${ambulanceId}`, values.insurance),
    pucUrl: storageUrl(`ambulances/${ambulanceId}`, values.puc),
    vehiclePhotoUrl: storageUrl(`ambulances/${ambulanceId}`, values.vehiclePhoto),
    assignedDrivers: values.assignedDrivers || [],
    activeDriverId: null,
    hospitalId,
    approvalStatus: 'pending',
    adminReviewMessage: '',
    createdAt: new Date().toISOString(),
  };
  data.ambulances.unshift(ambulance);
  data.drivers = data.drivers.map((driver) =>
    ambulance.assignedDrivers.includes(driver.id)
      ? { ...driver, assignedAmbulances: [...new Set([...(driver.assignedAmbulances || []), ambulanceId])] }
      : driver
  );
  saveData(data);
  return ambulance;
}

export function reviewApproval({ collectionName, itemId, approvalStatus, adminReviewMessage = '' }) {
  if (!['drivers', 'ambulances'].includes(collectionName)) {
    throw plainError('Invalid approval collection.');
  }
  if (approvalStatus === 'needs_correction' && !adminReviewMessage.trim()) {
    throw plainError('Admin review message is required for correction requests.');
  }

  const data = loadData();
  const items = data[collectionName];
  const target = items.find((item) => item.id === itemId);
  if (!target) throw plainError('Approval item not found.');

  target.approvalStatus = approvalStatus;
  target.adminReviewMessage = adminReviewMessage;

  const typeLabel = collectionName === 'drivers' ? 'Driver' : 'Ambulance';
  if (collectionName === 'drivers' && approvalStatus === 'approved') {
    createMockDriverCredentials(data, target);
  }

  if (['approved', 'needs_correction', 'rejected'].includes(approvalStatus)) {
    if (!(collectionName === 'drivers' && approvalStatus === 'approved')) {
      data.notifications.unshift({
        id: id('note'),
        hospitalId: target.hospitalId,
        type: approvalStatus,
        message:
          approvalStatus === 'approved'
            ? `${typeLabel} ${target.fullName || target.numberPlate} has been approved.`
            : approvalStatus === 'rejected'
              ? `${typeLabel} ${target.fullName || target.numberPlate} was rejected.${adminReviewMessage ? ` ${adminReviewMessage}` : ''}`
              : `Correction requested for ${typeLabel.toLowerCase()} ${target.fullName || target.numberPlate}: ${adminReviewMessage}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveData(data);
  return target;
}

export function markNotificationRead(notificationId, hospitalId) {
  const data = loadData();
  data.notifications = data.notifications.map((note) =>
    note.id === notificationId && note.hospitalId === hospitalId ? { ...note, read: true } : note
  );
  saveData(data);
}

export function resolveEmergency(emergencyId) {
  const data = loadData();
  const emergency = data.emergencies.find((item) => item.id === emergencyId);
  if (!emergency || emergency.resolvedAt) return emergency;

  emergency.status = 'resolved';
  emergency.resolvedAt = new Date().toISOString();
  emergency.totalDuration = emergency.totalDuration || 34;
  data.analytics.unshift({
    id: id('analytics'),
    emergencyId: emergency.id,
    hospitalId: emergency.hospitalId,
    driverId: emergency.driverId,
    ambulanceId: emergency.ambulanceId,
    responseTime: 9,
    pickupTime: 15,
    arrivalTime: 24,
    totalDuration: emergency.totalDuration,
    createdAt: new Date().toISOString(),
  });
  saveData(data);
  return emergency;
}

export function getAdminQueue(filters = {}) {
  const data = loadData();
  const status = filters.status || 'pending';
  const hospitalId = filters.hospitalId || 'HSP01';
  const startDate = filters.startDate || '';
  const endDate = filters.endDate || '';
  const rows = [
    ...data.drivers.map((item) => ({ ...item, collectionName: 'drivers', name: item.fullName })),
    ...data.ambulances.map((item) => ({ ...item, collectionName: 'ambulances', name: item.numberPlate })),
  ];

  return rows
    .filter((item) => (status === 'all' ? true : item.approvalStatus === status))
    .filter((item) => item.hospitalId === hospitalId)
    .filter((item) => (startDate ? item.createdAt?.slice(0, 10) >= startDate : true))
    .filter((item) => (endDate ? item.createdAt?.slice(0, 10) <= endDate : true))
    .map((item) => ({
      ...item,
      hospitalName: data.hospitals.find((hospital) => hospital.id === item.hospitalId)?.name || item.hospitalId,
    }));
}

export function authenticateMockUser(email, password) {
  const user = loadData().users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw plainError('Invalid email or password.');
  }

  if (user.role === 'driver') {
    const driver = loadData().drivers.find((item) => item.uid === user.uid || item.email === user.email);
    if (password !== phonePassword(driver?.phone) && driver?.passwordChanged === false) {
      throw plainError('Invalid email or password.');
    }
    if (driver?.approvalStatus !== 'approved') {
      throw plainError('Your account is pending admin approval.');
    }
    return {
      ...user,
      uid: driver.uid,
      requiresPasswordChange: driver.passwordChanged === false,
      hospitalName: getHospitalName(user.hospitalId),
    };
  }

  if (password !== '123456') {
    throw plainError('Invalid email or password.');
  }

  return {
    ...user,
    hospitalName: user.hospitalId ? getHospitalName(user.hospitalId) : 'All Hospitals',
  };
}

export function setDriverPasswordChanged(driverUid) {
  const data = loadData();
  data.drivers = data.drivers.map((driver) =>
    driver.uid === driverUid ? { ...driver, passwordChanged: true } : driver
  );
  saveData(data);
}

export function startDriverGpsSession(driverUid) {
  const data = loadData();
  const driver = data.drivers.find((item) => item.uid === driverUid || item.id === driverUid);
  if (!driver || driver.approvalStatus !== 'approved') {
    throw plainError('Your account is pending admin approval.');
  }

  const ambulance = data.ambulances.find(
    (item) => item.hospitalId === driver.hospitalId && item.assignedDrivers.includes(driver.id) && item.approvalStatus === 'approved'
  );
  if (!ambulance) {
    throw plainError('No approved ambulance is assigned to this driver.');
  }

  ambulance.activeDriverId = driver.uid;
  const existingLocation = data.liveLocations.find((item) => item.ambulanceId === ambulance.id);
  const location = {
    id: ambulance.id,
    ambulanceId: ambulance.id,
    driverId: driver.uid,
    hospitalId: driver.hospitalId,
    lat: existingLocation?.lat || 18.5204,
    lng: existingLocation?.lng || 73.8567,
    updatedAt: new Date().toISOString(),
  };
  data.liveLocations = data.liveLocations.filter((item) => item.ambulanceId !== ambulance.id);
  data.liveLocations.unshift(location);
  saveData(data);
  return { driver, ambulance, location };
}

export function clearDriverGpsSession({ driverUid, ambulanceId }) {
  const data = loadData();
  const ambulance = data.ambulances.find((item) => item.id === ambulanceId);
  if (ambulance?.activeDriverId === driverUid) {
    ambulance.activeDriverId = null;
    saveData(data);
  }
}

export function writeDriverLocation({ driverUid, ambulanceId, lat, lng }) {
  const data = loadData();
  const ambulance = data.ambulances.find((item) => item.id === ambulanceId);
  if (!ambulance || ambulance.activeDriverId !== driverUid) {
    throw plainError('Only the active driver can write GPS for this ambulance.');
  }
  data.liveLocations = data.liveLocations.filter((item) => item.ambulanceId !== ambulanceId);
  data.liveLocations.unshift({
    id: ambulanceId,
    ambulanceId,
    driverId: driverUid,
    hospitalId: ambulance.hospitalId,
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  });
  saveData(data);
}
