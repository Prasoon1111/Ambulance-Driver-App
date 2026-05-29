import { useContext, useEffect, useMemo, useState } from 'react';
import { Table, Tabs } from 'antd';
import StatusBadge from '../components/StatusBadge';
import { AuthContext } from '../context/AuthContext';
import { getHospitalById, getHospitalSnapshot, subscribeHospitalData } from '../services/hospitalDataService';

function ApprovalManagement() {
  const { user } = useContext(AuthContext);
  const [snapshot, setSnapshot] = useState(() => getHospitalSnapshot(user.hospitalId));

  useEffect(() => subscribeHospitalData(() => setSnapshot(getHospitalSnapshot(user.hospitalId))), [user.hospitalId]);

  const driverColumns = [
    { title: 'Name/Plate', dataIndex: 'name' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Address', render: (_, row) => [row.city, row.state].filter(Boolean).join(', ') },
    { title: 'License Expiry', dataIndex: 'licenseExpiry' },
    { title: 'Status', render: (_, row) => <StatusBadge status={row.approvalStatus} /> },
    { title: 'Admin message', dataIndex: 'adminReviewMessage', render: (value) => value || 'None' },
    { title: 'Action', render: (_, row) => (row.approvalStatus === 'needs_correction' ? <button className="text-action">Resubmit</button> : 'View only') },
  ];

  function assignedHospital(driver) {
    return getHospitalById(driver.hospitalId) || snapshot.hospital;
  }

  const ambulanceColumns = [
    { title: 'Plate', dataIndex: 'numberPlate' },
    { title: 'Type', dataIndex: 'vehicleType' },
    { title: 'Capacity', dataIndex: 'capacity' },
    {
      title: 'Active Driver',
      render: (_, row) => snapshot.drivers.find((driver) => driver.uid === row.activeDriverId || driver.id === row.activeDriverId)?.fullName || 'None',
    },
    { title: 'Status', render: (_, row) => <StatusBadge status={row.approvalStatus} /> },
    { title: 'Admin message', dataIndex: 'adminReviewMessage', render: (value) => value || 'None' },
    { title: 'Action', render: (_, row) => (row.approvalStatus === 'needs_correction' ? <button className="text-action">Resubmit</button> : 'View only') },
  ];

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Hospital scoped fleet</p>
        <h2>My Fleet</h2>
      </div>
      <div className="panel dense-panel">
        <Tabs
          items={[
            {
              key: 'drivers',
              label: 'Drivers',
              children: (
                <Table
                  rowKey="id"
                  columns={driverColumns}
                  dataSource={snapshot.drivers.map((driver) => ({ ...driver, name: driver.fullName }))}
                  size="small"
                  pagination={{ pageSize: 8 }}
                  expandable={{
                    expandedRowRender: (row) => {
                      const hospital = assignedHospital(row);
                      return (
                        <div className="driver-detail-panel">
                          {row.approvalStatus === 'needs_correction' && (
                            <div className="inline-message">{row.adminReviewMessage}</div>
                          )}
                          <section className="assigned-hospital">
                            <h4>Address</h4>
                            <dl>
                              <div><dt>Street:</dt><dd>{row.streetAddress || ''}</dd></div>
                              <div><dt>City:</dt><dd>{row.city || ''}</dd></div>
                              <div><dt>State:</dt><dd>{row.state || ''}</dd></div>
                              <div><dt>Pincode:</dt><dd>{row.pincode || ''}</dd></div>
                            </dl>
                          </section>
                          <section className="assigned-hospital">
                            <h4>Assigned Hospital</h4>
                            <dl>
                              <div><dt>Name:</dt><dd>{hospital?.name || 'Hospital'}</dd></div>
                              <div><dt>Address:</dt><dd>{hospital?.address || 'Address not available'}</dd></div>
                              <div><dt>Phone:</dt><dd>{hospital?.phone || 'Phone not available'}</dd></div>
                            </dl>
                          </section>
                        </div>
                      );
                    },
                    rowExpandable: () => true,
                  }}
                />
              ),
            },
            {
              key: 'ambulances',
              label: 'Ambulances',
              children: (
                <Table
                  rowKey="id"
                  columns={ambulanceColumns}
                  dataSource={snapshot.ambulances}
                  size="small"
                  pagination={{ pageSize: 8 }}
                  expandable={{
                    expandedRowRender: (row) => row.approvalStatus === 'needs_correction' ? <div className="inline-message">{row.adminReviewMessage}</div> : null,
                    rowExpandable: (row) => row.approvalStatus === 'needs_correction',
                  }}
                />
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

export default ApprovalManagement;
