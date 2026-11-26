import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, Badge, Card, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const EMPTY = { subjectId: '', assignmentName: '', description: '', dueDate: '' };

export default function FacultyAssignments() {
  const master = useFetch('/api/assignments/master');
  const subjects = useFetch('/api/subjects');
  const [creating, setCreating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (master.loading) return <Loading />;
  if (master.error) return <ErrorBox message={master.error} onRetry={master.reload} />;

  const create = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      const payload = { ...creating };
      if (!payload.dueDate) delete payload.dueDate;
      const { data } = await api.post('/api/assignments', payload);
      setMessage(`Assignment created for ${data.studentsAssigned} students`);
      setCreating(null);
      master.reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not create assignment'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/assignments/${deleting._id}`);
      setDeleting(null);
      master.reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not delete assignment'));
    }
  };

  const columns = [
    { key: 'assignmentName', label: 'Assignment' },
    { key: 'subjectId', label: 'Subject' },
    { key: 'semesterId', label: 'Semester' },
    { key: 'dueDate', label: 'Due date', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '—' },
    { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Create assignments for your classes"
        action={<button className="btn primary" onClick={() => setCreating({ ...EMPTY })}>+ New assignment</button>}
      />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <Card>
        <div className="card-title"><h2>Created assignments</h2><span>{master.data?.length || 0} total</span></div>
        <DataTable columns={columns} rows={master.data} empty="No assignments created yet" />
      </Card>

      {creating && (
        <Modal title="New assignment" onClose={() => setCreating(null)}>
          <form onSubmit={create} className="form-grid">
            <Field label="Subject">
              <select required value={creating.subjectId} onChange={(e) => setCreating({ ...creating, subjectId: e.target.value })}>
                <option value="">Select subject</option>
                {(subjects.data || []).map((s) => <option key={s._id} value={s.subjectId}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Title"><input required value={creating.assignmentName} onChange={(e) => setCreating({ ...creating, assignmentName: e.target.value })} /></Field>
            <Field label="Description"><textarea rows="4" value={creating.description} onChange={(e) => setCreating({ ...creating, description: e.target.value })} /></Field>
            <Field label="Due date"><input type="date" value={creating.dueDate} onChange={(e) => setCreating({ ...creating, dueDate: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setCreating(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Create assignment'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Delete "${deleting.assignmentName}" and all student copies?`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
