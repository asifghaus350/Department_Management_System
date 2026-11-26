import { useState } from 'react';
import useFetch from '../../api/useFetch';
import { Card, DataTable, ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function HodPeople() {
  const [tab, setTab] = useState('students');
  const students = useFetch('/api/students');
  const faculty = useFetch('/api/faculty');
  const resource = tab === 'students' ? students : faculty;

  if (students.loading || faculty.loading) return <Loading />;
  if (students.error || faculty.error) return <ErrorBox message={students.error || faculty.error} />;

  const studentColumns = [
    { key: 'rollno', label: 'Roll no' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'semesterId', label: 'Semester' }
  ];
  const facultyColumns = [
    { key: 'facultyId', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'researchInterest', label: 'Research interest' }
  ];

  return (
    <>
      <PageHeader title="Department people" subtitle="Students and faculty in your department" />
      <div className="tabs">
        <button className={tab === 'students' ? 'active' : ''} onClick={() => setTab('students')}>Students</button>
        <button className={tab === 'faculty' ? 'active' : ''} onClick={() => setTab('faculty')}>Faculty</button>
      </div>
      <Card>
        <DataTable
          columns={tab === 'students' ? studentColumns : facultyColumns}
          rows={resource.data}
          empty="No records found"
        />
      </Card>
    </>
  );
}
