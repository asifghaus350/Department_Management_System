import useFetch from '../../api/useFetch';
import TimetableGrid from '../../components/TimetableGrid';
import { Card, ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function StudentDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/student');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { student = {}, attendance = [], announcements = [], todayFaculty = [], timetable = [] } = data;

  return (
    <>
      <PageHeader title={`Welcome, ${student.name || 'Student'}`} subtitle="Your department at a glance" />
      <Card className="profile-card">
        <div className="profile-avatar">{(student.name || 'S').charAt(0)}</div>
        <div className="profile-info">
          <h2>{student.name}</h2>
          <p>{student.courseName} · {student.semesterName}</p>
          <div className="profile-meta">
            <span>Roll no: <strong>{student.rollno}</strong></span>
            <span>Enrollment: <strong>{student.enroll || '—'}</strong></span>
            <span>Email: <strong>{student.email || '—'}</strong></span>
          </div>
        </div>
      </Card>

      <div className="section-heading"><h2>Your attendance</h2><span>Subject wise</span></div>
      <div className="subject-grid">
        {attendance.length ? attendance.map((item) => (
          <Card key={item.subjectId} className="subject-card">
            <div className="progress-ring" style={{ '--value': item.percentage }}>
              <span>{item.percentage}%</span>
            </div>
            <strong>{item.subjectName}</strong>
            <small>{item.subjectId}</small>
            <p>{item.present} / {item.total} classes present</p>
          </Card>
        )) : <p className="muted">No attendance recorded yet.</p>}
      </div>

      <div className="grid-2">
        <TimetableGrid slots={timetable} />
        <div className="stack">
          <Card>
            <div className="card-title"><h2>Announcements</h2></div>
            {announcements.length ? announcements.map((notice) => (
              <div key={notice._id} className="announcement-item">
                <strong>{notice.title || 'Notice'}</strong>
                <p>{notice.content}</p>
                <small>{new Date(notice.date).toLocaleDateString()}</small>
              </div>
            )) : <p className="muted">No announcements.</p>}
          </Card>
          <Card>
            <div className="card-title"><h2>Today's faculty</h2><span>{data.today}</span></div>
            {todayFaculty.length ? todayFaculty.map((faculty) => (
              <div key={faculty.facultyId} className="faculty-row">
                <span className="avatar">{(faculty.name || 'F').charAt(0)}</span>
                <div><strong>{faculty.name}</strong><small>{(faculty.subjects || []).join(', ')}</small></div>
              </div>
            )) : <p className="muted">No classes today.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
