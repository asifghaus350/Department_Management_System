import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const EMPTY = { title: '', content: '', courseId: '', date: '' };

export default function Announcements() {
  const notices = useFetch('/api/announcements');
  const courses = useFetch('/api/courses');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (notices.loading) return <Loading />;
  if (notices.error) return <ErrorBox message={notices.error} onRetry={notices.reload} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...editing };
      if (!payload.date) delete payload.date;
      if (editing._id) await api.put(`/api/announcements/${editing._id}`, payload);
      else await api.post('/api/announcements', payload);
      setEditing(null);
      notices.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not save announcement'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/announcements/${deleting._id}`);
      setDeleting(null);
      notices.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete announcement'));
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content' },
    { key: 'courseId', label: 'Course' },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <div className="row-actions">
          <button className="btn small ghost" onClick={() => setEditing({ ...row, date: String(row.date).slice(0, 10) })}>Edit</button>
          <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Notices shown to students"
        action={<button className="btn primary" onClick={() => setEditing({ ...EMPTY })}>+ Add announcement</button>}
      />
      <Alert type="error" message={error} onClose={() => setError('')} />
      <DataTable columns={columns} rows={notices.data} empty="No announcements yet" />
      {editing && (
        <Modal title={editing._id ? 'Edit announcement' : 'Add announcement'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label="Title"><input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Course">
              <select value={editing.courseId || ''} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })}>
                <option value="">All courses</option>
                {(courses.data || []).map((c) => <option key={c._id} value={c.courseId}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Content"><textarea rows="4" required value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></Field>
            <Field label="Date"><input type="date" value={editing.date || ''} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message="Delete this announcement?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
