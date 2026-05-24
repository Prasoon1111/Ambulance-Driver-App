import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Table, Tabs } from 'antd';
import StatusBadge from '../components/StatusBadge';
import { getAdminQueue, reviewApproval, subscribeHospitalData } from '../services/hospitalDataService';

function AdminApprovals() {
  const [filters, setFilters] = useState({ hospitalId: 'HSP01', status: 'pending', startDate: '', endDate: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [correctionRowId, setCorrectionRowId] = useState('');
  const [correctionMessage, setCorrectionMessage] = useState('');

  useEffect(() => subscribeHospitalData(() => setRefreshKey((key) => key + 1)), []);

  const rows = useMemo(() => getAdminQueue(filters), [filters, refreshKey]);

  function action(row, approvalStatus) {
    if (approvalStatus === 'rejected') {
      Modal.confirm({
        title: 'Reject submission',
        content: (
          <Input.TextArea
            id="adminReviewMessage"
            rows={3}
            placeholder="Reason for rejection"
          />
        ),
        onOk: () => {
          const message = document.getElementById('adminReviewMessage')?.value || '';
          reviewApproval({ collectionName: row.collectionName, itemId: row.id, approvalStatus, adminReviewMessage: message });
        },
      });
      return;
    }
    reviewApproval({ collectionName: row.collectionName, itemId: row.id, approvalStatus });
  }

  function requestCorrection(row) {
    reviewApproval({
      collectionName: row.collectionName,
      itemId: row.id,
      approvalStatus: 'needs_correction',
      adminReviewMessage: correctionMessage,
    });
    setCorrectionRowId('');
    setCorrectionMessage('');
  }

  const columns = [
    { title: 'Hospital', dataIndex: 'hospitalName' },
    { title: 'Name/Plate', dataIndex: 'name' },
    { title: 'Submitted data', render: (_, row) => row.collectionName === 'drivers' ? row.licenseNumber : `${row.vehicleType} / ${row.capacity}` },
    {
      title: 'Documents',
      render: (_, row) => (
        <div className="doc-links">
          {[row.aadhaarCardUrl, row.licenseUrl, row.rcBookUrl, row.insuranceUrl, row.pucUrl, row.vehiclePhotoUrl]
            .filter(Boolean)
            .map((url) => <a key={url} href={url}>Document</a>)}
        </div>
      ),
    },
    { title: 'Status', render: (_, row) => <StatusBadge status={row.approvalStatus} /> },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="table-actions">
          <Button size="small" onClick={() => action(row, 'approved')}>Approve</Button>
          <Button size="small" danger onClick={() => action(row, 'rejected')}>Reject</Button>
          {correctionRowId === row.id ? (
            <>
              <Input
                size="small"
                value={correctionMessage}
                placeholder="License image is blurry"
                onChange={(event) => setCorrectionMessage(event.target.value)}
              />
              <Button size="small" disabled={!correctionMessage.trim()} onClick={() => requestCorrection(row)}>Send</Button>
            </>
          ) : (
            <Button size="small" onClick={() => setCorrectionRowId(row.id)}>Request Correction</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Admin controls</p>
        <h2>Approval Queue</h2>
      </div>
      <div className="panel filter-controls">
        <Select value={filters.hospitalId} onChange={(hospitalId) => setFilters((current) => ({ ...current, hospitalId }))} options={[
          { value: 'HSP01', label: 'CityCare General Hospital' },
          { value: 'HSP02', label: 'Metro Trauma Institute' },
        ]} />
        <Input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
      </div>
      <div className="panel dense-panel">
        <Tabs
          items={[
            {
              key: 'drivers',
              label: 'Pending Drivers',
              children: <Table rowKey={(row) => `${row.collectionName}-${row.id}`} columns={columns} dataSource={rows.filter((row) => row.collectionName === 'drivers')} size="small" />,
            },
            {
              key: 'ambulances',
              label: 'Pending Ambulances',
              children: <Table rowKey={(row) => `${row.collectionName}-${row.id}`} columns={columns} dataSource={rows.filter((row) => row.collectionName === 'ambulances')} size="small" />,
            },
          ]}
        />
      </div>
    </section>
  );
}

export default AdminApprovals;
