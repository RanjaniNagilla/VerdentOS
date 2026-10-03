'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string, company?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to load user session');
      }
    }
  }, []);

  const login = (name: string, email: string, company = 'Nord Textiles Group') => {
    const newUser = { name: name.trim(), email: email.trim(), company };
    setUser(newUser);
    localStorage.setItem('app_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}