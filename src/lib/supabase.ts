import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Valores devem vir do .env para segurança e flexibilidade
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing");
  toast({
    title: "Erro de configuração",
    description: "As variáveis de ambiente do Supabase não estão configuradas corretamente.",
    variant: "destructive"
  });
}

// Configure o cliente Supabase com opções explícitas para autenticação
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage
    }
  }
);

console.log("Cliente Supabase inicializado");
