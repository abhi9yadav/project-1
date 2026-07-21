import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setDevLink(data?.devResetLink || '');
      setSent(true);
    } catch {
      setSent(true); // generic — never reveal whether the email exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 className="section-title" style={{ textAlign: 'center' }}>Forgot password</h1>

        {sent ? (
          <>
            <div className="alert alert-success">
              If an account with that email exists, we've sent a password reset link.
            </div>
            {devLink && (
              <div className="alert" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                Dev mode (email off): <Link to={devLink.replace(/^.*(\/reset-password.*)$/, '$1')}>open reset link</Link>
              </div>
            )}
            <p style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login">Back to login</Link>
            </p>
          </>
        ) : (
          <>
            <p className="section-sub" style={{ textAlign: 'center' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)' }}>
              Remembered it? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
