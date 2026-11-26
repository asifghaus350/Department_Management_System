import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const { data, setData, reload } = useFetch('/api/notifications');
  const [open, setOpen] = useState(false);
  const rows = data || [];
  const unread = rows.filter((n) => !n.read).length;

  const markRead = async (item) => {
    if (item.read) return;
    try {
      await api.put(`/api/notifications/${item._id}/read`);
      setData((current) => current.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="notification-wrap">
      <button className="icon-btn" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
        🔔{unread > 0 && <span className="notification-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notification-popover">
          <div className="popover-head">
            <strong>Notifications</strong>
            <button className="icon-btn small" onClick={reload} aria-label="Refresh">↻</button>
          </div>
          {rows.length ? rows.slice(0, 6).map((item) => (
            <button
              key={item._id}
              className={`notification-item ${item.read ? '' : 'unread'}`}
              onClick={() => markRead(item)}
            >
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <small>{new Date(item.createdAt).toLocaleDateString()}</small>
            </button>
          )) : <p className="muted popover-empty">No notifications</p>}
          <Link to={`/${user.role}/notifications`} className="popover-link" onClick={() => setOpen(false)}>View all notifications</Link>
        </div>
      )}
    </div>
  );
}
