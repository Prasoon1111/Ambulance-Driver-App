import { doc, getDoc, getFirestore }
from "firebase/firestore";

import { getFirebaseApp }
from "../../firebase/client";

export async function validateAdminAccess(uid) {
  try {
    const app = await getFirebaseApp();

    const db = getFirestore(app);

    const adminRef = doc(db, "admins", uid);

    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      return false;
    }

    const adminData = adminSnap.data();

    return (
      adminData.role === "admin" &&
      adminData.active === true
    );

  } catch (error) {
    console.error(
      "Admin validation error:",
      error
    );

    return false;
  }
}