import useFetch from '../../api/useFetch';
import { Badge, Card, DataTable, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

export default function HodDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/hod');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { hod = {}, departmentName = '', stats = {}, recentStudents = [], recentFaculty = [], leaves = [], events = [], notifications = [] } = data;

  return (
    <>
      <PageHeader title={`Welcome, ${hod.name || 'HOD'}`} subtitle={departmentName} />
      <Card className="profile-card">
        <div className="profile-avatar">{(hod.name || 'H').charAt(0)}</div>
        <div className="profile-info">
          <h2>{hod.name}</h2>
          <p>Head of Department · {hod.qualification}</p>
          <div className="profile-meta">
            <span>Email: <strong>{hod.email || '—'}</strong></span>
            <span>Phone: <strong>{hod.phone || '—'}</strong></span>
            <span>HOD ID: <strong>{hod.hodId}</strong></span>
          </div>
        </div>
      </Card>

      <div className="stat-grid">
        <StatCard label="Students" value={stats.students} hint="In your department" tone="primary" />
        <StatCard label="Faculty" value={stats.faculty} hint="Teaching staff" tone="violet" />
        <StatCard label="Subjects" value={stats.subjects} hint="Offered" tone="teal" />
        <StatCard label="Sessions" value={stats.sessions} hint="Attendance recorded" tone="amber" />
        <StatCard label="Timetable slots" value={stats.slots} tone="blue" />
        <StatCard label="Pending approvals" value={stats.pendingLeaves} tone="rose" />
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-title"><h2>Pending approvals</h2><span>Leave / OD</span></div>
          <DataTable
            columns={[
              { key: 'applicantName', label: 'Applicant' },
              { key: 'type', label: 'Type' },
              { key: 'reason', label: 'Reason' },
              { key: 'status', label: 'Status', render: (row) => <Badge tone="primary">{row.status}</Badge> }
            ]}
            rows={leaves}
            empty="No pending requests"
          />
        </Card>
        <Card>
          <div className="card-title"><h2>Upcoming events</h2></div>
          {events.length ? events.map((item) => (
            <div key={item._id} className="faculty-row">
              <div>
                <strong>{item.title}</strong>
                <small>{new Date(item.date).toLocaleDateString()} · {item.location || '—'}</small>
              </div>
            </div>
          )) : <p className="muted">No upcoming events.</p>}
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-title"><h2>Recent students</h2></div>
          <DataTable columns={[
            { key: 'rollno', label: 'Roll no' }, { key: 'name', label: 'Name' }, { key: 'semesterId', label: 'Semester' }
          ]} rows={recentStudents} empty="No students" />
        </Card>
        <Card>
          <div className="card-title"><h2>Recent faculty</h2></div>
          <DataTable columns={[
            { key: 'facultyId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'qualification', label: 'Qualification' }
          ]} rows={recentFaculty} empty="No faculty" />
        </Card>
      </div>

      {notifications.length > 0 && (
        <Card>
          <div className="card-title"><h2>Latest notifications</h2></div>
          {notifications.map((item) => (
            <div key={item._id} className="announcement-item">
              <strong>{item.title}</strong><p>{item.message}</p>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
