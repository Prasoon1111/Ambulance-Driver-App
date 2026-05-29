import { FiAlertTriangle, FiClock, FiMapPin, FiTruck, FiUser } from 'react-icons/fi';

function RoutingAssignmentPanel({ assignment, emergency, ambulance, loading = false, error }) {
  const selectedAmbulance = ambulance || assignment;
  const emergencyTitle = emergency?.incidentType || emergency?.title || assignment?.emergencyTitle || emergency?.id;

  if (!emergency && !selectedAmbulance && !loading && !error) {
    return (
      <aside className="routing-panel empty">
        <strong>Select an emergency</strong>
        <span>Nearest available ambulance and route preview will appear here.</span>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="routing-panel">
        <strong>Finding nearest ambulance</strong>
        <span>
          {emergency
            ? `Preparing assignment preview for ${emergency.incidentType || emergency.title || emergency.id}.`
            : 'Checking available units and preparing route preview.'}
        </span>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="routing-panel error">
        <strong>Routing unavailable</strong>
        <span>{error}</span>
      </aside>
    );
  }

  if (emergency && !selectedAmbulance) {
    return (
      <aside className="routing-panel active">
        <div className="routing-panel-header">
          <div>
            <span>Selected Emergency</span>
            <strong>{emergencyTitle}</strong>
          </div>
          <span className={`priority-badge ${emergency.priority}`}>{emergency.priority}</span>
        </div>

        <div className="routing-metrics">
          <div>
            <FiAlertTriangle />
            <span>{emergency.id}</span>
          </div>
          <div>
            <FiMapPin />
            <span>
              {emergency.location.latitude.toFixed(4)}, {emergency.location.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        <p>
          <FiTruck /> Ambulance assignment is being prepared from temporary dummy fleet data.
        </p>
      </aside>
    );
  }

  return (
    <aside className="routing-panel active">
      <div className="routing-panel-header">
        <div>
          <span>Temporary Dispatch Preview</span>
          <strong>{emergencyTitle || selectedAmbulance.emergencyId}</strong>
        </div>
        <span className={`priority-badge ${selectedAmbulance.emergencyPriority || emergency?.priority}`}>
          {selectedAmbulance.emergencyPriority || emergency?.priority}
        </span>
      </div>

      <div className="routing-metrics">
        <div>
          <FiAlertTriangle />
          <span>{emergency?.id || selectedAmbulance.emergencyId}</span>
        </div>
        <div>
          <FiUser />
          <span>{selectedAmbulance.ambulanceId} - {selectedAmbulance.driverName}</span>
        </div>
        <div>
          <FiMapPin />
          <span>{selectedAmbulance.distance}</span>
        </div>
        <div>
          <FiClock />
          <span>{selectedAmbulance.eta}</span>
        </div>
        <div>
          <FiTruck />
          <span>{selectedAmbulance.status}</span>
        </div>
      </div>

      <div className="routing-route">
        <span>{selectedAmbulance.ambulanceId}</span>
        <i />
        <span>{emergency?.id || selectedAmbulance.emergencyId}</span>
        <i />
        <span>Hospital</span>
      </div>

      <p>
        <FiAlertTriangle /> Basic nearest-unit routing only. Traffic and AI dispatch optimization are not active.
      </p>
    </aside>
  );
}

export default RoutingAssignmentPanel;
