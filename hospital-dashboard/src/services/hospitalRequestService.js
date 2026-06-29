import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

function requireSignedInUser() {
  if (!auth.currentUser) {
    throw new Error('Please sign in before submitting a request.');
  }
  return auth.currentUser;
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

async function uploadHospitalDocument({ hospitalId, requestType, requestId, fieldName, file }) {
  if (!file) return null;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `hospital-submissions/${hospitalId}/${requestType}/${requestId}`);
  formData.append('public_id', `${fieldName}-${safeName}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    path: data.public_id,
    downloadUrl: data.secure_url,
    contentType: file.type,
    name: file.name,
    size: file.size,
  };
}

export async function createDriverRequest(hospitalId, values) {
  const user = requireSignedInUser();
  const requestRef = doc(collection(db, 'pending_drivers'));

  const documents = {
    aadhaar: await uploadHospitalDocument({
      hospitalId, requestType: 'driver', requestId: requestRef.id, fieldName: 'aadhaar', file: values.aadhaarCard,
    }),
    drivingLicence: await uploadHospitalDocument({
      hospitalId, requestType: 'driver', requestId: requestRef.id, fieldName: 'drivingLicence', file: values.licenseFile,
    }),
  };

  const payload = {
    requestType: 'driver',
    hospitalId,
    submittedBy: user.uid,
    status: 'pending',
    driverName: values.fullName,
    fullName: values.fullName,
    phone: values.phone,
    email: values.email,
    streetAddress: values.streetAddress || '',
    city: values.city || '',
    state: values.state || '',
    pincode: values.pincode || '',
    aadhaarNumber: values.aadhaarNumber,
    licenseNumber: values.licenseNumber,
    licenseExpiry: values.licenseExpiry,
    emergencyContact: values.emergencyContact,
    documents,
    rejectionReason: null,
    adminReviewMessage: '',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(requestRef, payload);
  return { id: requestRef.id, ...payload };
}

export async function createAmbulanceRequest(hospitalId, values) {
  const user = requireSignedInUser();
  const requestRef = doc(collection(db, 'pending_ambulances'));

  const documents = {
    rcBook: await uploadHospitalDocument({
      hospitalId, requestType: 'ambulance', requestId: requestRef.id, fieldName: 'rcBook', file: values.rcBook,
    }),
    insurance: await uploadHospitalDocument({
      hospitalId, requestType: 'ambulance', requestId: requestRef.id, fieldName: 'insurance', file: values.insurance,
    }),
    puc: await uploadHospitalDocument({
      hospitalId, requestType: 'ambulance', requestId: requestRef.id, fieldName: 'puc', file: values.puc,
    }),
    vehiclePhoto: await uploadHospitalDocument({
      hospitalId, requestType: 'ambulance', requestId: requestRef.id, fieldName: 'vehiclePhoto', file: values.vehiclePhoto,
    }),
  };

  const payload = {
    requestType: 'ambulance',
    hospitalId,
    submittedBy: user.uid,
    status: 'pending',
    numberPlate: values.numberPlate,
    manufacturer: values.manufacturer,
    model: values.model,
    registrationNumber: values.registrationNumber,
    vehicleType: values.vehicleType,
    capacity: values.capacity,
    medicalCapabilities: values.medicalCapabilities || [],
    assignedDrivers: values.assignedDrivers || [],
    documents,
    rejectionReason: null,
    adminReviewMessage: '',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(requestRef, payload);
  return { id: requestRef.id, ...payload };
}

export async function resubmitDriverRequest(hospitalId, requestId, values) {
  const uploads = await Promise.all([
    values.aadhaarCard
      ? uploadHospitalDocument({ hospitalId, requestType: 'driver', requestId, fieldName: 'aadhaar', file: values.aadhaarCard })
      : null,
    values.licenseFile
      ? uploadHospitalDocument({ hospitalId, requestType: 'driver', requestId, fieldName: 'drivingLicence', file: values.licenseFile })
      : null,
  ]);

  const updatedDocuments = {};
  if (uploads[0]) updatedDocuments.aadhaar = uploads[0];
  if (uploads[1]) updatedDocuments.drivingLicence = uploads[1];

  const payload = {
    fullName: values.fullName,
    driverName: values.fullName,
    phone: values.phone,
    email: values.email,
    aadhaarNumber: values.aadhaarNumber,
    licenseNumber: values.licenseNumber,
    licenseExpiry: values.licenseExpiry,
    emergencyContact: values.emergencyContact,
    streetAddress: values.streetAddress || '',
    city: values.city || '',
    state: values.state || '',
    pincode: values.pincode || '',
    status: 'pending',
    rejectionReason: null,
    adminReviewMessage: '',
    resubmittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(Object.keys(updatedDocuments).length > 0 && { documents: updatedDocuments }),
  };

  await updateDoc(doc(db, 'pending_drivers', requestId), payload);
}

export async function resubmitAmbulanceRequest(hospitalId, requestId, values) {
  const uploads = await Promise.all([
    values.rcBook
      ? uploadHospitalDocument({ hospitalId, requestType: 'ambulance', requestId, fieldName: 'rcBook', file: values.rcBook })
      : null,
    values.insurance
      ? uploadHospitalDocument({ hospitalId, requestType: 'ambulance', requestId, fieldName: 'insurance', file: values.insurance })
      : null,
    values.vehiclePhoto
      ? uploadHospitalDocument({ hospitalId, requestType: 'ambulance', requestId, fieldName: 'vehiclePhoto', file: values.vehiclePhoto })
      : null,
  ]);

  const updatedDocuments = {};
  if (uploads[0]) updatedDocuments.rcBook = uploads[0];
  if (uploads[1]) updatedDocuments.insurance = uploads[1];
  if (uploads[2]) updatedDocuments.vehiclePhoto = uploads[2];

  const payload = {
    numberPlate: values.numberPlate,
    manufacturer: values.manufacturer,
    model: values.model,
    registrationNumber: values.registrationNumber,
    vehicleType: values.vehicleType,
    capacity: values.capacity,
    medicalCapabilities: values.medicalCapabilities || [],
    status: 'pending',
    rejectionReason: null,
    adminReviewMessage: '',
    resubmittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(Object.keys(updatedDocuments).length > 0 && { documents: updatedDocuments }),
  };

  await updateDoc(doc(db, 'pending_ambulances', requestId), payload);
}

export function listenHospitalDriverRequests(hospitalId, callback, onError) {
  return onSnapshot(
    query(
      collection(db, 'pending_drivers'),
      where('hospitalId', '==', hospitalId),
      orderBy('submittedAt', 'desc')
    ),
    (snapshot) => callback(mapSnapshot(snapshot)),
    onError
  );
}

export function listenHospitalAmbulanceRequests(hospitalId, callback, onError) {
  return onSnapshot(
    query(
      collection(db, 'pending_ambulances'),
      where('hospitalId', '==', hospitalId),
      orderBy('submittedAt', 'desc')
    ),
    (snapshot) => callback(mapSnapshot(snapshot)),
    onError
  );
}