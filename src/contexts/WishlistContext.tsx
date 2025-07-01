import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Definição dos tipos
export interface WishlistItem {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  url: string | null;
  priority: 'alta' | 'média' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluído';
  tipo: 'feature' | 'bug' | 'melhoria' | 'outro';
  user_id: string;
  votes: number;
  assignee_id: string | null;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: Omit<WishlistItem, 'id' | 'created_at' | 'votes'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  voteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

// Criação do contexto
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar itens quando o componente montar
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  async function fetchWishlistItems() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .order('votes', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      setWishlistItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar itens da wishlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar wishlist');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens da wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function addItem(item: Omit<WishlistItem, 'id' | 'created_at' | 'votes'>) {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ ...item, votes: 0 })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      setWishlistItems(prev => [data, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Item adicionado à wishlist',
      });
    } catch (err) {
      console.error('Erro ao adicionar item à wishlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao adicionar item');
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item à wishlist',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateItem(id: string, updates: Partial<WishlistItem>) {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('wishlist')
        .update(updates)
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      setWishlistItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso',
      });
    } catch (err) {
      console.error('Erro ao atualizar item da wishlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar item');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteItem(id: string) {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      setWishlistItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Item removido da wishlist',
      });
    } catch (err) {
      console.error('Erro ao excluir item da wishlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao excluir item');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function voteItem(id: string) {
    try {
      setIsLoading(true);
      setError(null);
      
      // Primeiro, obtenha o item atual para incrementar o contador de votos
      const item = wishlistItems.find(i => i.id === id);
      if (!item) throw new Error('Item não encontrado');
      
      const newVotes = (item.votes || 0) + 1;
      
      const { error } = await supabase
        .from('wishlist')
        .update({ votes: newVotes })
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      setWishlistItems(prev => 
        prev.map(item => item.id === id ? { ...item, votes: newVotes } : item)
      );
      
      toast({
        title: 'Voto registrado',
        description: 'Seu voto foi contabilizado com sucesso',
      });
    } catch (err) {
      console.error('Erro ao votar em item da wishlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao votar');
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar seu voto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshItems() {
    return fetchWishlistItems();
  }

  const value = {
    wishlistItems,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    voteItem,
    refreshItems,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook para usar o contexto
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist deve ser usado dentro de um WishlistProvider');
  }
  return context;
}

// Exportação padrão para permitir imports mais limpos
export default WishlistProvider;
