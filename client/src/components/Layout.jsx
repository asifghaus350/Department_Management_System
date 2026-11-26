import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAVIGATION = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
    { to: '/admin/students', label: 'Students', icon: '◉' },
    { to: '/admin/faculty', label: 'Faculty', icon: '◈' },
    { to: '/admin/courses', label: 'Courses', icon: '▤' },
    { to: '/admin/timetable', label: 'Time Table', icon: '▦' },
    { to: '/admin/announcements', label: 'Announcements', icon: '✦' },
    { to: '/admin/management', label: 'Management', icon: '⚑' },
    { to: '/admin/reports', label: 'Reports', icon: '◫' },
    { to: '/admin/events', label: 'Events', icon: '▣' }
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: '▦', end: true },
    { to: '/student/timetable', label: 'Time Table', icon: '▦' },
    { to: '/student/assignments', label: 'Assignments', icon: '▤' },
    { to: '/student/exams', label: 'Exams', icon: '◷' },
    { to: '/student/leave', label: 'Leave / OD', icon: '✉' },
    { to: '/student/events', label: 'Events', icon: '▣' }
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: '▦', end: true },
    { to: '/faculty/attendance', label: 'Attendance', icon: '✓' },
    { to: '/faculty/assignments', label: 'Assignments', icon: '▤' },
    { to: '/faculty/timetable', label: 'Time Table', icon: '▦' },
    { to: '/faculty/leave', label: 'Leave / OD', icon: '✉' },
    { to: '/faculty/events', label: 'Events', icon: '▣' }
  ],
  hod: [
    { to: '/hod', label: 'Dashboard', icon: '▦', end: true },
    { to: '/hod/people', label: 'People', icon: '◉' },
    { to: '/hod/leave', label: 'Approvals', icon: '✓' },
    { to: '/hod/reports', label: 'Reports', icon: '◫' },
    { to: '/hod/announcements', label: 'Announcements', icon: '✦' },
    { to: '/hod/events', label: 'Events', icon: '▣' }
  ],
  dean: [
    { to: '/dean', label: 'Dashboard', icon: '▦', end: true },
    { to: '/dean/departments', label: 'Departments', icon: '▤' },
    { to: '/dean/leave', label: 'Approvals', icon: '✓' },
    { to: '/dean/reports', label: 'Reports', icon: '◫' },
    { to: '/dean/announcements', label: 'Announcements', icon: '✦' },
    { to: '/dean/events', label: 'Events', icon: '▣' }
  ]
};

const TITLES = {
  admin: 'Admin Panel', student: 'Student Panel', faculty: 'Faculty Panel',
  hod: 'Head of Department', dean: 'Dean’s Office'
};

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('dms_theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem('dms_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`app-shell ${open ? 'sidebar-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>DMS</strong>
            <small>Department Management</small>
          </div>
        </div>
        <p className="nav-caption">{TITLES[role]}</p>
        <nav>
          {NAVIGATION[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to={`/${role}/profile`} className="nav-link" onClick={() => setOpen(false)}>
            <span className="nav-icon">☺</span>My Profile
          </NavLink>
          <NavLink to="/change-password" className="nav-link" onClick={() => setOpen(false)}>
            <span className="nav-icon">⚿</span>Change Password
          </NavLink>
          <button className="nav-link logout" onClick={handleLogout}>
            <span className="nav-icon">↪</span>Logout
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="topbar-right">
            <NotificationBell />
            <button className="icon-btn" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
              {dark ? '☀' : '☾'}
            </button>
            <NavLink to={`/${role}/profile`} className="user-chip">
              <span className="avatar">{(user?.name || '?').charAt(0).toUpperCase()}</span>
              <span className="user-text">
                <strong>{user?.name}</strong>
                <small>{user?.role}</small>
              </span>
            </NavLink>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
      {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />}
    </div>
  );
}
