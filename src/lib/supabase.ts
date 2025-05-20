
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types'; // Using the database types

// Using the hardcoded values from src/integrations/supabase/client.ts
const supabaseUrl = "https://amuadbftctnmckncgeua.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdWFkYmZ0Y3RubWNrbmNnZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDAyNTIsImV4cCI6MjA2MzMxNjI1Mn0.sx8PDd0vlbt4nQRQfdK6hOuEFbmGVQjD4RJcuU2okxM";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing");
  toast({
    title: "Erro de configuração",
    description: "As variáveis de ambiente do Supabase não estão configuradas corretamente.",
    variant: "destructive"
  });
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
