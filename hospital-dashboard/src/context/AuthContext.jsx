import { createContext, useEffect, useState } from 'react';
import { authenticateMockUser, setDriverPasswordChanged } from '../services/hospitalDataService';

export const AuthContext = createContext(null);

const AUTH_SESSION_KEY = 'hospitalDashboardSession';

const MOCK_HOSPITAL_USER = {
  email: 'dispatcher@example.com',
  role: 'hospital_admin',
  hospitalId: 'HSP01',
  hospitalName: 'CityCare General Hospital',
};

function getStoredUser() {
  try {
    const storedSession = localStorage.getItem(AUTH_SESSION_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedUser = JSON.parse(storedSession);

    if (!parsedUser?.email || !parsedUser?.role) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return parsedUser;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [role, setRole] = useState(() => getStoredUser()?.role || null);

  useEffect(() => {
    const restoredUser = getStoredUser();

    if (restoredUser) {
      setUser(restoredUser);
      setRole(restoredUser.role);
    }
  }, []);

  async function login(email, password) {
    // Future Firebase Auth integration:
    // const credential = await signInWithEmailAndPassword(auth, email, password);
    // const driverQuery = query(collection(db, 'drivers'), where('uid', '==', credential.user.uid), where('hospitalId', '==', hospitalId));
    // Double-check approvalStatus === 'approved' before driver access.
    // Replace localStorage with secure token/session handling before production.
    await new Promise((resolve) => {
      setTimeout(resolve, 900);
    });

    const authenticatedUser = authenticateMockUser(email, password);
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authenticatedUser));

    return authenticatedUser;
  }

  function logout() {
    // Future Firebase Auth integration:
    // await signOut(auth);
    // Clear Firebase tokens/refresh sessions here when real auth is added.
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUser(null);
    setRole(null);
  }

  async function completeDriverPasswordChange(newPassword) {
    // Future Firebase Auth integration:
    // await updatePassword(auth.currentUser, newPassword);
    // await updateDoc(driverRef, { passwordChanged: true });
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Use at least 8 characters for the new password.');
    }
    if (!user?.uid || role !== 'driver') {
      throw new Error('Unable to update the driver password.');
    }

    setDriverPasswordChanged(user.uid);
    const updatedUser = { ...user, requiresPasswordChange: false };
    setUser(updatedUser);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  const value = {
    user,
    role,
    login,
    logout,
    completeDriverPasswordChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
