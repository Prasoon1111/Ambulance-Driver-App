import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Input } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiLogOut, FiSearch, FiZap } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import ProfileMenu from './ProfileMenu';
import { useNotifications } from '../hooks/useNotifications';

function Navbar() {
  const navigate = useNavigate();
  const { logout, user, role } = useContext(AuthContext);
  const { notifications, markRead } = useNotifications({ hospitalId: user?.hospitalId });
  const assignedHospital = user?.hospitalId ? { name: user.hospitalName } : null;
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpenNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function handleLogout() {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    logout();
    navigate('/', { replace: true });
  }

  async function handleMarkRead(notificationId) {
    await markRead(notificationId);
  }

  return (
    <header className="navbar">
      <div className="navbar-title">
        <FiZap />
        <div>
          <strong>{user?.hospitalName || 'Emergency Command Center'}</strong>
          <span>{role || 'role'} control surface</span>
        </div>
      </div>

      <div className="navbar-actions">
        <Input
          className="command-search"
          prefix={<FiSearch />}
          placeholder="Search ambulance, driver, or emergency ID"
        />

        <div ref={bellRef} className="notification-shell">
          <Badge count={notifications.filter((note) => !note.read).length}>
            <motion.button
              className="icon-button bell-button"
              aria-label="Notifications"
              onClick={(e) => {
                e.stopPropagation();
                setOpenNotifications((current) => !current);
                setOpenProfile(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <FiBell />
            </motion.button>
          </Badge>

          <AnimatePresence>
            {openNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{ position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
               <NotificationPanel
  notifications={notifications}
  onClose={() => setOpenNotifications(false)}
  onMarkRead={markRead}
/>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            className="navbar-logout-button"
            icon={<FiLogOut />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </motion.div>

        <div ref={profileRef} style={{ position: 'relative' }}>
          <ProfileMenu
            initials={(user?.email || 'OP').slice(0, 2).toUpperCase()}
            name={user?.email || 'Operator'}
            role={role || 'Operator'}
            hospital={assignedHospital}
            online={true}
            open={openProfile}
            onToggle={() => setOpenProfile((current) => !current)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;