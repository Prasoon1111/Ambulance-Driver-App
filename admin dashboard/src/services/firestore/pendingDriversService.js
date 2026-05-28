import {
  collection,
  onSnapshot,
  query
} from "firebase/firestore";

import { getFirebaseApp }
from "../../firebase/client";

export async function listenToPendingDrivers(
  callback
) {
  const { getFirestore } =
    await import("firebase/firestore");

  const app = await getFirebaseApp();

  const db = getFirestore(app);

  const q = query(
    collection(db, "pending_drivers")
  );

  return onSnapshot(q, (snapshot) => {
    const drivers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(drivers);
  });
}