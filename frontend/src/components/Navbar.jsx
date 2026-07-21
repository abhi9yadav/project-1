import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">◈</span>
          DSA Tracker
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-link" end>Home</NavLink>
          <NavLink to="/sheets" className="nav-link">Sheets</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
              {user.isAdmin && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
            </>
          )}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
