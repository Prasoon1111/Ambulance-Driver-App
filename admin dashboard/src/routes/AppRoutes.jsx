import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ActivityLogs from "../pages/ActivityLogs/ActivityLogs.jsx";
import Ambulances from "../pages/Ambulances/Ambulances.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Drivers from "../pages/Drivers/Drivers.jsx";
import Emergencies from "../pages/Emergencies/Emergencies.jsx";
import Hospitals from "../pages/Hospitals/Hospitals.jsx";
import Settings from "../pages/Settings/Settings.jsx";
import Login from "../pages/Login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "hospitals", element: <Hospitals /> },
          { path: "drivers", element: <Drivers /> },
          { path: "ambulances", element: <Ambulances /> },
          { path: "emergencies", element: <Emergencies /> },
          { path: "activity-logs", element: <ActivityLogs /> },
          { path: "settings", element: <Settings /> },
          { path: "*", element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
    ],
  },
]);
