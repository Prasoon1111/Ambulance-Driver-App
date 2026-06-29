import { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { createDriverRequest, resubmitDriverRequest } from '../services/hospitalRequestService';

function DriverRegistration() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const resubmitMode = location.state?.resubmit || false;
  const requestId = location.state?.requestId || null;
  const prefill = location.state?.prefill || {};

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: prefill.name || '',
    phone: prefill.phone || '',
    email: prefill.email || '',
    aadhaarNumber: prefill.aadhaarNumber || '',
    licenseNumber: prefill.licenseNumber || '',
    licenseExpiry: prefill.licenseExpiry || '',
    emergencyContact: prefill.emergencyContact || '',
    streetAddress: prefill.streetAddress || '',
    city: prefill.city || '',
    state: prefill.state || '',
    pincode: prefill.pincode || '',
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user?.hospitalId) {
      setError('Hospital profile is missing. Please login again.');
      return;
    }
    setError('');
    setSubmitted(false);
    setSubmitting(true);
    try {
      if (resubmitMode && requestId) {
        await resubmitDriverRequest(user.hospitalId, requestId, form);
      } else {
        await createDriverRequest(user.hospitalId, form);
        setForm({});
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit driver request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="title-group compact-title">
        <p className="eyebrow">{resubmitMode ? 'Resubmission' : 'Driver onboarding'}</p>
        <h2>{resubmitMode ? 'Edit & Resubmit Driver' : 'Register Driver'}</h2>
        {resubmitMode && prefill.message && (
          <div className="status-card rejected">
            <strong>Admin feedback:</strong>
            <span>{prefill.message}</span>
          </div>
        )}
      </div>

      {submitted && (
        <div className="status-card submitted">
          <strong>{resubmitMode ? 'Resubmitted successfully.' : 'Submitted. Awaiting admin approval.'}</strong>
          <span>{resubmitMode ? 'Admin will review your updated request.' : 'The request is now saved in pending_drivers.'}</span>
        </div>
      )}

      {error && (
        <div className="status-card rejected">
          <strong>Submission failed.</strong>
          <span>{error}</span>
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
            <Input
              value={form[field] || ''}
              onChange={(event) => update(field, event.target.value)}
            />
          </label>
        ))}

        <label>
          Aadhaar Card
          {resubmitMode && <span className="body-muted"> (only upload if you want to replace)</span>}
          <Input
            type="file"
            required={!resubmitMode}
            onChange={(event) => update('aadhaarCard', event.target.files?.[0])}
          />
        </label>

        <label>
          Driving License
          {resubmitMode && <span className="body-muted"> (only upload if you want to replace)</span>}
          <Input
            type="file"
            required={!resubmitMode}
            onChange={(event) => update('licenseFile', event.target.files?.[0])}
          />
        </label>

        <Button
          type="primary"
          htmlType="submit"
          className="ops-submit"
          loading={submitting}
          disabled={submitting || submitted}
        >
          {submitting ? 'Submitting...' : resubmitMode ? 'Resubmit for approval' : 'Submit for approval'}
        </Button>
      </form>
    </section>
  );
}

export default DriverRegistration;