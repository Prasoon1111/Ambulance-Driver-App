import { createContext, useEffect, useState } from 'react';
import {
  changeCurrentUserPassword,
  observeHospitalAuth,
  signInHospitalUser,
  signOutHospitalUser,
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return observeHospitalAuth(({ user: observedUser, role: observedRole, loading }) => {
      setUser(observedUser);
      setRole(observedRole);
      if (!loading) setAuthLoading(false);
    });
  }, []);

  async function login(email, password) {
    const authenticatedUser = await signInHospitalUser(email, password);
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    return authenticatedUser;
  }

  async function logout() {
    await signOutHospitalUser();
    setUser(null);
    setRole(null);
  }

  async function completeDriverPasswordChange(newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Use at least 8 characters for the new password.');
    }

    if (!user?.uid || role !== 'driver') {
      throw new Error('Unable to update the driver password.');
    }

    await changeCurrentUserPassword(newPassword);
    const updatedUser = { ...user, requiresPasswordChange: false };
    setUser(updatedUser);
    return updatedUser;
  }

  const value = {
    user,
    role,
    authLoading,
    login,
    logout,
    completeDriverPasswordChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}