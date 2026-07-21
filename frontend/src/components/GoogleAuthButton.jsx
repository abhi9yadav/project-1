import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders the Google sign-in button. Returns null when Google isn't configured,
// so the rest of the auth UI works without it.
const GoogleAuthButton = () => {
  const { loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  if (!clientId) return null;

  return (
    <>
      <div className="auth-divider"><span>or</span></div>
      <div className="google-btn-wrap">
        <GoogleLogin
          theme={theme === 'dark' ? 'filled_black' : 'outline'}
          size="large"
          text="continue_with"
          shape="pill"
          width="320"
          onSuccess={async (cred) => {
            try {
              const u = await loginWithGoogle(cred.credential);
              toast.success(`Welcome, ${u.name.split(' ')[0]}!`);
              navigate('/dashboard');
            } catch {
              toast.error('Google sign-in failed');
            }
          }}
          onError={() => toast.error('Google sign-in failed')}
        />
      </div>
    </>
  );
};

export default GoogleAuthButton;
