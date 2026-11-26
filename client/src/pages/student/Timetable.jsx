import useFetch from '../../api/useFetch';
import TimetableGrid from '../../components/TimetableGrid';
import { ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function StudentTimetable() {
  const { data, loading, error, reload } = useFetch('/api/dashboard/student');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Time table" subtitle="Browse your weekly class schedule" />
      <TimetableGrid slots={data.timetable || []} title="Weekly schedule" />
    </>
  );
}
