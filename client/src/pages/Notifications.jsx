import { useState } from 'react';
import api from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';
import { Alert, Card, ConfirmDialog, ErrorBox, Loading, PageHeader } from '../components/UI';

export default function Notifications() {
  const { user } = useAuth();
  const { data, setData, loading, error, reload } = useFetch('/api/notifications');
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const canManage = ['admin', 'hod', 'dean'].includes(user.role);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const rows = data || [];

  const markAll = async () => {
    await Promise.all(rows.filter((n) => !n.read).map((n) => api.put(`/api/notifications/${n._id}/read`)));
    setData((current) => current.map((n) => ({ ...n, read: true })));
    setMessage('All notifications marked as read');
  };

  const remove = async () => {
    try {
      await api.delete(`/api/notifications/${deleting._id}`);
      setDeleting(null);
      reload();
    } catch {
      setMessage('Could not delete notification');
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${rows.filter((n) => !n.read).length} unread`}
        action={rows.some((n) => !n.read) && <button className="btn ghost" onClick={markAll}>Mark all as read</button>}
      />
      <Alert message={message} onClose={() => setMessage('')} />
      {rows.length ? (
        <div className="notification-list">
          {rows.map((item) => (
            <Card key={item._id} className={`notification-card ${item.read ? '' : 'unread'}`}>
              <div className="notification-top">
                <strong>{item.title}</strong>
                <span className={`badge ${item.read ? '' : 'primary'}`}>{item.read ? 'Read' : 'New'}</span>
              </div>
              <p>{item.message}</p>
              <div className="notification-meta">
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                {canManage && <button className="btn small danger-ghost" onClick={() => setDeleting(item)}>Delete</button>}
              </div>
            </Card>
          ))}
        </div>
      ) : <Card><p className="muted">No notifications yet.</p></Card>}
      {deleting && (
        <ConfirmDialog message="Delete this notification for everyone?" onConfirm={remove} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}
