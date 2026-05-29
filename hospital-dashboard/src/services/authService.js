// Future Firebase Authentication integration:
// import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export function mockLogin() {
  return Promise.resolve({
    uid: 'mock-dispatcher',
    role: 'hospital_dispatcher',
    hospitalId: 'HSP01',
  });
}

export function mockLogout() {
  return Promise.resolve();
}

// Future role handling:
// onAuthStateChanged(auth, user => load hospital role claims and restrict hospitalId access)
