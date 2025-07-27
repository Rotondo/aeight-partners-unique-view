
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Re-export the properly configured Supabase client from integrations
export { supabase } from '@/integrations/supabase/client';

// Type export for convenience
export type { Database };

// Supabase configuration constants - moved to client.ts to avoid circular imports
export const SUPABASE_CONFIG = {
  URL: "https://amuadbftctnmckncgeua.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdWFkYmZ0Y3RubWNrbmNnZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDAyNTIsImV4cCI6MjA2MzMxNjI1Mn0.sx8PDd0vlbt4nQRQfdK6hOuEFbmGVQjD4RJcuU2okxM",
  PROJECT_ID: "amuadbftctnmckncgeua"
} as const;

console.log("Cliente Supabase inicializado");
