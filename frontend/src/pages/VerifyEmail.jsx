import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus('error');
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1800);
      })
      .catch(() => setStatus('error'));
  }, [token, verifyEmail, navigate]);

  return (
    <div className="page page-narrow">
      <div className="card" style={{ textAlign: 'center' }}>
        {status === 'verifying' && <Spinner label="Verifying your email…" />}

        {status === 'success' && (
          <>
            <div className="verify-icon success">✓</div>
            <h1 className="section-title">Email verified!</h1>
            <p className="section-sub">Your account is active. Redirecting to your dashboard…</p>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon error">✕</div>
            <h1 className="section-title">Verification failed</h1>
            <p className="section-sub">This link is invalid or has expired.</p>
            <Link to="/login" className="btn btn-ghost">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
