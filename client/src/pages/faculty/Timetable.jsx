import useFetch from '../../api/useFetch';
import TimetableGrid from '../../components/TimetableGrid';
import { ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function FacultyTimetable() {
  const { data, loading, error, reload } = useFetch('/api/timetable/faculty');

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Time table" subtitle="Your weekly class schedule" />
      <TimetableGrid slots={data || []} title="My weekly schedule" />
    </>
  );
}
