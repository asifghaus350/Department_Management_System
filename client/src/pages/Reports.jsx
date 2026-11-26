import { useState } from 'react';
import api from '../api/http';
import useFetch from '../api/useFetch';
import { Card, DataTable, ErrorBox, Field, Loading, PageHeader, StatCard } from '../components/UI';

function toCSV(rows) {
  const head = ['Date', 'Roll no', 'Student', 'Subject', 'Semester', 'Faculty', 'Status'];
  const body = rows.map((r) => [r.date, r.rollno, r.studentName, r.subjectName, r.semesterId, r.facultyId, r.status]);
  return [head, ...body].map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function Reports() {
  const subjects = useFetch('/api/subjects');
  const [filters, setFilters] = useState({ subjectId: '', from: '', to: '' });
  const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
  const { data, loading, error, reload } = useFetch(`/api/reports/attendance${query ? `?${query}` : ''}`);

  if (subjects.loading) return <Loading />;

  const rows = data?.rows || [];
  const summary = data?.summary || { total: 0, present: 0, absent: 0 };

  const exportCSV = () => {
    const blob = new Blob([toCSV(rows)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Attendance report"
        subtitle="Filter and export attendance records"
        action={<button className="btn primary" onClick={exportCSV} disabled={!rows.length}>Export CSV</button>}
      />
      <Card className="form-card">
        <form onSubmit={(e) => { e.preventDefault(); reload(); }}>
          <div className="form-grid two">
            <Field label="Subject">
              <select value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
                <option value="">All subjects</option>
                {(subjects.data || []).map((s) => <option key={s._id} value={s.subjectId}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="From date"><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field>
            <Field label="To date"><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field>
          </div>
          <div className="form-actions"><button className="btn primary">Apply filters</button></div>
        </form>
      </Card>

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <>
          <div className="stat-grid three">
            <StatCard label="Total records" value={summary.total} tone="primary" />
            <StatCard label="Present" value={summary.present} tone="teal" />
            <StatCard label="Absent" value={summary.absent} tone="rose" />
          </div>
          <Card>
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'studentName', label: 'Student' },
                { key: 'rollno', label: 'Roll no' },
                { key: 'subjectName', label: 'Subject' },
                { key: 'semesterId', label: 'Semester' },
                { key: 'facultyId', label: 'Faculty' },
                { key: 'status', label: 'Status' }
              ]}
              rows={rows}
              empty="No records match these filters"
            />
          </Card>
        </>
      )}
    </>
  );
}
