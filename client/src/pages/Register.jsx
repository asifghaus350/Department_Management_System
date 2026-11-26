import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { apiMessage } from '../api/http';
import useFetch from '../api/useFetch';
import { useAuth } from '../context/AuthContext';
import { Alert, Field } from '../components/UI';

const STUDENT_EMPTY = {
  rollno: '', enroll: '', name: '', email: '', password: '', confirmPassword: '',
  courseId: '', semesterId: '', dob: '', address: ''
};
const FACULTY_EMPTY = {
  facultyId: '', name: '', email: '', phone: '', password: '', confirmPassword: '',
  departmentId: '', qualification: '', researchInterest: '', address: ''
};

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const options = useFetch('/api/register/options');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ ...STUDENT_EMPTY, ...FACULTY_EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({ ...STUDENT_EMPTY, ...FACULTY_EMPTY });
    setError('');
  }, [role]);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 4) {
      return setError('Password must be at least 4 characters');
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/api/register/${role}`, form);
      navigate('/login', {
        replace: true,
        state: { registered: { role, username: role === 'student' ? form.rollno : form.facultyId, message: data.message } }
      });
    } catch (err) {
      setError(apiMessage(err, 'Could not create account'));
    } finally {
      setBusy(false);
    }
  };

  const isStudent = role === 'student';
  const idField = isStudent ? 'rollno' : 'facultyId';

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-mark">D</div>
          <div><strong>DMS</strong><small>Department Management System</small></div>
        </div>
        <h1>Join your department portal.</h1>
        <p>Create your account with your college ID, then sign in to access your dashboard, timetable and records.</p>
        <div className="login-features">
          <span>◉ Students & faculty</span>
          <span>▦ Instant access</span>
          <span>✓ Secure passwords</span>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card register-card" onSubmit={submit}>
          <h2>Create account</h2>
          <p className="login-subtitle">Register to start using the portal</p>
          <Alert type="error" message={error} onClose={() => setError('')} />

          <div className="tabs register-tabs">
            <button type="button" className={isStudent ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
            <button type="button" className={!isStudent ? 'active' : ''} onClick={() => setRole('faculty')}>Faculty</button>
          </div>

          <div className="form-grid">
            <Field label={isStudent ? 'Roll number' : 'Faculty ID'}>
              <input required value={form[idField]} name={idField} onChange={update} placeholder={isStudent ? '2024CS001' : 'FT4'} />
            </Field>
            <Field label="Full name">
              <input required value={form.name} name="name" onChange={update} placeholder="Your full name" />
            </Field>
            {isStudent && (
              <>
                <Field label="Enrollment no"><input value={form.enroll} name="enroll" onChange={update} /></Field>
                <Field label="Date of birth"><input type="date" value={form.dob} name="dob" onChange={update} /></Field>
                <Field label="Course">
                  <select name="courseId" value={form.courseId} onChange={update}>
                    <option value="">Select course</option>
                    {(options.data?.courses || []).map((c) => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Semester">
                  <select name="semesterId" value={form.semesterId} onChange={update}>
                    <option value="">Select semester</option>
                    {(options.data?.semesters || []).map((s) => <option key={s.semesterId} value={s.semesterId}>{s.name}</option>)}
                  </select>
                </Field>
              </>
            )}
            {!isStudent && (
              <>
                <Field label="Phone"><input value={form.phone} name="phone" onChange={update} /></Field>
                <Field label="Qualification"><input value={form.qualification} name="qualification" onChange={update} /></Field>
                <Field label="Department">
                  <select name="departmentId" value={form.departmentId} onChange={update}>
                    <option value="">Select department</option>
                    {(options.data?.courses || []).map((c) => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Research interest"><input value={form.researchInterest} name="researchInterest" onChange={update} /></Field>
              </>
            )}
            <Field label="Email"><input type="email" value={form.email} name="email" onChange={update} /></Field>
            <Field label="Address"><input value={form.address} name="address" onChange={update} /></Field>
            <Field label="Password">
              <input type="password" required minLength="4" value={form.password} name="password" onChange={update} placeholder="••••••••" />
            </Field>
            <Field label="Confirm password">
              <input type="password" required minLength="4" value={form.confirmPassword} name="confirmPassword" onChange={update} placeholder="••••••••" />
            </Field>
          </div>

          <button className="btn primary block" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
