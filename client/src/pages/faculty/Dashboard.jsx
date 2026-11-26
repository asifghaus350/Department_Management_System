import useFetch from '../../api/useFetch';
import TimetableGrid from '../../components/TimetableGrid';
import { Badge, Card, DataTable, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

export default function FacultyDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/faculty');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { faculty = {}, subjects = [], timetable = [], assignments = [], stats = {} } = data;

  return (
    <>
      <PageHeader title={`Welcome, ${faculty.name || 'Faculty'}`} subtitle="Your teaching workspace" />
      <Card className="profile-card">
        <div className="profile-avatar">{(faculty.name || 'F').charAt(0)}</div>
        <div className="profile-info">
          <h2>{faculty.name}</h2>
          <p>{faculty.qualification} · {faculty.facultyId}</p>
          <div className="profile-meta">
            <span>Email: <strong>{faculty.email || '—'}</strong></span>
            <span>Research: <strong>{faculty.researchInterest || '—'}</strong></span>
            <span>Address: <strong>{faculty.address || '—'}</strong></span>
          </div>
        </div>
      </Card>

      <div className="stat-grid three">
        <StatCard label="Subjects" value={stats.subjects} hint="Allotted to you" tone="violet" />
        <StatCard label="Attendance sessions" value={stats.sessions} hint="Recorded by you" tone="teal" />
        <StatCard label="Timetable slots" value={stats.slots} hint="Scheduled classes" tone="amber" />
      </div>

      <div className="grid-2">
        <TimetableGrid slots={timetable} title="My schedule" />
        <div className="stack">
          <Card>
            <div className="card-title"><h2>My subjects</h2></div>
            {subjects.length ? subjects.map((subject) => (
              <div key={subject._id} className="faculty-row">
                <div>
                  <strong>{subject.name}</strong>
                  <small>{subject.subjectId} · Semester {subject.semesterId}</small>
                </div>
              </div>
            )) : <p className="muted">No subjects allotted yet.</p>}
          </Card>
          <Card>
            <div className="card-title"><h2>Recent assignments</h2></div>
            {assignments.length ? assignments.map((item) => (
              <div key={item._id} className="faculty-row">
                <div>
                  <strong>{item.assignmentName}</strong>
                  <small>{item.subjectId} · {new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
                <Badge tone="primary">{item.subjectId}</Badge>
              </div>
            )) : <p className="muted">No assignments created yet.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
