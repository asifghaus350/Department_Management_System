import useFetch from '../../api/useFetch';
import { Badge, Card, DataTable, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

export default function DeanDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/dean');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { dean = {}, stats = {}, departments = [], hods = [], leaves = [], events = [] } = data;

  return (
    <>
      <PageHeader title={`Welcome, ${dean.name || 'Dean'}`} subtitle="University overview" />
      <Card className="profile-card">
        <div className="profile-avatar">{(dean.name || 'D').charAt(0)}</div>
        <div className="profile-info">
          <h2>{dean.name}</h2>
          <p>Dean · {dean.qualification}</p>
          <div className="profile-meta">
            <span>Email: <strong>{dean.email || '—'}</strong></span>
            <span>Phone: <strong>{dean.phone || '—'}</strong></span>
            <span>Dean ID: <strong>{dean.deanId}</strong></span>
          </div>
        </div>
      </Card>

      <div className="stat-grid">
        <StatCard label="Departments" value={stats.departments} tone="primary" />
        <StatCard label="Students" value={stats.students} tone="violet" />
        <StatCard label="Faculty" value={stats.faculty} tone="teal" />
        <StatCard label="HODs" value={stats.hods} tone="amber" />
        <StatCard label="Subjects" value={stats.subjects} tone="blue" />
        <StatCard label="Pending approvals" value={stats.pendingLeaves} tone="rose" />
      </div>

      <Card>
        <div className="card-title"><h2>Department overview</h2><span>At a glance</span></div>
        <DataTable
          columns={[
            { key: 'courseId', label: 'Code' },
            { key: 'name', label: 'Department' },
            { key: 'hod', label: 'HOD' },
            { key: 'students', label: 'Students' },
            { key: 'faculty', label: 'Faculty' },
            { key: 'subjects', label: 'Subjects' }
          ]}
          rows={departments}
          empty="No departments"
        />
      </Card>

      <div className="grid-2">
        <Card>
          <div className="card-title"><h2>Pending approvals</h2></div>
          <DataTable
            columns={[
              { key: 'applicantName', label: 'Applicant' },
              { key: 'departmentId', label: 'Department' },
              { key: 'type', label: 'Type' },
              { key: 'status', label: 'Status', render: (row) => <Badge tone="primary">{row.status}</Badge> }
            ]}
            rows={leaves}
            empty="No pending requests"
          />
        </Card>
        <div className="stack">
          <Card>
            <div className="card-title"><h2>Heads of departments</h2></div>
            {hods.length ? hods.map((item) => (
              <div key={item.hodId} className="faculty-row">
                <div><strong>{item.name}</strong><small>{item.departmentId} · {item.email}</small></div>
              </div>
            )) : <p className="muted">No HODs appointed.</p>}
          </Card>
          <Card>
            <div className="card-title"><h2>Upcoming events</h2></div>
            {events.length ? events.map((item) => (
              <div key={item._id} className="faculty-row">
                <div><strong>{item.title}</strong><small>{new Date(item.date).toLocaleDateString()}</small></div>
              </div>
            )) : <p className="muted">No upcoming events.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
