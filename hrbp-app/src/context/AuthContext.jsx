import { createContext, useContext, useState, useCallback } from 'react';
import { dataService } from '../services/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hrbp_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await dataService.login(email, password);
      localStorage.setItem('access_token', result.token);
      localStorage.setItem('hrbp_user', JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('hrbp_user');
    setUser(null);
  }, []);

  const updateCurrentUser = useCallback((updatedUser) => {
    localStorage.setItem('hrbp_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
