import { useState } from 'react';
import api, { apiMessage } from '../../api/http';
import useFetch from '../../api/useFetch';
import { Alert, Badge, Card, ErrorBox, Loading, PageHeader } from '../../components/UI';

export default function Assignments() {
  const { data, setData, loading, error, reload } = useFetch('/api/assignments');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [answers, setAnswers] = useState({});

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const rows = (data || []).filter((item) =>
    filter === 'all' || item.completionStatus.toLowerCase() === filter
  );

  const saveAnswer = async (item) => {
    setMessage('');
    setErrorMessage('');
    try {
      const { data: updated } = await api.put(`/api/assignments/${item._id}`, {
        answer: answers[item._id] ?? item.answer
      });
      setData((current) => current.map((row) => (row._id === updated._id ? updated : row)));
      setMessage('Answer saved');
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not save answer'));
    }
  };

  const toggleStatus = async (item) => {
    const completionStatus = item.completionStatus === 'Complete' ? 'Incomplete' : 'Complete';
    try {
      const { data: updated } = await api.put(`/api/assignments/${item._id}`, { completionStatus });
      setData((current) => current.map((row) => (row._id === updated._id ? updated : row)));
    } catch (err) {
      setErrorMessage(apiMessage(err, 'Could not update assignment'));
    }
  };

  return (
    <>
      <PageHeader title="Assignments" subtitle="Your tasks and submissions" />
      <Alert message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      <div className="tabs">
        {['all', 'complete', 'incomplete'].map((value) => (
          <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>
      <div className="assignment-list">
        {rows.length ? rows.map((item) => (
          <Card key={item._id} className="assignment-card">
            <div className="assignment-top">
              <div>
                <h3>{item.assignmentName}</h3>
                <small>{item.subjectId} · Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</small>
              </div>
              <Badge tone={item.completionStatus === 'Complete' ? 'success' : 'warning'}>
                {item.completionStatus}
              </Badge>
            </div>
            {item.description && <p>{item.description}</p>}
            <textarea
              rows="3" placeholder="Write your answer here…"
              value={answers[item._id] ?? item.answer ?? ''}
              onChange={(e) => setAnswers({ ...answers, [item._id]: e.target.value })}
            />
            <div className="assignment-actions">
              <button className="btn ghost" onClick={() => saveAnswer(item)}>Save answer</button>
              <button className="btn primary" onClick={() => toggleStatus(item)}>
                {item.completionStatus === 'Complete' ? 'Mark incomplete' : 'Mark complete'}
              </button>
            </div>
          </Card>
        )) : <p className="muted">No assignments in this view.</p>}
      </div>
    </>
  );
}
