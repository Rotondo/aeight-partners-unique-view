
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Usuario } from "@/types";
import { Session } from "@supabase/supabase-js";

// Safe hook wrapper
const useSafeState = <T>(initialValue: T): [T, (value: T) => void] => {
  if (typeof useState !== 'function') {
    console.error('[useAuth] useState not available');
    return [initialValue, () => {}];
  }
  return useState(initialValue);
};

const useSafeEffect = (effect: () => void | (() => void), deps?: any[]) => {
  if (typeof useEffect !== 'function') {
    console.error('[useAuth] useEffect not available');
    return;
  }
  return useEffect(effect, deps);
};

const useSafeCallback = <T extends (...args: any[]) => any>(callback: T, deps: any[]): T => {
  if (typeof useCallback !== 'function') {
    console.error('[useAuth] useCallback not available');
    return callback;
  }
  return useCallback(callback, deps);
};

export const useAuth = () => {
  // Safe state initialization
  const [user, setUser] = useSafeState<Usuario | null>(null);
  const [session, setSession] = useSafeState<Session | null>(null);
  const [loading, setLoading] = useSafeState(true);
  const [error, setError] = useSafeState<string | null>(null);

  // Função para buscar usuário com timeout mais equilibrado
  const fetchUser = useSafeCallback(async (userId: string): Promise<Usuario | null> => {
    try {
      console.log('[useAuth] Buscando usuário:', userId);
      
      // Timeout de 5 segundos (mais equilibrado)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar usuário')), 5000)
      );

      const queryPromise = supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          email,
          papel,
          empresa_id,
          ativo,
          created_at,
          empresa:empresas(id, nome, tipo)
        `)
        .eq('id', userId)
        .eq('ativo', true)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('[useAuth] Erro ao buscar usuário:', error);
        return null;
      }

      console.log('[useAuth] Usuário encontrado:', data);
      return data as Usuario;
    } catch (error) {
      console.error('[useAuth] Erro/timeout ao buscar usuário:', error);
      return null;
    }
  }, []);

  // Função para obter sessão com timeout
  const getSession = useSafeCallback(async (): Promise<Session | null> => {
    try {
      console.log('[useAuth] Obtendo sessão...');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao obter sessão')), 3000)
      );

      const sessionPromise = supabase.auth.getSession();
      
      const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (error) {
        console.error('[useAuth] Erro ao obter sessão:', error);
        return null;
      }
      
      console.log('[useAuth] Sessão obtida:', !!data.session);
      return data.session;
    } catch (error) {
      console.error('[useAuth] Erro/timeout ao obter sessão:', error);
      return null;
    }
  }, []);

  // Inicializar autenticação
  useSafeEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setError(null);
        console.log('[useAuth] Inicializando autenticação...');

        const currentSession = await getSession();
        
        if (!isMounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          
          const userData = await fetchUser(currentSession.user.id);
          
          if (!isMounted) return;
          
          if (userData) {
            setUser(userData);
            console.log('[useAuth] Usuário autenticado:', userData.nome);
          } else {
            console.log('[useAuth] Usuário não encontrado no banco');
            setError('Usuário não encontrado');
          }
        } else {
          console.log('[useAuth] Nenhuma sessão ativa');
        }
      } catch (error) {
        console.error('[useAuth] Erro na inicialização:', error);
        if (isMounted) {
          setError('Erro ao inicializar autenticação');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] Estado de auth mudou:', event);
      
      if (!isMounted) return;

      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUser(session.user.id);
        if (isMounted && userData) {
          setUser(userData);
          setError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUser, getSession]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useAuth] Tentando fazer login...');

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no login')), 10000)
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) {
        console.error('[useAuth] Erro no login:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('[useAuth] Login realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('[useAuth] Erro/timeout no login:', error);
      const errorMessage = error.message || 'Erro no login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('[useAuth] Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[useAuth] Erro no logout:', error);
        return { success: false, error: error.message };
      }

      setUser(null);
      setSession(null);
      setError(null);
      console.log('[useAuth] Logout realizado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('[useAuth] Erro no logout:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user && !!session,
  };
};
