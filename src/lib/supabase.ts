
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing");
  toast({
    title: "Erro de configuração",
    description: "As variáveis de ambiente do Supabase não estão configuradas corretamente.",
    variant: "destructive"
  });
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
