import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Mitra } from './types';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  mitra: Mitra | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mitra, setMitra] = useState<Mitra | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string, email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError || !userData) {
        // Fallback jika profil di tabel users belum dibuat (misal: admin pertama)
        if (email === 'admin@laundry.com') {
          const adminUser: User = { id: userId, nama: 'Admin Pusat', email: 'admin@laundry.com', role: 'admin' };
          setUser(adminUser);
          setMitra(null);
          return;
        }
        return;
      }

      setUser(userData);

      if (userData.role === 'mitra') {
        const { data: mitraData } = await supabase
          .from('mitra')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
        setMitra(mitraData);
      } else {
        setMitra(null);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setMitra(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await fetchUserData(data.user.id, data.user.email!);
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMitra(null);
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

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