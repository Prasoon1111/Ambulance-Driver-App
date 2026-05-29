import { motion } from 'framer-motion';
import { FiUser, FiPower, FiActivity } from 'react-icons/fi';

export default function ProfileMenu({
  initials = 'CC',
  name = 'Operator',
  role = 'Dispatcher',
  online = true,
  open = false,
  hospital = null,
  onToggle = () => {},
  onLogout = () => {},
}) {
  return (
    <div className="profile-menu-shell">
      <motion.button
        className="operator-pill profile-button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`avatar-circle ${online ? 'online' : 'offline'}`}>{initials}</div>
        <div className="profile-button-text">
          <strong>{name}</strong>
          <small>
            {role} {online && <span>Online</span>}
          </small>
        </div>
      </motion.button>

      {open && (
        <motion.div
          className="profile-dropdown glass-card"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          style={{ position: 'absolute', right: 18, top: 64, width: 220, zIndex: 60 }}
        >
          <div className="profile-dropdown-inner">
            <div className="profile-dropdown-header">
              <div className="avatar-circle large">{initials}</div>
              <div>
                <strong>{name}</strong>
                <div>{role}</div>
              </div>
            </div>

            <div className="profile-dropdown-actions">
              {hospital && (
                <div className="profile-hospital-card">
                  <strong>Assigned Hospital</strong>
                  <span>{hospital.name}</span>
                  <small>{hospital.address}</small>
                  <small>{hospital.phone}</small>
                </div>
              )}
              <button className="dropdown-action">
                <FiUser /> <span>Profile</span>
              </button>
              <button className="dropdown-action">
                <FiActivity /> <span>System Status</span>
              </button>
              <button className="dropdown-action" onClick={onLogout}>
                <FiPower /> <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
