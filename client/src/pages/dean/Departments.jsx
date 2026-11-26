import useFetch from '../../api/useFetch';
import { Card, DataTable, ErrorBox, Loading, PageHeader, StatCard } from '../../components/UI';

export default function Departments() {
  const { data, loading, error, reload } = useFetch('/api/departments');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const rows = data || [];

  return (
    <>
      <PageHeader title="Departments" subtitle="Academic departments across the university" />
      <div className="stat-grid three">
        <StatCard label="Total departments" value={rows.length} tone="primary" />
        <StatCard label="Total students" value={rows.reduce((sum, d) => sum + d.students, 0)} tone="violet" />
        <StatCard label="Total faculty" value={rows.reduce((sum, d) => sum + d.faculty, 0)} tone="teal" />
      </div>
      <Card>
        <DataTable
          columns={[
            { key: 'courseId', label: 'Code' },
            { key: 'name', label: 'Department' },
            { key: 'hod', label: 'Head of Department', render: (row) => row.hod?.name || 'Not assigned' },
            { key: 'students', label: 'Students' },
            { key: 'faculty', label: 'Faculty' },
            { key: 'subjects', label: 'Subjects' }
          ]}
          rows={rows}
          empty="No departments"
        />
      </Card>
    </>
  );
}
