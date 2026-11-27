import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiMessage } from '../api/http';
import { Alert } from '../components/UI';

const ROLES = [
  { value: 'student', label: 'Student', idLabel: 'Roll number', placeholder: 'e.g. 2023CS001' },
  { value: 'faculty', label: 'Faculty', idLabel: 'Faculty ID', placeholder: 'e.g. FT1' },
  { value: 'hod', label: 'HOD', idLabel: 'HOD ID', placeholder: 'e.g. HD1' },
  { value: 'dean', label: 'Dean', idLabel: 'Dean ID', placeholder: 'e.g. DN1' },
  { value: 'admin', label: 'Admin', idLabel: 'Username', placeholder: 'e.g. admin' }
];

const DEMO = [
  { role: 'admin', username: 'admin', password: 'admin123', label: 'Administrator', tone: 'indigo' },
  { role: 'dean', username: 'DN1', password: 'dean123', label: 'Dean', tone: 'violet' },
  { role: 'hod', username: 'HD1', password: 'hod123', label: 'HOD', tone: 'teal' },
  { role: 'faculty', username: 'FT1', password: 'faculty123', label: 'Faculty', tone: 'amber' },
  { role: 'student', username: '2023CS001', password: 'student123', label: 'Student', tone: 'rose' }
];

const FEATURES = [
  { icon: 'shield', title: 'Role based access', text: 'Admin, Dean, HOD, Faculty and Students each get their own workspace.' },
  { icon: 'calendar', title: 'Live timetable', text: 'Class schedules stay in sync for everyone in the department.' },
  { icon: 'check', title: 'Attendance & assignments', text: 'Mark attendance, share assignments and track submissions.' }
];

const ICONS = {
  user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.3" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />
};

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;
  const [form, setForm] = useState({
    username: registered?.username || '',
    password: '',
    usertype: registered?.role || 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    registered ? `Account created. Sign in with your ${registered.role} credentials.` : ''
  );
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const role = ROLES.find((item) => item.value === form.usertype) || ROLES[0];
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const signIn = async (credentials) => {
    setError('');
    setBusy(true);
    try {
      const redirect = await login(credentials);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Could not sign in'));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    signIn(form);
  };

  const useDemo = (demo) => {
    const credentials = { username: demo.username, password: demo.password, usertype: demo.role };
    setForm(credentials);
    signIn(credentials);
  };

  return (
    <div className="login-page">
      <aside className="login-visual">
        <div className="login-brand">
          <div className="brand-mark">D</div>
          <div><strong>DMS</strong><small>Department Management System</small></div>
        </div>

        <div className="login-hero">
          <span className="login-eyebrow">Department portal</span>
          <h1>One place for your whole department.</h1>
          <p>Students, faculty, timetables, attendance and assignments — connected in a single modern workspace.</p>

          <ul className="login-feature-list">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <span className="login-feature-icon"><Icon name={feature.icon} size={20} /></span>
                <div>
                  <strong>{feature.title}</strong>
                  <small>{feature.text}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="login-footnote">© {new Date().getFullYear()} Department Management System</p>
      </aside>

      <main className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-head">
            <h2>Welcome back 👋</h2>
            <p className="login-subtitle">Sign in to continue to your dashboard</p>
          </div>

          <Alert message={success} onClose={() => setSuccess('')} />
          <Alert type="error" message={error} onClose={() => setError('')} />

          <div className="field">
            <span>I am a</span>
            <div className="role-switch" role="radiogroup" aria-label="User type">
              {ROLES.map((item) => (
                <button
                  type="button" key={item.value} role="radio"
                  aria-checked={form.usertype === item.value}
                  className={form.usertype === item.value ? 'active' : ''}
                  onClick={() => setForm({ ...form, usertype: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>{role.idLabel}</span>
            <div className="input-icon">
              <Icon name="user" />
              <input
                name="username" value={form.username} onChange={update}
                placeholder={role.placeholder} autoComplete="username" required autoFocus
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-icon">
              <Icon name="lock" />
              <input
                name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                onChange={update} placeholder="Enter your password" autoComplete="current-password" required
              />
              <button
                type="button" className="input-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} />
              </button>
            </div>
          </label>

          <button className="btn primary block login-submit" disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : <>Sign in <Icon name="arrow" size={16} /></>}
          </button>
          <p className="auth-switch">New to the portal? <Link to="/register">Create account</Link></p>

          <div className="demo-box">
            <div className="demo-divider"><span>Quick demo login</span></div>
            <div className="demo-grid">
              {DEMO.map((demo) => (
                <button type="button" key={demo.role} onClick={() => useDemo(demo)} disabled={busy}>
                  <span className={`demo-avatar ${demo.tone}`}>{demo.label[0]}</span>
                  <span className="demo-text">
                    <strong>{demo.label}</strong>
                    <small>{demo.username}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
