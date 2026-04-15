import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, Mitra } from './types';
import { mockUsers, mockMitra } from './mock-data';

interface AuthContextType {
  user: User | null;
  mitra: Mitra | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const mitra = user?.role === 'mitra' ? mockMitra.find((m) => m.user_id === user.id) ?? null : null;

  return (
    <AuthContext.Provider value={{ user, mitra, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
