import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

import { getFirebaseApp } from "../../firebase/client";

export async function createActivityLog(logData) {
  try {
    console.log("Creating activity log:", logData);

    const app = await getFirebaseApp();
    const db = getFirestore(app);

    const docRef = await addDoc(
      collection(db, "activity_logs"),
      {
        ...logData,
        createdAt: new Date(),
      }
    );

    console.log("Activity log created:", docRef.id);

  } catch (error) {
    console.error("Activity log error:", error);
  }
}


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