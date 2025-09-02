
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Service centralizado para todas as chamadas do Supabase
 */
export class ApiService {
  /**
   * Executa uma query do Supabase com error handling padronizado
   */
  static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>,
    errorMessage: string = 'Erro na operação'
  ): Promise<T | null> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na operação",
        variant: "destructive"
      });
      return null;
    }
  }

  /**
   * Executa uma mutação do Supabase com error handling padronizado
   */
  static async executeMutation<T>(
    mutationFn: () => Promise<{ data: T | null; error: unknown }>,
    successMessage: string,
    errorMessage: string
  ): Promise<T | null> {
    try {
      const { data, error } = await mutationFn();
      
      if (error) {
        console.error('Mutation error:', error);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Sucesso",
        description: successMessage
      });
      
      return data;
    } catch (error) {
      console.error('Unexpected mutation error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na operação",
        variant: "destructive"
      });
      return null;
    }
  }
}
