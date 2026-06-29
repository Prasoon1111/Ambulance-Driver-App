import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function NotificationPanel({ notifications = [], onClose, onMarkRead }) {
  return (
    <motion.div
      className="notification-panel glass-card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      style={{ width: 360, position: 'absolute', right: 0, top: 44, zIndex: 50 }}
      role="region"
      aria-label="Emergency notifications"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="notification-panel-header">
        <div>
          <p className="panel-overline">Dispatch Alerts</p>
          <strong>Notifications ({notifications.filter((n) => !n.read).length} unread)</strong>
        </div>
        <button className="icon-button small" onClick={onClose} aria-label="Close notifications">
          <FiX />
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 && (
          <div className="notification-empty">No notifications yet</div>
        )}

        {notifications.map((note) => {
          const title = note.title || note.type?.replaceAll('_', ' ') || 'System update';
          const message = note.message || '';
          const timeLabel = note.timestamp
            ? new Date(
                note.timestamp?.toDate ? note.timestamp.toDate() : note.timestamp
              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <motion.article
              className={`notification-item ${note.read ? '' : 'unread'}`}
              key={note.id}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead?.(note.id);
              }}
              style={{ opacity: note.read ? 0.7 : 1, cursor: 'pointer' }}
            >
              <div className="notification-item-top">
                <span
                  className={`notification-dot ${note.read ? 'success' : 'info'}`}
                  aria-hidden="true"
                />
                <div className="notification-details">
                  <div className="notification-title-row">
                    <p className="notification-title">{title}</p>
                    {!note.read && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: '#B91C1C',
                        background: '#FEE2E2',
                        padding: '2px 8px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  {message && <p className="notification-message">{message}</p>}
                  {timeLabel && <p className="notification-meta">{timeLabel}</p>}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.div>
  );
}