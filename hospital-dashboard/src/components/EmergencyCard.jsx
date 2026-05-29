import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiNavigation, FiTruck, FiUser } from 'react-icons/fi';
import StatusBadge from './StatusBadge';

function EmergencyCard({ emergency, onSelect, selected = false }) {
  const isActive = emergency.status === 'active' || emergency.priority === 'critical';
  const isSelectable = typeof onSelect === 'function';

  return (
    <motion.article
      className={`emergency-card glass-card ${isActive ? 'emergency-glow' : ''} ${selected ? 'selected' : ''} ${
        isSelectable ? 'selectable' : ''
      }`}
      onClick={isSelectable ? () => onSelect(emergency) : undefined}
      onKeyDown={
        isSelectable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(emergency);
              }
            }
          : undefined
      }
      tabIndex={isSelectable ? 0 : undefined}
      aria-pressed={isSelectable ? selected : undefined}
      whileHover={{ y: -5, scale: 1.01 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-header">
        <div className="incident-summary">
          <div className="incident-badges">
            <span className={`priority-badge ${emergency.priority}`}>{emergency.priority}</span>
            <StatusBadge status={emergency.status} priority={emergency.priority} />
          </div>
          <h3>{emergency.id}</h3>
          <p>{emergency.incidentType}</p>
        </div>
      </div>

      <div className="emergency-meta">
        <span>
          <FiTruck /> {emergency.ambulanceId}
        </span>
        <span>
          <FiUser /> {emergency.driverName}
        </span>
        <span>
          <FiClock /> ETA {emergency.eta}
        </span>
        <span>
          <FiMapPin /> {emergency.location.latitude.toFixed(4)}, {emergency.location.longitude.toFixed(4)}
        </span>
      </div>

      <Link className="details-link" to={`/emergency/${emergency.id}`} onClick={(event) => event.stopPropagation()}>
        Open incident <FiNavigation />
      </Link>
    </motion.article>
  );
}

export default EmergencyCard;
