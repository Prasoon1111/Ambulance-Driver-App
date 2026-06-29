import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export async function signInHospitalUser(email, password) {
  await setPersistence(auth, browserLocalPersistence);

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);

  if (!profile || profile.isActive === false) {
    await signOut(auth);
    throw new Error('This account does not have active dashboard access.');
  }

  if (!['hospital_admin', 'super_admin', 'admin', 'driver'].includes(profile.role)) {
    await signOut(auth);
    throw new Error('This account is not allowed on this dashboard.');
  }

  return normalizeUser(credential.user, profile);
}

export async function getUserProfile(uid) {
  const adminSnap = await getDoc(doc(db, 'admins', uid));

  if (adminSnap.exists()) {
    return {
      id: adminSnap.id,
      ...adminSnap.data(),
    };
  }

  const userSnap = await getDoc(doc(db, 'users', uid));

  if (userSnap.exists()) {
    return {
      id: userSnap.id,
      ...userSnap.data(),
    };
  }

  return null;
}

export function observeHospitalAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback({ user: null, role: null, loading: false });
      return;
    }

    try {
      const profile = await getUserProfile(firebaseUser.uid);

      if (!profile || profile.isActive === false) {
        callback({ user: null, role: null, loading: false });
        return;
      }

      const user = normalizeUser(firebaseUser, profile);
      callback({ user, role: user.role, loading: false });
    } catch (error) {
      callback({ user: null, role: null, loading: false, error });
    }
  });
}

export function signOutHospitalUser() {
  return signOut(auth);
}

export async function changeCurrentUserPassword(newPassword) {
  if (!auth.currentUser) {
    throw new Error('No signed-in user found.');
  }

  await updatePassword(auth.currentUser, newPassword);

  await updateDoc(doc(db, 'drivers', auth.currentUser.uid), {
    passwordChanged: true,
  });
}

function normalizeUser(firebaseUser, profile) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || profile.email,
    role: profile.role,
    hospitalId: profile.hospitalId || null,
    hospitalName: profile.hospitalName || '',
    displayName: profile.displayName || firebaseUser.displayName || '',
    requiresPasswordChange: profile.requiresPasswordChange || false,
  };
}