import { useContext, useEffect, useState } from 'react';
import { Button, Input, Modal, Table, Tabs } from 'antd';
import StatusBadge from '../components/StatusBadge';
import { AuthContext } from '../context/AuthContext';
import {
  listenHospitalDriverRequests,
  listenHospitalAmbulanceRequests,
} from '../services/hospitalRequestService';

function AdminApprovals() {
  const { user } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  useEffect(() => {
    if (!user?.hospitalId) return;

    const unsubDrivers = listenHospitalDriverRequests(user.hospitalId, setDrivers);
    const unsubAmbulances = listenHospitalAmbulanceRequests(user.hospitalId, setAmbulances);

    return () => {
      unsubDrivers();
      unsubAmbulances();
    };
  }, [user?.hospitalId]);

  const driverColumns = [
    { title: 'Name', dataIndex: 'fullName' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'License No', dataIndex: 'licenseNumber' },
    {
      title: 'Documents',
      render: (_, row) => (
        <div className="doc-links">
          {[
            row.documents?.aadhaarCard?.downloadUrl,
            row.documents?.licenseFile?.downloadUrl,
          ]
            .filter(Boolean)
            .map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">View</a>
            ))}
        </div>
      ),
    },
    { title: 'Status', render: (_, row) => <StatusBadge status={row.approvalStatus} /> },
    { title: 'Submitted', render: (_, row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  const ambulanceColumns = [
    { title: 'Number Plate', dataIndex: 'numberPlate' },
    { title: 'Type', dataIndex: 'vehicleType' },
    { title: 'Manufacturer', dataIndex: 'manufacturer' },
    {
      title: 'Documents',
      render: (_, row) => (
        <div className="doc-links">
          {[
            row.documents?.rcBook?.downloadUrl,
            row.documents?.insurance?.downloadUrl,
            row.documents?.vehiclePhoto?.downloadUrl,
          ]
            .filter(Boolean)
            .map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">View</a>
            ))}
        </div>
      ),
    },
    { title: 'Status', render: (_, row) => <StatusBadge status={row.approvalStatus} /> },
    { title: 'Submitted', render: (_, row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Hospital submissions</p>
        <h2>Approval Status</h2>
      </div>
      <div className="panel dense-panel">
        <Tabs
          items={[
            {
              key: 'drivers',
              label: 'Driver Requests',
              children: (
                <Table
                  rowKey="id"
                  columns={driverColumns}
                  dataSource={drivers}
                  size="small"
                />
              ),
            },
            {
              key: 'ambulances',
              label: 'Ambulance Requests',
              children: (
                <Table
                  rowKey="id"
                  columns={ambulanceColumns}
                  dataSource={ambulances}
                  size="small"
                />
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

export default AdminApprovals;