import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Select } from 'antd';
import { AuthContext } from '../context/AuthContext';
import {
  CAPACITIES,
  MEDICAL_CAPABILITIES,
  VEHICLE_TYPES,
  getHospitalSnapshot,
  submitAmbulanceRegistration,
  subscribeHospitalData,
} from '../services/hospitalDataService';

function AmbulanceRegistration() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ medicalCapabilities: [], assignedDrivers: [] });
  const [snapshot, setSnapshot] = useState(() => getHospitalSnapshot(user.hospitalId));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => subscribeHospitalData(() => setSnapshot(getHospitalSnapshot(user.hospitalId))), [user.hospitalId]);

  const approvedDrivers = useMemo(
    () => snapshot.drivers.filter((driver) => driver.approvalStatus === 'approved'),
    [snapshot.drivers]
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitAmbulanceRegistration(user.hospitalId, form);
    setSubmitted(true);
  }

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Fleet onboarding</p>
        <h2>Register Ambulance</h2>
      </div>

      {submitted && (
        <div className="status-card submitted">
          <strong>Submitted. Awaiting admin approval.</strong>
          <span>Hospital admins can track status but cannot approve this ambulance.</span>
        </div>
      )}

      <form className="ops-form panel" onSubmit={handleSubmit}>
        {[
          ['numberPlate', 'Number plate'],
          ['manufacturer', 'Manufacturer'],
          ['model', 'Model'],
          ['registrationNumber', 'Registration number'],
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <Input required value={form[field] || ''} onChange={(event) => update(field, event.target.value)} />
          </label>
        ))}

        <label>
          Vehicle type
          <Select required options={VEHICLE_TYPES} onChange={(value) => update('vehicleType', value)} />
        </label>
        <label>
          Capacity
          <Select required options={CAPACITIES.map((value) => ({ value, label: value }))} onChange={(value) => update('capacity', value)} />
        </label>
        <label className="full-span">
          Medical capabilities
          <Checkbox.Group options={MEDICAL_CAPABILITIES} value={form.medicalCapabilities} onChange={(value) => update('medicalCapabilities', value)} />
        </label>
        <label className="full-span">
          Assigned drivers
          <Select
            mode="multiple"
            showSearch
            value={form.assignedDrivers}
            options={approvedDrivers.map((driver) => ({ value: driver.id, label: `${driver.fullName} (${driver.licenseNumber})` }))}
            onChange={(value) => update('assignedDrivers', value)}
          />
        </label>

        {[
          ['rcBook', 'RC Book'],
          ['insurance', 'Insurance Certificate'],
          ['puc', 'PUC Certificate'],
          ['vehiclePhoto', 'Vehicle Photo'],
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <Input type="file" required onChange={(event) => update(field, event.target.files?.[0])} />
          </label>
        ))}

        <Button type="primary" htmlType="submit" className="ops-submit">Submit for approval</Button>
      </form>
    </section>
  );
}

export default AmbulanceRegistration;
