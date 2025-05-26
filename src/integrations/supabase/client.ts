import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Assegura que as variáveis de ambiente estejam presentes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL ou Anon Key não configurados. Verifique seu arquivo .env."
  );
}

// Utiliza as opções recomendadas para manter sessão e autenticação do usuário real
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
