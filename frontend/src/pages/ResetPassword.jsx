import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const isSet = params.get('mode') === 'set'; // Google-only account setting a password
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const u = await resetPassword(token, password);
      toast.success(isSet ? 'Password set — you are now logged in' : 'Password reset — you are now logged in');
      navigate('/dashboard');
      return u;
    } catch (err) {
      setError(err.response?.data?.message || (isSet ? 'Could not set password' : 'Reset failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="page page-narrow">
        <div className="card">
          <div className="alert alert-error">This reset link is invalid or incomplete.</div>
          <p style={{ textAlign: 'center' }}><Link to="/forgot-password">Request a new link</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 className="section-title" style={{ textAlign: 'center' }}>{isSet ? 'Set password' : 'Reset password'}</h1>
        <p className="section-sub" style={{ textAlign: 'center' }}>
          {isSet
            ? 'Set a password so you can also log in with your email, in addition to Google.'
            : 'Choose a new password for your account.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{isSet ? 'Password' : 'New Password'}</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>{isSet ? 'Confirm Password' : 'Confirm New Password'}</label>
            <input className="input" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (isSet ? 'Setting…' : 'Resetting…') : (isSet ? 'Set password' : 'Reset password')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
