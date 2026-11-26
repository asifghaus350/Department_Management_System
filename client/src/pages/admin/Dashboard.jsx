import useFetch from '../../api/useFetch';
import { Card, DataTable, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/admin');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { stats = {}, recentStudents = [], recentFaculty = [], announcements = [] } = data || {};
  const cards = [
    { label: 'Students', value: stats.students, hint: 'Enrolled', tone: 'primary' },
    { label: 'Faculty', value: stats.faculty, hint: 'Teaching staff', tone: 'violet' },
    { label: 'Courses', value: stats.courses, hint: 'Available programs', tone: 'teal' },
    { label: 'Subjects', value: stats.subjects, hint: 'Across semesters', tone: 'amber' },
    { label: 'Timetable slots', value: stats.slots, hint: 'Scheduled classes', tone: 'rose' },
    { label: 'Assignments', value: stats.assignments, hint: 'Student tasks', tone: 'blue' }
  ];

  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Overview of your department" />
      <div className="stat-grid">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>
      <div className="grid-2">
        <Card>
          <div className="card-title"><h2>Recent students</h2><span>Latest additions</span></div>
          <DataTable
            columns={[
              { key: 'rollno', label: 'Roll no' },
              { key: 'name', label: 'Name' },
              { key: 'semesterId', label: 'Semester' }
            ]}
            rows={recentStudents}
            empty="No students yet"
          />
        </Card>
        <Card>
          <div className="card-title"><h2>Recent faculty</h2><span>Latest additions</span></div>
          <DataTable
            columns={[
              { key: 'facultyId', label: 'ID' },
              { key: 'name', label: 'Name' },
              { key: 'qualification', label: 'Qualification' }
            ]}
            rows={recentFaculty}
            empty="No faculty yet"
          />
        </Card>
      </div>
      <Card>
        <div className="card-title"><h2>Announcements</h2><span>Latest updates</span></div>
        {announcements.length ? (
          <div className="announcement-list">
            {announcements.map((item) => (
              <div key={item._id} className="announcement-item">
                <strong>{item.title || 'Notice'}</strong>
                <p>{item.content}</p>
                <small>{new Date(item.date).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        ) : <p className="muted">No announcements yet.</p>}
      </Card>
    </>
  );
}
