import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const storageKey = "resq-command-authenticated";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.sessionStorage.getItem(storageKey) === "true",
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      login() {
        window.sessionStorage.setItem(storageKey, "true");
        setIsAuthenticated(true);
      },
      logout() {
        window.sessionStorage.removeItem(storageKey);
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
