import { useContext, useMemo } from 'react';
import { Table } from 'antd';
import { FiActivity, FiAlertTriangle, FiClock, FiTruck } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import { AuthContext } from '../context/AuthContext';
import { useEmergencies } from '../hooks/useEmergencies';

function Analytics() {
  const { user } = useContext(AuthContext);
  const { emergencies, loading } = useEmergencies();

  const stats = useMemo(() => {
    const completed = emergencies.filter(
      (e) => e.status === 'completed' || e.status === 'resolved'
    );
    const active = emergencies.filter(
      (e) => e.status === 'active' || e.status === 'dispatched'
    );
    const critical = emergencies.filter((e) => e.priority === 'critical');

    const avgEta = emergencies.length
      ? Math.round(
          emergencies.reduce((sum, e) => {
            const match = e.eta?.match(/(\d+)/);
            return sum + (match ? parseInt(match[1], 10) : 0);
          }, 0) / emergencies.length
        )
      : 0;

    return { completed, active, critical, avgEta };
  }, [emergencies]);

  const columns = [
    { title: 'Emergency ID', dataIndex: 'id' },
    { title: 'Incident Type', dataIndex: 'incidentType', render: (v) => v || 'N/A' },
    { title: 'Patient', dataIndex: 'patientName', render: (v) => v || 'N/A' },
    { title: 'Driver', dataIndex: 'driverName', render: (v) => v || 'Unassigned' },
    { title: 'Ambulance', dataIndex: 'ambulanceId', render: (v) => v || 'N/A' },
    { title: 'Priority', dataIndex: 'priority', render: (v) => v?.toUpperCase() || 'N/A' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => v?.toUpperCase() || 'N/A',
    },
    { title: 'ETA', dataIndex: 'eta', render: (v) => v || 'N/A' },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Hospital analytics</p>
        <h2>Emergency Performance</h2>
      </div>

      <div className="stats-grid">
        <StatCard icon={FiClock} label="Avg ETA" value={`${stats.avgEta}m`} helper="All emergencies" tone="amber" />
        <StatCard icon={FiActivity} label="Total Emergencies" value={emergencies.length} helper="All time" />
        <StatCard icon={FiTruck} label="Completed" value={stats.completed.length} helper="Resolved + completed" />
        <StatCard icon={FiAlertTriangle} label="Critical" value={stats.critical.length} helper="Priority critical" tone="red" />
      </div>

      <div className="panel dense-panel">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={emergencies}
          size="small"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </section>
  );
}

export default Analytics;