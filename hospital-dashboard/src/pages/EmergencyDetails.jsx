import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Descriptions, Spin } from 'antd';
import { FiClock, FiMapPin } from 'react-icons/fi';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { useEmergency } from '../hooks/useEmergencies';
import { getDriverById, getHospitalById } from '../services/hospitalDataService';

function EmergencyDetails() {
  const { id } = useParams();
  const { emergency, loading, error } = useEmergency(id);

  if (error) {
    return (
      <section className="page-stack">
        <div className="panel glass-card">
          <h2>Error Loading Emergency</h2>
          <p className="error-text">{error}</p>
          <Link className="details-link" to="/emergencies">
            Return to Emergency Operations
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page-stack loading-center">
        <Spin />
      </section>
    );
  }

  if (!emergency) {
    return (
      <section className="page-stack">
        <div className="panel glass-card">
          <h2>Emergency Incident Not Found</h2>
          <p className="body-muted">This emergency incident could not be found in the system.</p>
          <Link className="details-link" to="/emergencies">
            Return to Emergency Operations
          </Link>
        </div>
      </section>
    );
  }

  const assignedHospital = getHospitalById(emergency.hospitalId);
  const emergencyDriver = getDriverById(emergency.driverId, emergency.hospitalId);
  const driverAddress = [emergencyDriver?.city, emergencyDriver?.state].filter(Boolean).join(', ');

  return (
    <motion.section className="page-stack" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="title-group">
        <p className="eyebrow">Emergency Incident - Live Monitoring</p>
        <h2>{emergency.id}</h2>
        <p>
          Critical emergency response coordination and real-time monitoring for smart-city healthcare operations. All
          data updates live.
        </p>
      </div>

      <section className="details-layout">
        <div className="panel glass-card">
          <div className="section-heading split-heading">
            <div>
              <h3>{emergency.incidentType}</h3>
              <p>{emergency.patientName}</p>
            </div>
            <StatusBadge status={emergency.status} priority={emergency.priority} />
          </div>

          <Descriptions column={1} bordered size="small" className="details-table">
            <Descriptions.Item label="Response Unit">{emergency.ambulanceId}</Descriptions.Item>
            <Descriptions.Item label="Emergency Operator">{emergency.driverName}</Descriptions.Item>
            <Descriptions.Item label="Driver Address">{driverAddress}</Descriptions.Item>
            <Descriptions.Item label="Destination Hospital">{emergency.hospitalId}</Descriptions.Item>
            <Descriptions.Item label="Assigned Hospital Name">{assignedHospital?.name || 'Hospital'}</Descriptions.Item>
            <Descriptions.Item label="Assigned Hospital Address">{assignedHospital?.address || 'Address not available'}</Descriptions.Item>
            <Descriptions.Item label="Assigned Hospital Phone">{assignedHospital?.phone || 'Phone not available'}</Descriptions.Item>
            <Descriptions.Item label="Priority Level">
              <span className={`priority-text ${emergency.priority}`}>{emergency.priority}</span>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="details-label-icon">
                  <FiClock size={16} /> Estimated Arrival
                </span>
              }
            >
              <span className="eta-value">{emergency.eta}</span>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="details-label-icon">
                  <FiMapPin size={16} /> GPS Location
                </span>
              }
            >
              <span className="mono-value">
                {emergency.location.latitude.toFixed(6)}, {emergency.location.longitude.toFixed(6)}
              </span>
            </Descriptions.Item>
            {emergency.timestamp && (
              <Descriptions.Item label="Last Updated">
                <span className="body-muted">{new Date(emergency.timestamp).toLocaleTimeString()}</span>
              </Descriptions.Item>
            )}
          </Descriptions>

          <div className="live-status">
            <span />
            Real-time updates active - refreshes every 5 seconds
          </div>
        </div>

        <div className="panel details-map glass-card">
          <div className="section-heading">
            <h3>Live Ambulance Tracking</h3>
            <p>GPS coordinates update as ambulance moves</p>
          </div>
          <LiveMap emergencies={[emergency]} selectedEmergencyId={emergency.id} showFleet={false} />
        </div>
      </section>
    </motion.section>
  );
}

export default EmergencyDetails;
