import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState('');

  const { login, resendVerification } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified('');
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverified(err.response.data.email || email);
        setError('Please verify your email before logging in.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerification(unverified);
      toast.success('Verification email sent — check your inbox');
    } catch {
      toast.error('Could not resend verification');
    }
  };

  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 className="section-title" style={{ textAlign: 'center' }}>Welcome back</h1>
        <p className="section-sub" style={{ textAlign: 'center' }}>Log in to continue your journey</p>

        {error && <div className="alert alert-error">{error}</div>}
        {unverified && (
          <button type="button" className="btn btn-ghost btn-block" style={{ marginBottom: 16 }} onClick={resend}>
            Resend verification email
          </button>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot?</Link>
            </div>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <GoogleAuthButton />

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
