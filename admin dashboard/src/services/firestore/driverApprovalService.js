import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getFirestore
} from "firebase/firestore";

import { getFirebaseApp }
from "../../firebase/client";

export async function approveDriver(
  driverId
) {
  try {

    const app = await getFirebaseApp();

    const db = getFirestore(app);

    const pendingRef =
      doc(db, "pending_drivers", driverId);

    const pendingSnap =
      await getDoc(pendingRef);

    if (!pendingSnap.exists()) {
      throw new Error(
        "Pending driver not found"
      );
    }

    const driverData =
      pendingSnap.data();

    await setDoc(
      doc(db, "drivers", driverId),
      {
        ...driverData,
        status: "approved",
        approvedAt: new Date(),
      }
    );

    await deleteDoc(pendingRef);

    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Driver approval error:",
      error
    );

    return {
      success: false,
      error,
    };
  }
}
export async function rejectDriver(
  driverId
) {
  try {

    const app = await getFirebaseApp();

    const db = getFirestore(app);

    const pendingRef =
      doc(db, "pending_drivers", driverId);

    const pendingSnap =
      await getDoc(pendingRef);

    if (!pendingSnap.exists()) {
      throw new Error(
        "Pending driver not found"
      );
    }

    const driverData =
      pendingSnap.data();

    await setDoc(
      doc(db, "rejected_requests", driverId),
      {
        ...driverData,
        status: "rejected",
        rejectedAt: new Date(),
      }
    );

    await deleteDoc(pendingRef);

    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Driver rejection error:",
      error
    );

    return {
      success: false,
      error,
    };
  }
}