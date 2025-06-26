
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'jcimports@gmail.com';
const ADMIN_PASS = '36377667';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
          const adminUser: User = { name: 'Admin JC', email: ADMIN_EMAIL, role: 'admin' };
          setCurrentUser(adminUser);
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          setLoading(false);
          resolve();
        } else {
          // Mock user login - in a real app, you'd check against a database
          // For this prototype, any other login is a regular user.
          const regularUser: User = { name: 'Usuário', email, role: 'user' };
          setCurrentUser(regularUser);
          localStorage.setItem('currentUser', JSON.stringify(regularUser));
          setLoading(false);
          resolve();
        }
        // In a real app you might have a failure case:
        // setLoading(false);
        // reject(new Error('Credenciais inválidas'));
      }, 500);
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
     setLoading(true);
     // Simulate API call for registration
     return new Promise((resolve) => {
       setTimeout(() => {
         const newUser: User = { name, email, role: 'user' };
         setCurrentUser(newUser);
         localStorage.setItem('currentUser', JSON.stringify(newUser));
         setLoading(false);
         resolve();
       }, 500);
     });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
