import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const location = useLocation();
  const { data, setData, reload } = useFetch('/api/notifications');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const rows = data || [];
  const unread = rows.filter((n) => !n.read).length;
  const onNotificationsPage = location.pathname.endsWith('/notifications');

  // Close on route change, outside click and Escape.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    // Already on the notifications page — no need for the pop-up.
    if (onNotificationsPage) {
      setOpen(false);
      return;
    }
    setOpen((value) => !value);
  };

  const markRead = async (item) => {
    setOpen(false);
    if (item.read) return;
    try {
      await api.put(`/api/notifications/${item._id}/read`);
      setData((current) => current.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="notification-wrap" ref={wrapRef}>
      <button className="icon-btn" onClick={toggle} aria-label="Notifications">
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
          <Link to={`/${user.role}/notifications`} className="popover-link" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
