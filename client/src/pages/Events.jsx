import { useState } from 'react';
import api, { apiMessage } from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';
import {
  Alert, Badge, Card, ConfirmDialog, ErrorBox, Field, Loading, Modal, PageHeader
} from '../components/UI';

const EMPTY = { title: '', description: '', date: '', time: '', location: '', audience: 'all' };

export default function Events() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch('/api/events');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const canManage = ['admin', 'hod', 'dean'].includes(user.role);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      const payload = { ...editing };
      if (editing._id) await api.put(`/api/events/${editing._id}`, payload);
      else await api.post('/api/events', payload);
      setEditing(null);
      setMessage('Event saved');
      reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not save event'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/api/events/${deleting._id}`);
      setDeleting(null);
      reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not delete event'));
    }
  };

  return (
    <>
      <PageHeader
        title="Academic calendar"
        subtitle="Upcoming events and important dates"
        action={canManage && <button className="btn primary" onClick={() => setEditing({ ...EMPTY })}>+ Add event</button>}
      />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <div className="event-grid">
        {(data || []).map((item) => {
          const date = new Date(item.date);
          return (
            <Card key={item._id} className="event-card">
              <div className="event-date">
                <strong>{date.getDate()}</strong>
                <small>{date.toLocaleDateString('en-US', { month: 'short' })}</small>
              </div>
              <div className="event-body">
                <div className="event-head">
                  <h3>{item.title}</h3>
                  <Badge tone={item.audience === 'all' ? 'primary' : 'neutral'}>{item.audience}</Badge>
                </div>
                {item.description && <p>{item.description}</p>}
                <div className="event-meta">
                  <span>◷ {item.time || 'All day'}</span>
                  <span>⌖ {item.location || '—'}</span>
                </div>
                {canManage && (
                  <div className="row-actions">
                    <button className="btn small ghost" onClick={() => setEditing({ ...item, date: String(item.date).slice(0, 10) })}>Edit</button>
                    <button className="btn small danger-ghost" onClick={() => setDeleting(item)}>Delete</button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {!data?.length && <Card><p className="muted">No upcoming events.</p></Card>}
      </div>

      {editing && (
        <Modal title={editing._id ? 'Edit event' : 'Add event'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Title"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Date"><input type="date" required value={editing.date || ''} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
            <Field label="Time"><input value={editing.time || ''} onChange={(e) => setEditing({ ...editing, time: e.target.value })} placeholder="10:00 AM" /></Field>
            <Field label="Location"><input value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></Field>
            <Field label="Audience">
              <select value={editing.audience} onChange={(e) => setEditing({ ...editing, audience: e.target.value })}>
                {['all', 'admin', 'dean', 'hod', 'faculty', 'student'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Description"><textarea rows="3" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save event'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Delete "${deleting.title}"?`} onConfirm={remove} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
