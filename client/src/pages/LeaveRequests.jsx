import { useState } from 'react';
import api, { apiMessage } from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';
import {
  Alert, Badge, Card, DataTable, ErrorBox, Field, Loading, Modal, PageHeader
} from '../components/UI';

const EMPTY = { type: 'Leave', fromDate: '', toDate: '', reason: '' };

export default function LeaveRequests() {
  const { user } = useAuth();
  const canReview = ['admin', 'hod', 'dean'].includes(user.role);
  const [mode, setMode] = useState(canReview ? 'review' : 'mine');
  const { data, loading, error, reload } = useFetch(
    `/api/leave-requests${mode === 'review' ? '?scope=review' : ''}`
  );
  const [creating, setCreating] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      await api.post('/api/leave-requests', creating);
      setCreating(null);
      setMessage('Request submitted');
      reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not submit request'));
    } finally {
      setBusy(false);
    }
  };

  const review = async (row, status) => {
    try {
      await api.put(`/api/leave-requests/${row._id}/review`, { status });
      setMessage(`Request ${status.toLowerCase()}`);
      reload();
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not review request'));
    }
  };

  const columns = [
    { key: 'applicantName', label: 'Applicant' },
    { key: 'role', label: 'Role' },
    { key: 'type', label: 'Type' },
    { key: 'fromDate', label: 'From', render: (row) => new Date(row.fromDate).toLocaleDateString() },
    { key: 'toDate', label: 'To', render: (row) => new Date(row.toDate).toLocaleDateString() },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status', label: 'Status', render: (row) => (
        <Badge tone={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'warning' : 'primary'}>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions', label: 'Actions', render: (row) => mode === 'review' && row.status === 'Pending' ? (
        <div className="row-actions">
          <button className="btn small primary" onClick={() => review(row, 'Approved')}>Approve</button>
          <button className="btn small danger-ghost" onClick={() => review(row, 'Rejected')}>Reject</button>
        </div>
      ) : (row.reviewedBy ? `by ${row.reviewedBy}` : '—')
    }
  ];

  return (
    <>
      <PageHeader
        title="Leave & OD requests"
        subtitle={canReview ? 'Review and track requests' : 'Submit and track your requests'}
        action={user.role !== 'admin' && <button className="btn primary" onClick={() => setCreating({ ...EMPTY })}>+ New request</button>}
      />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      {canReview && (
        <div className="tabs">
          <button className={mode === 'review' ? 'active' : ''} onClick={() => setMode('review')}>Approvals</button>
          <button className={mode === 'mine' ? 'active' : ''} onClick={() => setMode('mine')}>My requests</button>
        </div>
      )}
      <Card>
        <DataTable columns={columns} rows={data} empty="No requests found" />
      </Card>

      {creating && (
        <Modal title="New request" onClose={() => setCreating(null)}>
          <form onSubmit={submit} className="form-grid">
            <Field label="Type">
              <select value={creating.type} onChange={(e) => setCreating({ ...creating, type: e.target.value })}>
                {['Leave', 'OD', 'Permission'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="From date"><input type="date" required value={creating.fromDate} onChange={(e) => setCreating({ ...creating, fromDate: e.target.value })} /></Field>
            <Field label="To date"><input type="date" required value={creating.toDate} onChange={(e) => setCreating({ ...creating, toDate: e.target.value })} /></Field>
            <Field label="Reason"><textarea rows="4" required value={creating.reason} onChange={(e) => setCreating({ ...creating, reason: e.target.value })} /></Field>
            <div className="form-actions">
              <button type="button" className="btn ghost" onClick={() => setCreating(null)}>Cancel</button>
              <button className="btn primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
