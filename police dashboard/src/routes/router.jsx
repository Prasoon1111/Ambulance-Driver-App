import { createBrowserRouter } from "react-router-dom";

import { PoliceLayout } from "@/layouts/PoliceLayout";
import { ActiveEmergencies } from "@/pages/ActiveEmergencies";
import { ActivityFeedPage } from "@/pages/ActivityFeed";
import { Alerts } from "@/pages/Alerts";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { LiveTracking } from "@/pages/LiveTracking";
import { Login } from "@/pages/Login";
import { PoliceDashboard } from "@/pages/PoliceDashboard";
import { Register } from "@/pages/Register";
import { Settings } from "@/pages/Settings";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PoliceLayout />,
        children: [
          { index: true, element: <PoliceDashboard /> },
          { path: "admin/dashboard", element: <PoliceDashboard /> },
          { path: "emergencies", element: <ActiveEmergencies /> },
          { path: "tracking", element: <LiveTracking /> },
          { path: "alerts", element: <Alerts /> },
          { path: "activity", element: <ActivityFeedPage /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
