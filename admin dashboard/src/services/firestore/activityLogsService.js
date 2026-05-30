import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getFirestore,
} from "firebase/firestore";

import { getFirebaseApp } from "../../firebase/client";

export async function listenToActivityLogs(callback) {
  const app = await getFirebaseApp();
  const db = getFirestore(app);

  const q = query(
    collection(db, "activity_logs"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(logs);
  });
}import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getFirestore,
} from "firebase/firestore";

import { getFirebaseApp } from "../../firebase/client";

export async function listenToActivityLogs(callback) {
  const app = await getFirebaseApp();
  const db = getFirestore(app);

  const q = query(
    collection(db, "activity_logs"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(logs);
  });
}