
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthError, User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';

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
  updateAvatar: (file: File) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'jcimports@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [supabase] = useState(() => createClient());
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
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

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
     
     setLoading(false);
     return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push('/login');
  };

  const updateAvatar = async (file: File): Promise<{ error: Error | null }> => {
    if (!currentUser) {
      return { error: new Error('Usuário não autenticado.') };
    }
    
    if (!file || !file.name) {
        return { error: new Error("Nenhum arquivo válido foi selecionado.") };
    }

    // A Causa do Erro: Política de Segurança de Nível de Linha (RLS)
    // O erro 403 "violates row-level security policy" indica que o Supabase está
    // bloqueando o upload porque ele não cumpre as regras de segurança.
    // Uma política comum e segura é permitir que os usuários façam upload apenas
    // para uma pasta com o nome de seu próprio ID de usuário.
    // A correção é garantir que o caminho do arquivo siga esse padrão.
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${currentUser.id}/${fileName}`; // Caminho: 'USER_ID/unique_file_name.jpg'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(filePath, file);

    if (uploadError) {
      // Log do erro completo para depuração
      console.error('Supabase Storage upload error:', JSON.stringify(uploadError, null, 2));
      const message =
        (uploadError as any).message ||
        'Falha no upload da imagem. Verifique se as permissões de armazenamento (RLS) estão configuradas corretamente para permitir uploads na pasta do usuário.';
      return { error: new Error(message) };
    }

    if (!uploadData?.path) {
        return { error: new Error('O upload foi bem-sucedido, mas o caminho do arquivo não foi retornado.') };
    }

    const { data: urlData } = supabase.storage
      .from('public-images')
      .getPublicUrl(uploadData.path); 

    if (!urlData?.publicUrl) {
      return { error: new Error('Não foi possível obter a URL pública da imagem após o upload.') };
    }
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      console.error('Supabase auth update user error:', JSON.stringify(updateError, null, 2));
      return { error: new Error(updateError.message || 'Falha ao atualizar o perfil do usuário.') };
    }

    // Update local state immediately with the confirmed URL
    setCurrentUser((prevUser) =>
      prevUser ? { ...prevUser, avatar_url: publicUrl } : null
    );

    return { error: null };
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
