
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

export const EventosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      const eventosComContatos: EventoWithContatos[] = [];
      
      for (const evento of eventosData || []) {
        const { data: contatosData, error: contatosError } = await supabase
          .from('contatos_evento')
          .select('*')
          .eq('evento_id', evento.id)
          .order('data_contato', { ascending: false });

        if (contatosError) throw contatosError;

        eventosComContatos.push({
          ...evento,
          status: evento.status as 'planejado' | 'em_andamento' | 'finalizado' | 'cancelado',
          contatos: contatosData || [],
          total_contatos: contatosData?.length || 0
        });
      }

      setEventos(eventosComContatos);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (evento: Partial<Evento>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('eventos')
      .insert({
        ...evento,
        usuario_responsavel_id: user.id,
        status: evento.status || 'planejado'
      })
      .select()
      .single();

    if (error) throw error;
    
    await refreshEventos();
  };

  const updateEvento = async (id: string, evento: Partial<Evento>) => {
    const { error } = await supabase
      .from('eventos')
      .update(evento)
      .eq('id', id);

    if (error) throw error;
    
    await refreshEventos();
  };

  const deleteEvento = async (id: string) => {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await refreshEventos();
  };

  const addContato = async (contato: Partial<ContatoEvento>) => {
    if (!eventoAtivo) return;

    const { error } = await supabase
      .from('contatos_evento')
      .insert({
        ...contato,
        evento_id: eventoAtivo.id
      });

    if (error) throw error;
    
    await refreshEventos();
  };

  const updateContato = async (id: string, contato: Partial<ContatoEvento>) => {
    const { error } = await supabase
      .from('contatos_evento')
      .update(contato)
      .eq('id', id);

    if (error) throw error;
    
    await refreshEventos();
  };

  const deleteContato = async (id: string) => {
    const { error } = await supabase
      .from('contatos_evento')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await refreshEventos();
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
  if (!context) {
    throw new Error('useEventos deve ser usado dentro de um EventosProvider');
  }
  return context;
};
