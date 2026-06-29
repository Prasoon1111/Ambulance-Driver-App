import { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {FiActivity, FiAlertTriangle, FiCheckCircle,FiClock, FiRadio, FiShield, FiTruck, FiUsers,} from 'react-icons/fi';
import ActivityTimeline from '../components/ActivityTimeline';
import AlertBanner from '../components/AlertBanner';
import EmergencyCard from '../components/EmergencyCard';
import LiveMap from '../components/LiveMap';
import RoutingAssignmentPanel from '../components/RoutingAssignmentPanel';
import StatCard from '../components/StatCard';
import { useEmergencies, useEmergencyStats } from '../hooks/useEmergencies';
import { fetchNearestAmbulance } from '../services/emergencyRoutingService';
import { AuthContext } from '../context/AuthContext';
import { subscribeHospitalData } from '../services/hospitalDataService';
import { useNavigate } from 'react-router-dom';
function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { emergencies } = useEmergencies();
  const stats = useEmergencyStats();

  const [snapshot, setSnapshot] = useState({
    drivers: [],
    ambulances: [],
    emergencies: [],
    liveLocations: [],
    notifications: [],
  });

  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null);
  const [selectedEmergencySnapshot, setSelectedEmergencySnapshot] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [routeAssignment, setRouteAssignment] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState('');

  const selectedEmergency =
    emergencies.find((e) => e.id === selectedEmergencyId) || selectedEmergencySnapshot;

  useEffect(() => {
    const hospitalId = user?.hospitalId;
    if (!hospitalId) return undefined;
    return subscribeHospitalData(hospitalId, setSnapshot);
  }, [user?.hospitalId, user?.uid]);

  const hospitalStats = useMemo(() => {
    const approvedDrivers = snapshot.drivers.filter(
      (item) => item.status === 'approved'
    );
    const approvedAmbulances = snapshot.ambulances.filter(
      (item) => item.status === 'approved'
    );
    const pendingDrivers = snapshot.drivers.filter(
      (item) => item.status === 'pending'
    );
    const pendingAmbulances = snapshot.ambulances.filter(
      (item) => item.status === 'pending'
    );
    const activeAmbulanceIds = new Set(
      snapshot.emergencies
        .filter((item) => item.status !== 'resolved' && item.status !== 'completed')
        .map((item) => item.ambulanceId)
    );

    return {
      totalDrivers: approvedDrivers.length,
      totalAmbulances: approvedAmbulances.length,
      pendingApprovals: pendingDrivers.length + pendingAmbulances.length,
      activeEmergencies: snapshot.emergencies.filter(
        (item) => item.status !== 'resolved' && item.status !== 'completed'
      ).length,
      availableAmbulances: approvedAmbulances.filter(
        (item) => !activeAmbulanceIds.has(item.id)
      ).length,
      unreadNotifications: snapshot.notifications.filter(
        (note) => !note.read
      ).length,
      activeDrivers: approvedAmbulances.filter(
        (item) => item.activeDriverId
      ).length,
    };
  }, [snapshot]);

  const activityItems = useMemo(
    () =>
      [
        ...snapshot.notifications.map((note) => ({
          id: note.id,
          message: note.message || note.title || 'Notification',
          timestamp: note.createdAt,
          priority: note.read ? 'info' : 'warning',
        })),
        ...snapshot.liveLocations.map((loc) => ({
          id: `loc-${loc.id}`,
          message: `Location update for ${loc.ambulanceId}`,
          timestamp: loc.updatedAt,
          priority: 'info',
        })),
      ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
    [snapshot]
  );

  const getStatusMessage = () => {
    if (stats.totalCount === 0) return 'System monitoring active. No emergencies reported.';
    if (stats.criticalCount > 0)
      return `CRITICAL: ${stats.criticalCount} critical emergency${stats.criticalCount > 1 ? 'ies' : ''} requiring immediate attention`;
    if (stats.activeCount > 0)
      return `Live dispatch: ${stats.activeCount} active emergency${stats.activeCount > 1 ? 'ies' : ''} being coordinated`;
    return 'Live GPS bridge prepared. System ready for incoming emergencies.';
  };

  const handleSelectEmergency = async (emergency) => {
    setSelectedEmergencyId(emergency.id);
    setSelectedEmergencySnapshot(emergency);
    setSelectedAmbulance(null);
    setRouteAssignment(null);
    setRoutingLoading(true);
    setRoutingError('');

    try {
      const assignment = await fetchNearestAmbulance(emergency);
      setSelectedAmbulance(assignment);
      setRouteAssignment(assignment);
    } catch (err) {
      setSelectedAmbulance(null);
      setRouteAssignment(null);
      setRoutingError(err.message || 'Unable to calculate nearest ambulance');
    } finally {
      setRoutingLoading(false);
    }
  };

  return (
    <motion.section className="page-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AlertBanner message={getStatusMessage()} />

      <div className="title-group">
        <p className="eyebrow">Emergency Operations Center</p>
        <h2>Hospital Emergency Coordination Dashboard</h2>
        <p>
          National healthcare infrastructure monitoring for smart-city ambulance dispatch and
          hospital emergency response coordination.
        </p>
      </div>

      <div className="stats-grid">
  <StatCard icon={FiUsers} label="Total Drivers" value={hospitalStats.totalDrivers} helper="approved" onClick={() => navigate('/approvals')} />
  <StatCard icon={FiTruck} label="Total Ambulances" value={hospitalStats.totalAmbulances} helper="approved" onClick={() => navigate('/approvals')} />
  <StatCard icon={FiCheckCircle} label="Pending Approvals" value={hospitalStats.pendingApprovals} helper="drivers + ambulances" tone="amber" onClick={() => navigate('/approvals')} />
  <StatCard icon={FiAlertTriangle} label="Active Emergencies" value={hospitalStats.activeEmergencies} helper="status not resolved" tone="red" onClick={() => navigate('/emergencies')} />
  <StatCard icon={FiShield} label="Unread Notifications" value={hospitalStats.unreadNotifications} helper="count only" tone="amber"onClick={() => document.querySelector('.bell-button')?.click()}/>
  <StatCard icon={FiRadio} label="Available Ambulances" value={hospitalStats.availableAmbulances} helper="approved + inactive" onClick={() => navigate('/approvals')} />
</div>

      <div className="dashboard-grid">
        <section className="panel map-panel glass-card">
          <div className="section-heading">
            <h3>Active Ambulance Tracking</h3>
            <p>Real-time GPS monitoring of emergency response units.</p>
          </div>
          <div className="routing-map-layout">
            <LiveMap
              emergencies={emergencies}
              selectedEmergencyId={selectedEmergencyId}
              routeAssignment={routeAssignment}
              onSelectEmergency={handleSelectEmergency}
            />
            <RoutingAssignmentPanel
              assignment={routeAssignment}
              emergency={selectedEmergency}
              ambulance={selectedAmbulance}
              loading={routingLoading}
              error={routingError}
            />
          </div>
        </section>

        <section className="panel glass-card">
          <div className="section-heading">
            <h3>Live Activity Feed</h3>
            <p>Emergency operations telemetry and dispatch coordination updates.</p>
          </div>
          <ActivityTimeline
            items={
              activityItems.length
                ? activityItems
                : [{ id: 'empty', message: 'No activity yet.', timestamp: new Date().toISOString(), priority: 'info' }]
            }
          />
        </section>
      </div>

      <section className="panel glass-card">
        <div className="section-heading split-heading">
          <div>
            <h3>Emergency Timeline</h3>
            <p>Active critical incidents requiring immediate command center attention.</p>
          </div>
          <span className="pulse-chip">Command Center Active</span>
        </div>

        {emergencies.length === 0 ? (
          <div className="empty-state compact">
            <p>No active emergencies. System monitoring continues.</p>
          </div>
        ) : (
          <div className="emergency-grid compact">
            {emergencies.map((emergency) => (
              <EmergencyCard
                key={emergency.id}
                emergency={emergency}
                onSelect={handleSelectEmergency}
                selected={emergency.id === selectedEmergencyId}
              />
            ))}
          </div>
        )}
      </section>

      {emergencies.length > 0 && (
        <motion.div
          className="panel glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '20px', marginTop: '12px' }}
        >
          <div className="emergency-meta" style={{ gap: '20px' }}>
            <span><FiActivity /> Total Active: {stats.activeCount}</span>
            <span><FiTruck /> Critical Priority: {stats.criticalCount}</span>
            <span><FiAlertTriangle /> High Priority: {stats.highPriorityCount}</span>
            <span><FiClock /> Average Response: {stats.averageEta} mins</span>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default Dashboard;