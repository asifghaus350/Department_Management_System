import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const EMPTY = {
  rollno: '', enroll: '', password: '', name: '', email: '', courseId: '', semesterId: '', dob: '', address: ''
};

export default function Students() {
  const students = useFetch('/api/students');
  const courses = useFetch('/api/courses');
  const semesters = useFetch('/api/semesters');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (students.loading) return <Loading />;
  if (students.error) return <ErrorBox message={students.error} onRetry={students.reload} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...editing };
      if (!payload.password && editing._id) delete payload.password;
      if (editing._id) await api.put(`/api/students/${editing._id}`, payload);
      else await api.post('/api/students', payload);
      setEditing(null);
      students.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not save student'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/students/${deleting._id}`);
      setDeleting(null);
      students.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete student'));
    }
  };

  const columns = [
    { key: 'rollno', label: 'Roll no' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'courseId', label: 'Course' },
    { key: 'semesterId', label: 'Semester' },
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
      <PageHeader
        title="Students"
        subtitle={`${students.data?.length || 0} student records`}
        action={<button className="btn primary" onClick={() => setEditing({ ...EMPTY })}>+ Add student</button>}
      />
      <Alert type="error" message={error} onClose={() => setError('')} />
      <DataTable columns={columns} rows={students.data} empty="No students found" />

      {editing && (
        <Modal title={editing._id ? 'Edit student' : 'Add student'} onClose={() => setEditing(null)} width={640}>
          <Alert type="error" message={error} onClose={() => setError('')} />
          <form onSubmit={save} className="form-grid">
            <Field label="Roll number"><input required value={editing.rollno} onChange={(e) => setEditing({ ...editing, rollno: e.target.value })} disabled={!!editing._id} /></Field>
            <Field label="Enrollment no"><input value={editing.enroll || ''} onChange={(e) => setEditing({ ...editing, enroll: e.target.value })} /></Field>
            <Field label="Name"><input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label={editing._id ? 'New password (optional)' : 'Password'}>
              <input type="password" required={!editing._id} value={editing.password || ''} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            </Field>
            <Field label="Email"><input type="email" value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <Field label="Date of birth"><input type="date" value={editing.dob ? String(editing.dob).slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, dob: e.target.value })} /></Field>
            <Field label="Course">
              <select value={editing.courseId || ''} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })}>
                <option value="">Select course</option>
                {(courses.data || []).map((c) => <option key={c._id} value={c.courseId}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Semester">
              <select value={editing.semesterId || ''} onChange={(e) => setEditing({ ...editing, semesterId: e.target.value })}>
                <option value="">Select semester</option>
                {(semesters.data || []).map((s) => <option key={s._id} value={s.semesterId}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Address"><input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save student'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Delete ${deleting.name}? This cannot be undone.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
