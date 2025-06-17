
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { Evento, ContatoEvento, EventoWithContatos } from '@/types/eventos';

interface EventosContextType {
  eventos: EventoWithContatos[];
  eventoAtivo: EventoWithContatos | null;
  loading: boolean;
  createEvento: (evento: Partial<Evento>) => Promise<void>;
  updateEvento: (id: string, evento: Partial<Evento>) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  setEventoAtivo: (evento: EventoWithContatos | null) => void;
  addContato: (contato: Partial<ContatoEvento>) => Promise<void>;
  updateContato: (id: string, contato: Partial<ContatoEvento>) => Promise<void>;
  deleteContato: (id: string) => Promise<void>;
  refreshEventos: () => Promise<void>;
}

const EventosContext = createContext<EventosContextType | undefined>(undefined);

interface EventosProviderProps {
  children: ReactNode;
}

export const EventosProvider: React.FC<EventosProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<EventoWithContatos[]>([]);
  const [eventoAtivo, setEventoAtivo] = useState<EventoWithContatos | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEventos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (eventosError) throw eventosError;

      // Buscar contatos para cada evento
      const eventosWithContatos: EventoWithContatos[] = [];
      
      for (const evento of eventosData || []) {
        const { data: contatos, error: contatosError } = await supabase
          .from('contatos_evento')
          .select('*')
          .eq('evento_id', evento.id)
          .order('created_at', { ascending: false });

        if (contatosError) throw contatosError;

        eventosWithContatos.push({
          ...evento,
          contatos: contatos || [],
          total_contatos: contatos?.length || 0
        });
      }

      setEventos(eventosWithContatos);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (novoEvento: Partial<Evento>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([{
          ...novoEvento,
          usuario_responsavel_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const eventoWithContatos: EventoWithContatos = {
        ...data,
        contatos: [],
        total_contatos: 0
      };

      setEventos(prev => [eventoWithContatos, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar evento",
        variant: "destructive"
      });
    }
  };

  const updateEvento = async (id: string, eventoAtualizado: Partial<Evento>) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update(eventoAtualizado)
        .eq('id', id);

      if (error) throw error;

      setEventos(prev => prev.map(evento => 
        evento.id === id ? { ...evento, ...eventoAtualizado } : evento
      ));

      if (eventoAtivo?.id === id) {
        setEventoAtivo(prev => prev ? { ...prev, ...eventoAtualizado } : null);
      }

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar evento",
        variant: "destructive"
      });
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEventos(prev => prev.filter(evento => evento.id !== id));
      
      if (eventoAtivo?.id === id) {
        setEventoAtivo(null);
      }

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir evento",
        variant: "destructive"
      });
    }
  };

  const addContato = async (novoContato: Partial<ContatoEvento>) => {
    if (!eventoAtivo) return;

    try {
      const { data, error } = await supabase
        .from('contatos_evento')
        .insert([{
          ...novoContato,
          evento_id: eventoAtivo.id
        }])
        .select()
        .single();

      if (error) throw error;

      const eventoAtualizado = {
        ...eventoAtivo,
        contatos: [data, ...eventoAtivo.contatos],
        total_contatos: eventoAtivo.total_contatos + 1
      };

      setEventoAtivo(eventoAtualizado);
      setEventos(prev => prev.map(evento => 
        evento.id === eventoAtivo.id ? eventoAtualizado : evento
      ));

      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar contato",
        variant: "destructive"
      });
    }
  };

  const updateContato = async (id: string, contatoAtualizado: Partial<ContatoEvento>) => {
    try {
      const { error } = await supabase
        .from('contatos_evento')
        .update(contatoAtualizado)
        .eq('id', id);

      if (error) throw error;

      if (eventoAtivo) {
        const eventAtualizado = {
          ...eventoAtivo,
          contatos: eventoAtivo.contatos.map(contato => 
            contato.id === id ? { ...contato, ...contatoAtualizado } : contato
          )
        };
        setEventoAtivo(eventAtualizado);
        setEventos(prev => prev.map(evento => 
          evento.id === eventoAtivo.id ? eventAtualizado : evento
        ));
      }

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar contato",
        variant: "destructive"
      });
    }
  };

  const deleteContato = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contatos_evento')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (eventoAtivo) {
        const eventoAtualizado = {
          ...eventoAtivo,
          contatos: eventoAtivo.contatos.filter(contato => contato.id !== id),
          total_contatos: eventoAtivo.total_contatos - 1
        };
        setEventoAtivo(eventoAtualizado);
        setEventos(prev => prev.map(evento => 
          evento.id === eventoAtivo.id ? eventoAtualizado : evento
        ));
      }

      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir contato",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      refreshEventos();
    }
  }, [user]);

  const value: EventosContextType = {
    eventos,
    eventoAtivo,
    loading,
    createEvento,
    updateEvento,
    deleteEvento,
    setEventoAtivo,
    addContato,
    updateContato,
    deleteContato,
    refreshEventos
  };

  return (
    <EventosContext.Provider value={value}>
      {children}
    </EventosContext.Provider>
  );
};

export const useEventos = () => {
  const context = useContext(EventosContext);
  if (context === undefined) {
    throw new Error('useEventos deve ser usado dentro de um EventosProvider');
  }
  return context;
};
