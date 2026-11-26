import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiMessage } from '../api/http';
import { Alert, Field } from '../components/UI';

const DEMO = [
  { role: 'admin', username: 'admin', password: 'admin123', label: 'Administrator' },
  { role: 'dean', username: 'DN1', password: 'dean123', label: 'Dean' },
  { role: 'hod', username: 'HD1', password: 'hod123', label: 'HOD' },
  { role: 'faculty', username: 'FT1', password: 'faculty123', label: 'Faculty' },
  { role: 'student', username: '2023CS001', password: 'student123', label: 'Student' }
];

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    registered ? `Account created. Sign in with your ${registered.role} credentials.` : ''
  );
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const redirect = await login(form);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Could not sign in'));
    } finally {
      setBusy(false);
    }
  };

  const useDemo = async (demo) => {
    const credentials = { username: demo.username, password: demo.password, usertype: demo.role };
    setForm(credentials);
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

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-mark">D</div>
          <div><strong>DMS</strong><small>Department Management System</small></div>
        </div>
        <h1>One place for your whole department.</h1>
        <p>Students, faculty, timetables, attendance and assignments — connected in a single modern workspace.</p>
        <div className="login-features">
          <span>◉ Role based access</span>
          <span>▦ Live timetable</span>
          <span>✓ Attendance tracking</span>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>
          <Alert message={success} onClose={() => setSuccess('')} />
          <Alert type="error" message={error} onClose={() => setError('')} />

          <Field label="User type">
            <select name="usertype" value={form.usertype} onChange={update}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="hod">Head of Department</option>
              <option value="dean">Dean</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label={form.usertype === 'student' ? 'Roll number' : form.usertype === 'faculty' ? 'Faculty ID' : form.usertype === 'hod' ? 'HOD ID' : form.usertype === 'dean' ? 'Dean ID' : 'Username'}>
            <input
              name="username" value={form.username} onChange={update}
              placeholder={form.usertype === 'student' ? '2023CS001' : form.usertype === 'faculty' ? 'FT1' : form.usertype === 'hod' ? 'HD1' : form.usertype === 'dean' ? 'DN1' : 'admin'}
              required autoFocus
            />
          </Field>
          <Field label="Password">
            <input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" required />
          </Field>
          <button className="btn primary block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="auth-switch">New to the portal? <Link to="/register">Create account</Link></p>

          <div className="demo-box">
            <span>Demo accounts</span>
            <div className="demo-grid">
              {DEMO.map((demo) => (
                <button type="button" key={demo.role} onClick={() => useDemo(demo)}>
                  <strong>{demo.label}</strong>
                  <small>{demo.username}</small>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
