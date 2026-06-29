import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { firestore } from "@/firebase/config";

export function subscribeToEmergencies(onUpdate, onError) {
  if (!firestore) {
    return () => {};
  }

  const emergenciesQuery = query(collection(firestore, "emergencies"), orderBy("lastUpdated", "desc"));

  return onSnapshot(
    emergenciesQuery,
    (snapshot) => {
      const emergencies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      onUpdate(emergencies);
    },
    onError,
  );
}
