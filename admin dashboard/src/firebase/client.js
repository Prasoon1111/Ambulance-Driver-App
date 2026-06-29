const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let appPromise;

export function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export async function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase environment variables are not configured.");
  }

  if (!appPromise) {
    appPromise = import("firebase/app").then(({ initializeApp, getApps }) => {
      if (getApps().length) return getApps()[0];
      return initializeApp(firebaseConfig);
    });
  }

  return appPromise;
}

export async function getFirebaseFunctions() {
  const app = await getFirebaseApp();
  const { getFunctions } = await import("firebase/functions");
  return getFunctions(app);
}

export async function getFirebaseStorage() {
  const app = await getFirebaseApp();
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}
export async function getFirebaseAuth() {
  const app = await getFirebaseApp();

  const { getAuth } = await import("firebase/auth");

  return getAuth(app);
}
