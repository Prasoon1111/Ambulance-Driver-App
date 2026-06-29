import { hasFirebaseConfig, getFirebaseFunctions, getFirebaseStorage } from "../firebase/client.js";

async function callVerificationFunction(functionName, payload) {
  if (!hasFirebaseConfig()) {
    return { ok: true, mode: "local-demo", functionName, payload };
  }

  const functions = await getFirebaseFunctions();
  const { httpsCallable } = await import("firebase/functions");
  const callable = httpsCallable(functions, functionName);
  const result = await callable(payload);
  return result.data;
}

export const verificationService = {
  approveDriver(pendingDriverId) {
    return callVerificationFunction("approvePendingDriver", { pendingDriverId });
  },

  rejectDriver(pendingDriverId, rejectionReason) {
    return callVerificationFunction("rejectPendingDriver", { pendingDriverId, rejectionReason });
  },

  requestDriverResubmission(pendingDriverId, rejectionReason) {
    return callVerificationFunction("requestDriverResubmission", { pendingDriverId, rejectionReason });
  },

  approveAmbulance(pendingAmbulanceId) {
    return callVerificationFunction("approvePendingAmbulance", { pendingAmbulanceId });
  },

  rejectAmbulance(pendingAmbulanceId, rejectionReason) {
    return callVerificationFunction("rejectPendingAmbulance", { pendingAmbulanceId, rejectionReason });
  },

  requestAmbulanceResubmission(pendingAmbulanceId, rejectionReason) {
    return callVerificationFunction("requestAmbulanceResubmission", { pendingAmbulanceId, rejectionReason });
  },
};

export async function uploadVerificationDocument(path, file) {
  if (!hasFirebaseConfig()) {
    return URL.createObjectURL(file);
  }

  const storage = await getFirebaseStorage();
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
