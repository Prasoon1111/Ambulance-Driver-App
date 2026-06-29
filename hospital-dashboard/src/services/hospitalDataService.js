import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const APPROVAL_STATUSES = ['pending', 'approved', 'needs_correction', 'rejected'];

export const VEHICLE_TYPES = [
  { label: 'Basic Ambulance', value: 'Basic' },
  { label: 'ICU Ambulance', value: 'ICU' },
  { label: 'Cardiac Ambulance', value: 'Cardiac' },
  { label: 'Ventilator Ambulance', value: 'Ventilator' },
];

export const CAPACITIES = ['12 Seater', '17 Seater'];

export const MEDICAL_CAPABILITIES = [
  'Oxygen Support',
  'Ventilator',
  'Defibrillator',
  'Trauma Kit',
];

function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function subscribeHospitalData(hospitalId, callback) {
  const state = {
    drivers: [],
    ambulances: [],
    emergencies: [],
    liveLocations: [],
    notifications: [],
  };

  function emit(key, value) {
    state[key] = value;
    callback({ ...state });
  }

  const driversUnsub = onSnapshot(
    query(
      collection(db, 'pending_drivers'),
      where('hospitalId', '==', hospitalId),
      orderBy('submittedAt', 'desc')
    ),
    (snap) => emit('drivers', mapSnapshot(snap)),
    (error) => console.error('Drivers listener error:', error.message)
  );
  
  const ambulancesUnsub = onSnapshot(
    query(
      collection(db, 'pending_ambulances'),
      where('hospitalId', '==', hospitalId),
      orderBy('submittedAt', 'desc')
    ),
    (snap) => emit('ambulances', mapSnapshot(snap)),
    (error) => console.error('Ambulances listener error:', error.message)
  );

  const emergenciesUnsub = onSnapshot(
    query(
      collection(db, 'emergencies'),
      where('hospitalId', '==', hospitalId)
    ),
    (snap) => emit('emergencies', mapSnapshot(snap)),
    (error) => console.error('Emergencies listener error:', error.message)
  );

  const locationsUnsub = onSnapshot(
    query(
      collection(db, 'live_locations'),
      where('hospitalId', '==', hospitalId)
    ),
    (snap) => emit('liveLocations', mapSnapshot(snap)),
    (error) => console.error('Locations listener error:', error.message)
  );

  const notificationsUnsub = onSnapshot(
    query(
      collection(db, 'notifications'),
      where('hospitalId', '==', hospitalId),
      orderBy('createdAt', 'desc')
    ),
    (snap) => emit('notifications', mapSnapshot(snap)),
    (error) => console.error('Notifications listener error:', error.message)
  );

  return () => {
    driversUnsub();
    ambulancesUnsub();
    emergenciesUnsub();
    locationsUnsub();
    notificationsUnsub();
  };
}

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
}