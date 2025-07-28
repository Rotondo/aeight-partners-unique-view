
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Re-export the properly configured Supabase client from integrations
export { supabase } from '@/integrations/supabase/client';

// Type export for convenience
export type { Database };

console.log("Cliente Supabase inicializado");
