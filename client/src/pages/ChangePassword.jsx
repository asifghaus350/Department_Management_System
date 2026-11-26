import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiMessage } from '../api/http';
import { Alert, Card, Field, PageHeader } from '../components/UI';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const data = await changePassword(form);
      setMessage(data.message);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(apiMessage(err, 'Could not change password'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Change password" subtitle="Keep your account secure" />
      <Card className="form-card">
        <Alert message={message} onClose={() => setMessage('')} />
        <Alert type="error" message={error} onClose={() => setError('')} />
        <form onSubmit={submit}>
          <Field label="Current password">
            <input type="password" required value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" hint="Minimum 4 characters">
            <input type="password" required value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </Field>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      </Card>
    </>
  );
}
