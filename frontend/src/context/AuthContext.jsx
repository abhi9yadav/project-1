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
    persistUser(data);
    const profile = await fetchProfile();
    const merged = profile ? { ...data, ...profile, token: data.token } : data;
    persistUser(merged);
    return merged;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
