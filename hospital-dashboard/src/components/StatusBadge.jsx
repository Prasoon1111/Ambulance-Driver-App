const statusLabels = {
  active: 'Active',
  critical: 'Critical',
  dispatched: 'Dispatched',
  arrived: 'Arrived',
  completed: 'Completed',
  assigned: 'Assigned',
  resolved: 'Resolved',
  pending: 'Pending',
  approved: 'Approved',
  needs_correction: 'Needs Correction',
  rejected: 'Rejected',
};

function StatusBadge({ status = 'active', priority }) {
  const tone = priority === 'critical' || status === 'critical' ? 'critical' : status;

  return <span className={`status-badge ${tone}`}>{statusLabels[status] || status}</span>;
}

export default StatusBadge;
