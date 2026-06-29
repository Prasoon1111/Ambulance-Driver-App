import { motion } from 'framer-motion';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { useEmergencies } from '../hooks/useEmergencies';

function LiveTracking() {
  const { emergencies, loading } = useEmergencies();

  return (
    <motion.section
      className="page-stack"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="title-group">
        <p className="eyebrow">GPS Monitoring</p>
        <h2>Live Emergency Tracking</h2>
        <p>
          Real-time GPS monitoring of ambulance units and emergency response
          coordination across the smart-city healthcare infrastructure.
        </p>
      </div>

      <section className="tracking-layout">
        <div className="panel tracking-map-panel glass-card">
          <LiveMap emergencies={emergencies} />
        </div>

        <aside className="panel tracking-list glass-card">
          <div className="section-heading">
            <h3>Response Units</h3>
            <p>Active emergency response fleet status</p>
          </div>

          {loading && <div style={{ padding: 12 }}>Loading units...</div>}

          {!loading && emergencies.length === 0 && (
            <div style={{ padding: 12 }} className="body-muted">
              No active emergencies right now.
            </div>
          )}

          {!loading &&
            emergencies.map((emergency) => (
              <div className="unit-row" key={emergency.id}>
                <div>
                  <strong>{emergency.ambulanceId || 'Unknown Unit'}</strong>
                  <span>{emergency.driverName || 'Unassigned'}</span>
                </div>
                <StatusBadge
                  status={emergency.status}
                  priority={emergency.priority}
                />
                <small>
                  {emergency.location?.latitude && emergency.location?.longitude
                    ? `${emergency.location.latitude.toFixed(4)}, ${emergency.location.longitude.toFixed(4)}`
                    : 'Location unavailable'}
                </small>
              </div>
            ))}
        </aside>
      </section>
    </motion.section>
  );
}

export default LiveTracking;