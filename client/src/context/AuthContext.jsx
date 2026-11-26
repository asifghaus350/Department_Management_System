import { createContext, useContext, useState } from 'react';
import api from '../api/http';

const AuthContext = createContext(null);
const USER_KEY = 'dms_user';
const TOKEN_KEY = 'dms_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  const login = async (credentials) => {
    const { data } = await api.post('/api/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.redirect;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const changePassword = async (payload) => {
    const { data } = await api.post('/api/auth/change-password', payload);
    return data;
  };

  const updateLocalUser = (patch) => {
    const next = { ...user, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
