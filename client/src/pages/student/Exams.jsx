import useFetch from '../../api/useFetch';
import { Card, DataTable, ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function Exams() {
  const { data, loading, error, reload } = useFetch('/api/exams');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'subjectId', label: 'Subject code' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'time', label: 'Time' },
    { key: 'room', label: 'Room' }
  ];

  return (
    <>
      <PageHeader title="Examination" subtitle="Your exam schedule" />
      <Card>
        <DataTable columns={columns} rows={data} empty="No exams scheduled" />
      </Card>
    </>
  );
}
