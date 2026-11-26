import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, PageHeader
} from '../../components/UI';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function AdminTimetable() {
  const timetable = useFetch('/api/timetable');
  const courses = useFetch('/api/courses');
  const semesters = useFetch('/api/semesters');
  const subjects = useFetch('/api/subjects');
  const [form, setForm] = useState({ semesterId: '', day: 'MONDAY', time: '09:00 AM', roomno: '', courseId: '', subjectId: '' });
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (timetable.loading) return <Loading />;
  if (timetable.error) return <ErrorBox message={timetable.error} onRetry={timetable.reload} />;

  const addSlot = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/timetable', form);
      timetable.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not add slot'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/timetable/${deleting._id}`);
      setDeleting(null);
      timetable.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete slot'));
    }
  };

  const columns = [
    { key: 'day', label: 'Day' },
    { key: 'time', label: 'Time' },
    { key: 'subjectId', label: 'Subject' },
    { key: 'semesterId', label: 'Semester' },
    { key: 'roomno', label: 'Room' },
    { key: 'courseId', label: 'Course' },
    {
      key: 'actions', label: '', render: (row) => (
        <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Time table" subtitle="Create and manage class schedules" />
      <Alert type="error" message={error} onClose={() => setError('')} />
      <form className="slot-form" onSubmit={addSlot}>
        <Field label="Semester">
          <select required value={form.semesterId} onChange={(e) => setForm({ ...form, semesterId: e.target.value })}>
            <option value="">Select semester</option>
            {(semesters.data || []).map((s) => <option key={s._id} value={s.semesterId}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Day">
          <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {DAYS.map((day) => <option key={day}>{day}</option>)}
          </select>
        </Field>
        <Field label="Time">
          <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
            {TIMES.map((time) => <option key={time}>{time}</option>)}
          </select>
        </Field>
        <Field label="Room"><input value={form.roomno} onChange={(e) => setForm({ ...form, roomno: e.target.value })} placeholder="F24" /></Field>
        <Field label="Course">
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Select course</option>
            {(courses.data || []).map((c) => <option key={c._id} value={c.courseId}>{c.courseId}</option>)}
          </select>
        </Field>
        <Field label="Subject">
          <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            <option value="">Select subject</option>
            {(subjects.data || []).map((s) => <option key={s._id} value={s.subjectId}>{s.name}</option>)}
          </select>
        </Field>
        <button className="btn primary" disabled={busy}>{busy ? 'Adding…' : '+ Add slot'}</button>
      </form>
      <DataTable columns={columns} rows={timetable.data} empty="No timetable slots yet" />
      {deleting && (
        <ConfirmDialog message="Delete this timetable slot?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
