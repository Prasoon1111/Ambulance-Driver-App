import { useContext, useState } from 'react';
import { Button, Input } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { submitDriverRegistration } from '../services/hospitalDataService';

function DriverRegistration() {
  const { user } = useContext(AuthContext);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({});

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitDriverRegistration(user.hospitalId, form);
    setSubmitted(true);
  }

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">Driver onboarding</p>
        <h2>Register Driver</h2>
      </div>

      {submitted && (
        <div className="status-card submitted">
          <strong>Submitted. Awaiting admin approval.</strong>
          <span>The driver cannot access the app until approvalStatus is approved.</span>
        </div>
      )}

      <form className="ops-form panel" onSubmit={handleSubmit}>
        {[
          ['fullName', 'Full name'],
          ['phone', 'Phone'],
          ['email', 'Email'],
          ['aadhaarNumber', 'Aadhaar number'],
          ['licenseNumber', 'License number'],
          ['licenseExpiry', 'License expiry'],
          ['emergencyContact', 'Emergency contact'],
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <Input
              type={field === 'email' ? 'email' : field === 'licenseExpiry' ? 'date' : 'text'}
              required
              value={form[field] || ''}
              onChange={(event) => update(field, event.target.value)}
            />
          </label>
        ))}

        {[
          ['streetAddress', 'Street Address'],
          ['city', 'City'],
          ['state', 'State'],
          ['pincode', 'Pincode'],
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <Input value={form[field] || ''} onChange={(event) => update(field, event.target.value)} />
          </label>
        ))}

        <label>
          Aadhaar Card
          <Input type="file" required onChange={(event) => update('aadhaarCard', event.target.files?.[0])} />
        </label>
        <label>
          Driving License
          <Input type="file" required onChange={(event) => update('licenseFile', event.target.files?.[0])} />
        </label>

        <Button type="primary" htmlType="submit" className="ops-submit">Submit for approval</Button>
      </form>
    </section>
  );
}

export default DriverRegistration;
