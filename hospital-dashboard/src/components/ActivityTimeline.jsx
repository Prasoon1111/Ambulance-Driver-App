import { motion } from 'framer-motion';

function ActivityTimeline({ items = [] }) {
  // Helper to format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return 'earlier';
  };

  return (
    <div className="timeline">
      {items.map((item, index) => {
        // Handle both string and object formats for backward compatibility
        const message = typeof item === 'string' ? item : item.message;
        const priority = typeof item === 'string' ? 'info' : item.priority || 'info';
        const timestamp = typeof item === 'string' ? null : item.timestamp;

        return (
          <motion.div
            className={`timeline-item timeline-${priority}`}
            key={`${message}-${index}`}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <span />
            <p>{message}</p>
            <small>{getTimeAgo(timestamp)}</small>
          </motion.div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;
