import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import {
  Alert, ConfirmDialog, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../../components/UI';

const RESOURCES = {
  courses: {
    title: 'Courses', endpoint: '/api/courses', idKey: 'courseId', nameKey: 'name',
    fields: [
      { key: 'courseId', label: 'Course ID', required: true },
      { key: 'name', label: 'Course name', required: true }
    ],
    columns: [
      { key: 'courseId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'semesters', label: 'Semesters' }
    ]
  },
  semesters: {
    title: 'Semesters', endpoint: '/api/semesters', idKey: 'semesterId', nameKey: 'name',
    fields: [
      { key: 'semesterId', label: 'Semester ID', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'courseId', label: 'Course ID' }
    ],
    columns: [
      { key: 'semesterId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'courseId', label: 'Course' }
    ]
  },
  subjects: {
    title: 'Subjects', endpoint: '/api/subjects', idKey: 'subjectId', nameKey: 'name',
    fields: [
      { key: 'subjectId', label: 'Subject ID', required: true },
      { key: 'name', label: 'Subject name', required: true },
      { key: 'semesterId', label: 'Semester ID' }
    ],
    columns: [
      { key: 'subjectId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'semesterId', label: 'Semester' }
    ]
  }
};

export default function Courses() {
  const [tab, setTab] = useState('courses');
  const config = RESOURCES[tab];
  const records = useFetch(config.endpoint);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const empty = Object.fromEntries(config.fields.map((field) => [field.key, '']));

  if (records.loading) return <Loading />;
  if (records.error) return <ErrorBox message={records.error} onRetry={records.reload} />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing._id) await api.put(`${config.endpoint}/${editing._id}`, editing);
      else await api.post(config.endpoint, editing);
      setEditing(null);
      records.reload();
    } catch (err) {
      setError(apiMessage(err, `Could not save ${config.title.toLowerCase()}`));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${config.endpoint}/${deleting._id}`);
      setDeleting(null);
      records.reload();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete record'));
    }
  };

  const columns = [
    ...config.columns,
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <div className="row-actions">
          <button className="btn small ghost" onClick={() => setEditing({ ...row })}>Edit</button>
          <button className="btn small danger-ghost" onClick={() => setDeleting(row)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Courses & subjects" subtitle="Manage the academic structure" />
      <Alert type="error" message={error} onClose={() => setError('')} />
      <div className="tabs">
        {Object.entries(RESOURCES).map(([key, item]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setEditing(null); }}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        <div className="panel-toolbar">
          <span>{records.data?.length || 0} records</span>
          <button className="btn primary" onClick={() => setEditing({ ...empty })}>+ Add {config.title.slice(0, -1).toLowerCase()}</button>
        </div>
        <DataTable columns={columns} rows={records.data} empty={`No ${config.title.toLowerCase()} found`} />
      </div>

      {editing && (
        <Modal title={editing._id ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="form-grid">
            {config.fields.map((field) => (
              <Field key={field.key} label={field.label}>
                <input required={field.required} value={editing[field.key] ?? ''}
                  disabled={!!editing._id && field.key === config.idKey}
                  onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })} />
              </Field>
            ))}
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog message={`Delete ${deleting[config.nameKey] || deleting[config.idKey]}?`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
