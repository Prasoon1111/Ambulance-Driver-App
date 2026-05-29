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
    >
      <div className="notification-panel-header">
        <div>
          <p className="panel-overline">Dispatch Alerts</p>
          <strong>Notifications</strong>
        </div>
        <button className="icon-button small" onClick={onClose} aria-label="Close notifications">
          <FiX />
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 && (
          <div className="notification-empty">
            No notifications
          </div>
        )}

        {notifications.map((note) => {
          const title = note.title || note.message || note.text || 'Emergency operations update';
          const message = note.message || note.text || title;
          const type = note.type || 'system';
          const timeLabel = new Date(note.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <motion.article
              className="notification-item"
              key={note.id}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.18 }}
              tabIndex={0}
              onClick={() => onMarkRead?.(note.id)}
              aria-label={`Notification: ${message}. Received at ${timeLabel}.`}
            >
              <div className="notification-item-top">
                <span className={`notification-dot ${note.read ? 'read' : 'info'}`} aria-hidden="true" />
                <div className="notification-details">
                  <div className="notification-title-row">
                    <p className="notification-title">{title}</p>
                  </div>
                  <p className="notification-message">{message}</p>
                  <p className="notification-meta">{timeLabel}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.div>
  );
}
