import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const EMPTY = { facultyId: '', password: '', name: '', email: '', qualification: '', address: '', researchInterest: '' };

export default function Faculty() {
  const faculty = useFetch('/api/faculty');
  const allotments = useFetch('/api/allotments');
  const courses = useFetch('/api/courses');
  const semesters = useFetch('/api/semesters');
  const subjects = useFetch('/api/subjects');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [allotForm, setAllotForm] = useState({ facultyId: '', subjectId: '', semesterId: '', courseId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (faculty.loading) return <Loading />;
  if (faculty.error) return <ErrorBox message={faculty.error} onRetry={faculty.reload} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...editing };
      if (!payload.password && editing._id) delete payload.password;
      if (editing._id) await api.put(`/api/faculty/${editing._id}`, payload);
      else await api.post('/api/faculty', payload);
      setEditing(null);
      faculty.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not save faculty'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/faculty/${deleting._id}`);
      setDeleting(null);
      faculty.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete faculty'));
    }
  };

  const removeAllotment = async (id) => {
    try {
      await api.delete(`/api/allotments/${id}`);
      allotments.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not remove allotment'));
    }
  };

  const addAllotment = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/allotments', allotForm);
      setAllotForm({ facultyId: '', subjectId: '', semesterId: '', courseId: '' });
      allotments.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not allot subject'));
    }
  };

  const facultyColumns = [
    { key: 'facultyId', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'researchInterest', label: 'Research interest' },
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <div className="row-actions">
          <button className="btn small ghost" onClick={() => setEditing({ ...row, password: '' })}>Edit</button>
          <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
        </div>
      )
    }
  ];

  const allotmentColumns = [
    { key: 'facultyName', label: 'Faculty' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'courseId', label: 'Course' },
    { key: 'semesterId', label: 'Semester' },
    {
      key: 'actions', label: '', render: (row) => (
        <button className="btn small danger-ghost" onClick={() => removeAllotment(row._id)}>Remove</button>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Faculty"
        subtitle={`${faculty.data?.length || 0} faculty members`}
        action={<button className="btn primary" onClick={() => setEditing({ ...EMPTY })}>+ Add faculty</button>}
      />
      <Alert type="error" message={error} onClose={() => setError('')} />
      <DataTable columns={facultyColumns} rows={faculty.data} empty="No faculty found" />

      <div className="section-heading"><h2>Subject allotments</h2><span>Assign subjects to faculty</span></div>
      <form className="inline-form" onSubmit={addAllotment}>
        <select required value={allotForm.facultyId} onChange={(e) => setAllotForm({ ...allotForm, facultyId: e.target.value })}>
          <option value="">Select faculty</option>
          {(faculty.data || []).map((f) => <option key={f._id} value={f.facultyId}>{f.name}</option>)}
        </select>
        <select required value={allotForm.subjectId} onChange={(e) => {
          const subject = (subjects.data || []).find((s) => s.subjectId === e.target.value);
          setAllotForm({ ...allotForm, subjectId: e.target.value, semesterId: subject?.semesterId || '' });
        }}>
          <option value="">Select subject</option>
          {(subjects.data || []).map((s) => <option key={s._id} value={s.subjectId}>{s.name}</option>)}
        </select>
        <select value={allotForm.courseId} onChange={(e) => setAllotForm({ ...allotForm, courseId: e.target.value })}>
          <option value="">Course</option>
          {(courses.data || []).map((c) => <option key={c._id} value={c.courseId}>{c.courseId}</option>)}
        </select>
        <select value={allotForm.semesterId} onChange={(e) => setAllotForm({ ...allotForm, semesterId: e.target.value })}>
          <option value="">Semester</option>
          {(semesters.data || []).map((s) => <option key={s._id} value={s.semesterId}>{s.name}</option>)}
        </select>
        <button className="btn primary">Allot</button>
      </form>
      <DataTable columns={allotmentColumns} rows={allotments.data} empty="No allotments yet" />

      {editing && (
        <Modal title={editing._id ? 'Edit faculty' : 'Add faculty'} onClose={() => setEditing(null)} width={640}>
          <form onSubmit={save} className="form-grid">
            <Field label="Faculty ID"><input required value={editing.facultyId} onChange={(e) => setEditing({ ...editing, facultyId: e.target.value })} disabled={!!editing._id} /></Field>
            <Field label="Name"><input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label={editing._id ? 'New password (optional)' : 'Password'}>
              <input type="password" required={!editing._id} value={editing.password || ''} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            </Field>
            <Field label="Email"><input type="email" value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <Field label="Qualification"><input value={editing.qualification || ''} onChange={(e) => setEditing({ ...editing, qualification: e.target.value })} /></Field>
            <Field label="Research interest"><input value={editing.researchInterest || ''} onChange={(e) => setEditing({ ...editing, researchInterest: e.target.value })} /></Field>
            <Field label="Address"><input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save faculty'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Delete ${deleting.name}?`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
