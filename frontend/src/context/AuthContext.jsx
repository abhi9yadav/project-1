import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // The login/register responses don't include solvedQuestions/starredQuestions/notes,
  // so fetch the full profile and merge it (keeping the auth token) so the UI can
  // reflect solved/starred state.
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await client.get('/auth/profile');
      return data;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }, []);

  // Re-pull the profile and merge it into the current user. Used after
  // solving/starring/noting so the UI updates without a full page reload.
  const refreshUser = useCallback(async () => {
    const profile = await fetchProfile();
    if (profile) {
      setUser((prev) => {
        const merged = { ...prev, ...profile, token: prev?.token };
        localStorage.setItem('userInfo', JSON.stringify(merged));
        return merged;
      });
    }
    return profile;
  }, [fetchProfile]);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);

    if (parsed.token) {
      fetchProfile()
        .then((profile) => {
          if (profile) {
            persistUser({ ...parsed, ...profile, token: parsed.token });
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile, persistUser]);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    // Store token first so the interceptor can authenticate the profile call.
    persistUser(data);
    const profile = await fetchProfile();
    const merged = profile ? { ...data, ...profile, token: data.token } : data;
    persistUser(merged);
    return merged;
  };

  const register = async (name, email, password) => {
    const { data } = await client.post('/auth/register', { name, email, password });
    // When email verification is required, the server doesn't log the user in.
    if (data.needsVerification) {
      return { needsVerification: true, email: data.email, devVerifyLink: data.devVerifyLink };
    }
    persistUser(data);
    const profile = await fetchProfile();
    const merged = profile ? { ...data, ...profile, token: data.token } : data;
    persistUser(merged);
    return merged;
  };

  // Complete a session from an auth response that already contains a token
  // (used by Google login, email verification, and password reset).
  const completeSession = async (data) => {
    persistUser(data);
    const profile = await fetchProfile();
    const merged = profile ? { ...data, ...profile, token: data.token } : data;
    persistUser(merged);
    return merged;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await client.post('/auth/google', { credential });
    return completeSession(data);
  };

  const verifyEmail = async (token) => {
    const { data } = await client.post('/auth/verify-email', { token });
    return completeSession(data);
  };

  const resendVerification = (email) =>
    client.post('/auth/resend-verification', { email });

  const forgotPassword = (email) =>
    client.post('/auth/forgot-password', { email }).then((r) => r.data);

  const resetPassword = async (token, password) => {
    const { data } = await client.post('/auth/reset-password', { token, password });
    return completeSession(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    loginWithGoogle,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
