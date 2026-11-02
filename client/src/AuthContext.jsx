import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore the session from the httpOnly cookie
  useEffect(() => { api('/api/auth/me').then((u) => setUser(u.name ? u : null)).catch(() => setUser(null)); }, []);
  const login = async (email, password) => setUser(await api('/api/auth/login', { method: 'POST', body: { email, password } }));
  const register = (name, email, password) => api('/api/auth/register', { method: 'POST', body: { name, email, password } });
  const logout = async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
