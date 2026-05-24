import { useContext, useEffect, useMemo, useState } from 'react';
import { Table } from 'antd';
import StatCard from '../components/StatCard';
import { AuthContext } from '../context/AuthContext';
import { getHospitalSnapshot, subscribeHospitalData } from '../services/hospitalDataService';
import { FiActivity, FiClock } from 'react-icons/fi';

function Analytics() {
  const { user } = useContext(AuthContext);
  const [snapshot, setSnapshot] = useState(() => getHospitalSnapshot(user.hospitalId));

  useEffect(() => subscribeHospitalData(() => setSnapshot(getHospitalSnapshot(user.hospitalId))), [user.hospitalId]);

  const monthRows = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return snapshot.analytics.filter((row) => (row.createdAt || '').startsWith(month));
  }, [snapshot.analytics]);

  const avgResponse = monthRows.length
    ? Math.round(monthRows.reduce((sum, row) => sum + Number(row.responseTime || 0), 0) / monthRows.length)
    : 0;

  const columns = [
    { title: 'Emergency ID', dataIndex: 'emergencyId' },
    { title: 'Driver ID', dataIndex: 'driverId' },
    { title: 'Ambulance ID', dataIndex: 'ambulanceId' },
    { title: 'Response Time', render: (_, row) => `${row.responseTime} min` },
    { title: 'Total Duration', render: (_, row) => `${row.totalDuration} min` },
    { title: 'Date', render: (_, row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Hospital analytics</p>
        <h2>Emergency Performance</h2>
      </div>
      <div className="stats-grid">
        <StatCard icon={FiClock} label="Avg Response Time" value={`${avgResponse}m`} helper="Current month" tone="amber" />
        <StatCard icon={FiActivity} label="Total Emergencies" value={monthRows.length} helper="Current month" />
      </div>
      <div className="panel dense-panel">
        <Table rowKey="id" columns={columns} dataSource={snapshot.analytics} size="small" />
      </div>
    </section>
  );
}

export default Analytics;
