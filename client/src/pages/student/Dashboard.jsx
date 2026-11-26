import { Link } from 'react-router-dom';
import useFetch from '../../api/useFetch';
import TimetableGrid from '../../components/TimetableGrid';
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

function AttendanceCard({ item }) {
  const tone = item.percentage >= 75 ? 'good' : item.percentage >= 40 ? 'average' : 'low';
  return (
    <Card className="attendance-card">
      <div className={`progress-ring ${tone}`} style={{ '--value': item.percentage }}>
        <span>{item.percentage}%</span>
      </div>
      <strong title={item.subjectName}>{item.subjectName}</strong>
      <small>{item.subjectId}</small>
      <div className="attendance-progress">
        <div className="progress-track"><div className={`progress-fill ${tone}`} style={{ width: `${item.percentage}%` }} /></div>
        <span>{item.present} / {item.total} classes present</span>
      </div>
    </Card>
  );
}

export default function StudentDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/student');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const {
    student = {}, attendance = [], announcements = [], todayFaculty = [],
    timetable = [], events = [], exams = [], quickStats = {}, today
  } = data;

  const withSessions = attendance.filter((item) => item.total > 0);
  const withoutSessions = attendance.filter((item) => item.total === 0);
  const todayCount = timetable.filter((slot) => slot.day === today).length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${student.name || 'Student'} 👋`}
        subtitle="Your department at a glance"
        action={<span className="date-chip">📅 {todayLabel}</span>}
      />

      {/* Profile hero */}
      <Card className="hero-card">
        <div className="hero-avatar">{(student.name || 'S').charAt(0)}</div>
        <div className="hero-main">
          <div className="hero-top">
            <h2>{student.name}</h2>
            <Badge tone="primary">Student</Badge>
          </div>
          <p>{student.courseName} · {student.semesterName}</p>
          <div className="hero-meta">
            <span><small>Roll number</small><strong>{student.rollno}</strong></span>
            <span><small>Enrollment</small><strong>{student.enroll || '—'}</strong></span>
            <span><small>Email</small><strong>{student.email || '—'}</strong></span>
          </div>
        </div>
        <Link to="/student/profile" className="btn ghost hero-action">Edit profile</Link>
      </Card>

      {/* Quick stats */}
      <div className="stat-grid four">
        <StatCard label="Avg. attendance" value={`${quickStats.attendance ?? 0}%`} hint="Across subjects" tone="primary" />
        <StatCard label="Assignments" value={quickStats.assignments ?? 0} hint={`${quickStats.pendingAssignments ?? 0} pending`} tone="amber" />
        <StatCard label="Upcoming exams" value={quickStats.exams ?? 0} hint="Scheduled" tone="rose" />
        <StatCard label="Classes today" value={todayCount} hint={today?.toLowerCase()} tone="teal" />
      </div>

      {/* Attendance */}
      <div className="section-heading">
        <h2>Your attendance</h2><span>Subject wise progress</span>
      </div>
      {withSessions.length ? (
        <div className="attendance-grid">
          {withSessions.map((item) => <AttendanceCard key={item.subjectId} item={item} />)}
        </div>
      ) : (
        <Card><Empty message="No attendance recorded yet" /></Card>
      )}
      {withoutSessions.length > 0 && (
        <p className="muted info-line">
          No sessions recorded yet for: {withoutSessions.map((s) => s.subjectName).join(', ')}
        </p>
      )}

      {/* Main grid */}
      <div className="grid-2">
        <div className="stack">
          <TimetableGrid slots={timetable} title="Weekly time table" />

          <Card>
            <div className="card-title"><h2>Upcoming events</h2><span>Academic calendar</span></div>
            {events.length ? events.map((item) => (
              <div key={item._id} className="faculty-row">
                <div className="event-mini-date">
                  <strong>{new Date(item.date).getDate()}</strong>
                  <small>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</small>
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.time || 'All day'} · {item.location || '—'}</small>
                </div>
              </div>
            )) : <Empty message="No upcoming events" />}
          </Card>

          {exams.length > 0 && (
            <Card>
              <div className="card-title"><h2>Next exams</h2><span>Schedule</span></div>
              {exams.map((exam) => (
                <div key={exam._id} className="faculty-row">
                  <div>
                    <strong>{exam.subjectName || exam.subjectId}</strong>
                    <small>{new Date(exam.date).toLocaleDateString()} · {exam.room}</small>
                  </div>
                  <Badge tone="warning">{exam.time}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="stack">
          <Card>
            <div className="card-title"><h2>Announcements</h2><span>Latest notices</span></div>
            {announcements.length ? announcements.map((notice) => (
              <div key={notice._id} className="announcement-item">
                <div className="announcement-top">
                  <span className="announcement-icon">✦</span>
                  <strong>{notice.title || 'Notice'}</strong>
                </div>
                <p>{notice.content}</p>
                <small>{new Date(notice.date).toLocaleDateString()}</small>
              </div>
            )) : <Empty message="No announcements" />}
          </Card>

          <Card>
            <div className="card-title"><h2>Today's faculty</h2><span>{today?.toLowerCase()}</span></div>
            {todayFaculty.length ? todayFaculty.map((faculty) => (
              <div key={faculty.facultyId} className="faculty-row">
                <span className="avatar">{(faculty.name || 'F').charAt(0)}</span>
                <div>
                  <strong>{faculty.name}</strong>
                  <div className="chip-row">
                    {(faculty.subjects || []).map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
              </div>
            )) : <Empty message="No classes today" />}
          </Card>
        </div>
      </div>
    </>
  );
}
