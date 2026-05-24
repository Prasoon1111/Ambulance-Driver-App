import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiBarChart2, FiCheckSquare, FiHome, FiLogOut, FiMapPin, FiPlusCircle, FiTruck, FiUserPlus } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const { logout, role } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <motion.div className="sidebar" initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      <div className="sidebar-brand">
        <span className="brand-mark">EC</span>
        <div>
          <h1>Emergency Command</h1>
          <p>Smart City Operations</p>
        </div>
      </div>
      <nav>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/dashboard">
              <FiHome /> Dashboard
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/emergencies">
              <FiAlertTriangle /> Active Emergencies
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/tracking">
              <FiMapPin /> Live Tracking
            </NavLink>
          </li>
          {role === 'hospital_admin' && (
            <>
              <li className="sidebar-item">
                <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/drivers/register">
                  <FiUserPlus /> Register Driver
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/ambulances/register">
                  <FiTruck /> Register Ambulance
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/approvals">
                  <FiCheckSquare /> My Fleet
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/analytics">
                  <FiBarChart2 /> Analytics
                </NavLink>
              </li>
            </>
          )}
          {role === 'admin' && (
            <li className="sidebar-item">
              <NavLink className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} to="/admin/approvals">
                <FiPlusCircle /> Admin Queue
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="sidebar-signal">
        <FiActivity />
        <div>
          <strong>GPS Sync Ready</strong>
          <span>location.latitude / longitude</span>
        </div>
      </div>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </motion.div>
  );
}

export default Sidebar;
