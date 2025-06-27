
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
};

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  register: (name: string, email: string, pass: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  loading: boolean;
  updateAvatar: (file: File) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'jcimports@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const supabaseUser = session?.user;
      if (supabaseUser && supabaseUser.email) {
        const user: User = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata.name || supabaseUser.email,
          avatar_url: supabaseUser.user_metadata.avatar_url,
          role: supabaseUser.user_metadata.role || 'user',
        };
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (data.user && !error && email.toLowerCase() === ADMIN_EMAIL) {
      if (data.user.user_metadata.role !== 'admin') {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        if (updateError) console.error("Failed to update admin role:", updateError);
      }
    }

    setLoading(false);
    return { error };
  };

  const register = async (name: string, email: string, pass: string) => {
     setLoading(true);
     const userRole = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';
     const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name: name,
            role: userRole,
          }
        }
     });

     if (data.user && !error) {
        await supabase.auth.updateUser({
            data: {
                avatar_url: `https://i.pravatar.cc/150?u=${data.user.id}`
            }
        });
     }

     setLoading(false);
     return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push('/login');
  };

  const updateAvatar = async (file: File) => {
    if (!currentUser) {
        return { error: new Error("Usuário não autenticado.") };
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('public-images')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl(filePath);

        const { data: updatedUserData, error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        if (updateError) {
            throw updateError;
        }

        if (updatedUserData.user) {
             setCurrentUser(prevUser => prevUser ? {
                ...prevUser,
                avatar_url: updatedUserData.user?.user_metadata.avatar_url,
            } : null);
        }

        return { error: null };
    } catch (error: any) {
        console.error("Avatar update error:", error);
        return { error: new Error(error.message || "Ocorreu um erro desconhecido.") };
    }
  };


  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    updateAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
