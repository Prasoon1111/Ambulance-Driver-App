import { Navigate, Outlet } from "react-router-dom";

import { usePoliceStore } from "@/store/policeStore";

export function ProtectedRoute() {
  const isAuthenticated = usePoliceStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
