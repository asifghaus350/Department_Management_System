import { useState } from 'react';
import api, { apiMessage } from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';
import { Alert, Card, ErrorBox, Field, Loading, PageHeader } from '../components/UI';

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const { data, loading, error, reload } = useFetch('/api/profile');
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const current = form || data || {};
  const fields = ['name', 'email', 'phone', 'address', 'qualification', 'researchInterest'];

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrorMessage('');
    try {
      const payload = Object.fromEntries(fields.map((key) => [key, current[key] || '']));
      const { data: updated } = await api.put('/api/profile', payload);
      updateLocalUser({ name: updated.name });
      setForm(updated);
      setMessage('Profile updated successfully');
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not update profile'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="My profile" subtitle="Manage your personal details" />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <Card className="form-card">
        <div className="profile-card compact">
          <div className="profile-avatar">{(current.name || '?').charAt(0)}</div>
          <div className="profile-info">
            <h2>{current.name}</h2>
            <p>{user.role.toUpperCase()} · {user.identifier}</p>
          </div>
        </div>
        <form onSubmit={save} className="form-grid">
          {fields.map((key) => (
            <Field key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}>
              <input
                value={current[key] || ''}
                onChange={(e) => setForm({ ...current, [key]: e.target.value })}
              />
            </Field>
          ))}
          <div className="form-actions">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </Card>
    </>
  );
}
