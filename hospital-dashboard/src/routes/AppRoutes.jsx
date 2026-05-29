import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ActiveEmergencies from '../pages/ActiveEmergencies';
import LiveTracking from '../pages/LiveTracking';
import EmergencyDetails from '../pages/EmergencyDetails';
import AdminApprovals from '../pages/AdminApprovals';
import AmbulanceRegistration from '../pages/AmbulanceRegistration';
import Analytics from '../pages/Analytics';
import ApprovalManagement from '../pages/ApprovalManagement';
import DriverApp from '../pages/DriverApp';
import DriverRegistration from '../pages/DriverRegistration';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers/register" element={<DriverRegistration />} />
        <Route path="/ambulances/register" element={<AmbulanceRegistration />} />
        <Route path="/approvals" element={<ApprovalManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="/emergencies" element={<ActiveEmergencies />} />
        <Route path="/tracking" element={<LiveTracking />} />
        <Route path="/emergency/:id" element={<EmergencyDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
