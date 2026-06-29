import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Table, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  listenHospitalAmbulanceRequests,
  listenHospitalDriverRequests,
} from '../services/hospitalRequestService';

function ApprovalManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.hospitalId) return undefined;

    const unsubscribeDrivers = listenHospitalDriverRequests(
      user.hospitalId,
      setDrivers,
      (listenerError) => setError(listenerError.message || 'Unable to load driver requests.')
    );

    const unsubscribeAmbulances = listenHospitalAmbulanceRequests(
      user.hospitalId,
      setAmbulances,
      (listenerError) => setError(listenerError.message || 'Unable to load ambulance requests.')
    );

    return () => {
      unsubscribeDrivers();
      unsubscribeAmbulances();
    };
  }, [user?.hospitalId]);

  const driverRows = useMemo(
    () =>
      drivers.map((driver) => ({
        key: driver.id,
        name: driver.driverName || driver.fullName,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        status: driver.status,
        submittedAt: formatDate(driver.submittedAt),
        message: driver.rejectionReason || driver.adminReviewMessage || '',
        documents: driver.documents || {},
      })),
    [drivers]
  );

  const ambulanceRows = useMemo(
    () =>
      ambulances.map((ambulance) => ({
        key: ambulance.id,
        numberPlate: ambulance.numberPlate,
        registrationNumber: ambulance.registrationNumber,
        vehicleType: ambulance.vehicleType,
        capacity: ambulance.capacity,
        status: ambulance.status,
        submittedAt: formatDate(ambulance.submittedAt),
        message: ambulance.rejectionReason || ambulance.adminReviewMessage || '',
        documents: ambulance.documents || {},
      })),
    [ambulances]
  );

  const driverColumns = [
    { title: 'Driver', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'License', dataIndex: 'licenseNumber' },
    { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge status={status} /> },
    { title: 'Submitted', dataIndex: 'submittedAt' },
    { title: 'Message', dataIndex: 'message' },
    {
      title: 'Documents',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {row.documents?.aadhaar?.downloadUrl && (
            <a href={row.documents.aadhaar.downloadUrl} target="_blank" rel="noreferrer">
              Aadhaar
            </a>
          )}
          {row.documents?.drivingLicence?.downloadUrl && (
            <a href={row.documents.drivingLicence.downloadUrl} target="_blank" rel="noreferrer">
              Licence
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      render: (_, row) =>
        row.status === 'rejected' || row.status === 'resubmission_required' ? (
          <Button
            size="small"
            type="primary"
            onClick={() =>
              navigate('/drivers/register', {
                state: { resubmit: true, requestId: row.key, prefill: row },
              })
            }
          >
            Edit & Resubmit
          </Button>
        ) : null,
    },
  ];

  const ambulanceColumns = [
    { title: 'Number Plate', dataIndex: 'numberPlate' },
    { title: 'Registration', dataIndex: 'registrationNumber' },
    { title: 'Type', dataIndex: 'vehicleType' },
    { title: 'Capacity', dataIndex: 'capacity' },
    { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge status={status} /> },
    { title: 'Submitted', dataIndex: 'submittedAt' },
    { title: 'Message', dataIndex: 'message' },
    {
      title: 'Documents',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {row.documents?.rcBook?.downloadUrl && (
            <a href={row.documents.rcBook.downloadUrl} target="_blank" rel="noreferrer">
              RC Book
            </a>
          )}
          {row.documents?.insurance?.downloadUrl && (
            <a href={row.documents.insurance.downloadUrl} target="_blank" rel="noreferrer">
              Insurance
            </a>
          )}
          {row.documents?.puc?.downloadUrl && (
            <a href={row.documents.puc.downloadUrl} target="_blank" rel="noreferrer">
              PUC
            </a>
          )}
          {row.documents?.vehiclePhoto?.downloadUrl && (
            <a href={row.documents.vehiclePhoto.downloadUrl} target="_blank" rel="noreferrer">
              Photo
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      render: (_, row) =>
        row.status === 'rejected' || row.status === 'resubmission_required' ? (
          <Button
            size="small"
            type="primary"
            onClick={() =>
              navigate('/ambulances/register', {
                state: { resubmit: true, requestId: row.key, prefill: row },
              })
            }
          >
            Edit & Resubmit
          </Button>
        ) : null,
    },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Verification tracking</p>
        <h2>Approval Status</h2>
      </div>

      {error && (
        <div className="status-card rejected">
          <strong>Unable to load requests.</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="panel">
        <Tabs
          items={[
            {
              key: 'drivers',
              label: `Drivers (${driverRows.length})`,
              children: (
                <Table
                  columns={driverColumns}
                  dataSource={driverRows}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
            {
              key: 'ambulances',
              label: `Ambulances (${ambulanceRows.length})`,
              children: (
                <Table
                  columns={ambulanceColumns}
                  dataSource={ambulanceRows}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return '-';
  if (typeof value.toDate === 'function') return value.toDate().toLocaleString();
  return new Date(value).toLocaleString();
}

export default ApprovalManagement;