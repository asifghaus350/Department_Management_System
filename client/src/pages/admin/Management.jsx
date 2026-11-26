import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const HOD_EMPTY = { hodId: '', password: '', name: '', email: '', phone: '', departmentId: '', qualification: '' };
const DEAN_EMPTY = { deanId: '', password: '', name: '', email: '', phone: '', qualification: '' };

export default function Management() {
  const [tab, setTab] = useState('hods');
  const hods = useFetch('/api/hods');
  const deans = useFetch('/api/deans');
  const courses = useFetch('/api/courses');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const isHod = tab === 'hods';
  const endpoint = isHod ? '/api/hods' : '/api/deans';
  const idKey = isHod ? 'hodId' : 'deanId';
  const resource = isHod ? hods : deans;
  const empty = isHod ? HOD_EMPTY : DEAN_EMPTY;

  if (hods.loading || deans.loading) return <Loading />;
  if (hods.error || deans.error) return <ErrorBox message={hods.error || deans.error} onRetry={() => { hods.reload(); deans.reload(); }} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      const payload = { ...editing };
      if (!payload.password && payload._id) delete payload.password;
      if (payload._id) await api.put(`${endpoint}/${payload._id}`, payload);
      else await api.post(endpoint, payload);
      setEditing(null);
      setMessage('Saved successfully');
      resource.reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not save'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`${endpoint}/${deleting._id}`);
      setDeleting(null);
      resource.reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not delete'));
    }
  };

  const columns = [
    { key: idKey, label: isHod ? 'HOD ID' : 'Dean ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    ...(isHod ? [{ key: 'departmentId', label: 'Department' }] : []),
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <div className="row-actions">
          <button className="btn small ghost" onClick={() => setEditing({ ...row, password: '' })}>Edit</button>
          <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Management" subtitle="Appoint heads and university leadership" />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <div className="tabs">
        <button className={isHod ? 'active' : ''} onClick={() => setTab('hods')}>Heads of Departments</button>
        <button className={!isHod ? 'active' : ''} onClick={() => setTab('deans')}>Deans</button>
      </div>
      <div className="tab-panel">
        <div className="panel-toolbar">
          <span>{resource.data?.length || 0} records</span>
          <button className="btn primary" onClick={() => setEditing({ ...empty })}>+ Add {isHod ? 'HOD' : 'Dean'}</button>
        </div>
        <DataTable columns={columns} rows={resource.data} empty={`No ${isHod ? 'HODs' : 'Deans'} yet`} />
      </div>

      {editing && (
        <Modal title={editing._id ? 'Edit' : `Add ${isHod ? 'HOD' : 'Dean'}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form-grid">
            <Field label={isHod ? 'HOD ID' : 'Dean ID'}>
              <input required value={editing[idKey] || ''} disabled={!!editing._id}
                onChange={(e) => setEditing({ ...editing, [idKey]: e.target.value })} />
            </Field>
            <Field label="Name"><input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label={editing._id ? 'New password (optional)' : 'Password'}>
              <input type="password" required={!editing._id} value={editing.password || ''}
                onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            </Field>
            <Field label="Email"><input type="email" value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <Field label="Phone"><input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
            {isHod && (
              <Field label="Department">
                <select required value={editing.departmentId || ''} onChange={(e) => setEditing({ ...editing, departmentId: e.target.value })}>
                  <option value="">Select department</option>
                  {(courses.data || []).map((c) => <option key={c._id} value={c.courseId}>{c.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Qualification"><input value={editing.qualification || ''} onChange={(e) => setEditing({ ...editing, qualification: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Remove ${deleting.name}?`} onConfirm={remove} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
