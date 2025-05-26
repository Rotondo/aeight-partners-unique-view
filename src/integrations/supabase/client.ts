import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use as variáveis de ambiente para produção e fallback para dev/local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://amuadbftctnmckncgeua.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdWFkYmZ0Y3RubWNrbmNnZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDAyNTIsImV4cCI6MjA2MzMxNjI1Mn0.sx8PDd0vlbt4nQRQfdK6hOuEFbmGVQjD4RJcuU2okxM";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL ou Anon Key não configurados. Verifique seu arquivo .env ou valores padrão."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage,
    },
  }
);
