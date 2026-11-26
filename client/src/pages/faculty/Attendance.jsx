import { useEffect, useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import { Alert, Card, ErrorBox, Field, Loading, PageHeader } from '../../components/UI';

export default function FacultyAttendance() {
  const dashboard = useFetch('/api/dashboard/faculty');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!subjectId || !date) return setStudents([]);
    let active = true;
    setLoadingStudents(true);
    api.get(`/api/attendance/students?subjectId=${subjectId}&date=${date}`)
      .then(({ data }) => {
        if (!active) return;
        setStudents(data.students);
        setPresent(data.students.filter((s) => s.status === 'Present').map((s) => s.rollno));
      })
      .catch((err) => active && setErrorMessage(apiMessage(err, 'Could not load students')))
      .finally(() => active && setLoadingStudents(false));
    return () => { active = false; };
  }, [subjectId, date]);

  if (dashboard.loading) return <Loading />;
  if (dashboard.error) return <ErrorBox message={dashboard.error} onRetry={dashboard.reload} />;

  const toggle = (rollno) =>
    setPresent((current) =>
      current.includes(rollno) ? current.filter((value) => value !== rollno) : [...current, rollno]
    );

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setBusy(true);
    try {
      const { data } = await api.post('/api/attendance', { subjectId, attendanceDate: date, presentRollnos: present });
      setMessage(`Saved ${data.present} present / ${data.total} students`);
      setStudents((current) => current.map((s) => ({
        ...s, status: present.includes(s.rollno) ? 'Present' : 'Absent'
      })));
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not save attendance'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark attendance for your subjects" />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <Card className="form-card">
        <div className="form-grid two">
          <Field label="Subject">
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Select subject</option>
              {(dashboard.data.subjects || []).map((s) => <option key={s._id} value={s.subjectId}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
      </Card>

      {subjectId && (
        <form onSubmit={submit}>
          <Card>
            <div className="card-title">
              <h2>Students</h2>
              <span>{present.length} of {students.length} present</span>
            </div>
            {loadingStudents ? <Loading /> : students.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Roll no</th><th>Name</th><th>Present</th></tr></thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.rollno}>
                        <td>{student.rollno}</td>
                        <td>{student.name}</td>
                        <td>
                          <input type="checkbox" checked={present.includes(student.rollno)}
                            onChange={() => toggle(student.rollno)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="muted">No students in this subject's semester.</p>}
          </Card>
          <div className="form-actions">
            <button className="btn primary" disabled={!students.length || busy}>
              {busy ? 'Saving…' : 'Submit attendance'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
