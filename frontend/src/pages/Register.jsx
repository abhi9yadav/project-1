import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // { email, devVerifyLink }

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password);
      if (res.needsVerification) {
        setSent({ email: res.email, devVerifyLink: res.devVerifyLink });
      } else {
        toast.success('Account created!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="page page-narrow">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="verify-icon info">✉</div>
          <h1 className="section-title">Check your email</h1>
          <p className="section-sub">
            We sent a verification link to <strong>{sent.email}</strong>. Click it to activate your account.
          </p>
          {sent.devVerifyLink && (
            <div className="alert" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              Dev mode: <Link to={sent.devVerifyLink.replace(/^.*(\/verify-email.*)$/, '$1')}>open verification link</Link>
            </div>
          )}
          <Link to="/login" className="btn btn-ghost">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 className="section-title" style={{ textAlign: 'center' }}>Create account</h1>
        <p className="section-sub" style={{ textAlign: 'center' }}>Start tracking your DSA progress</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input className="input" type="text" name="name" value={form.name}
              onChange={change} required autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email}
              onChange={change} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password}
              onChange={change} required />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input className="input" type="password" name="confirmPassword" value={form.confirmPassword}
              onChange={change} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <GoogleAuthButton />

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
