
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import type { Evento, ContatoEvento, EventoWithContatos } from '@/types/eventos';

interface EventosContextType {
  eventos: EventoWithContatos[];
  eventoAtivo: EventoWithContatos | null;
  loading: boolean;
  error: string | null;
  createEvento: (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at' | 'usuario_responsavel_id'>) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const refreshEventos = async () => {
    if (!user) {
      logger.warn('EVENTOS', 'Tentativa de carregar eventos sem usuário autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      logger.eventLog('Carregando eventos');
      
      // Buscar eventos com query otimizada
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          id,
          nome,
          data_inicio,
          data_fim,
          local,
          descricao,
          status,
          usuario_responsavel_id,
          created_at,
          updated_at
        `)
        .order('data_inicio', { ascending: false });

      if (eventosError) {
        logger.error('EVENTOS', 'Erro ao carregar eventos', eventosError);
        throw eventosError;
      }

      logger.eventLog('Eventos carregados', undefined, { count: eventosData?.length || 0 });

      // Buscar contatos para cada evento em uma única query
      const eventIds = eventosData?.map(e => e.id) || [];
      const { data: todosContatos, error: contatosError } = await supabase
        .from('contatos_evento')
        .select('*')
        .in('evento_id', eventIds)
        .order('data_contato', { ascending: false });

      if (contatosError) {
        logger.error('CONTATOS', 'Erro ao carregar contatos', contatosError);
        throw contatosError;
      }

      logger.contactLog('Contatos carregados', undefined, { count: todosContatos?.length || 0 });

      // Organizar contatos por evento
      const contatosPorEvento = new Map<string, ContatoEvento[]>();
      todosContatos?.forEach(contato => {
        const eventId = contato.evento_id;
        if (!contatosPorEvento.has(eventId)) {
          contatosPorEvento.set(eventId, []);
        }
        contatosPorEvento.get(eventId)!.push(contato);
      });

      // Combinar eventos com contatos
      const eventosComContatos: EventoWithContatos[] = (eventosData || []).map(evento => ({
        ...evento,
        status: evento.status as 'planejado' | 'em_andamento' | 'finalizado' | 'cancelado',
        contatos: contatosPorEvento.get(evento.id) || [],
        total_contatos: contatosPorEvento.get(evento.id)?.length || 0
      }));

      setEventos(eventosComContatos);
      logger.eventLog('Eventos processados com sucesso', undefined, { 
        eventos: eventosComContatos.length,
        totalContatos: todosContatos?.length || 0 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('EVENTOS', 'Erro ao carregar eventos', error as Error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at' | 'usuario_responsavel_id'>) => {
    if (!user) {
      logger.warn('EVENTOS', 'Tentativa de criar evento sem usuário autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      logger.eventLog('Criando novo evento', undefined, { nome: evento.nome });

      const { data, error } = await supabase
        .from('eventos')
        .insert({
          nome: evento.nome,
          data_inicio: evento.data_inicio,
          data_fim: evento.data_fim,
          local: evento.local,
          descricao: evento.descricao,
          usuario_responsavel_id: user.id,
          status: evento.status || 'planejado'
        })
        .select()
        .single();

      if (error) {
        logger.error('EVENTOS', 'Erro ao criar evento', error);
        throw error;
      }

      logger.eventLog('Evento criado com sucesso', data.id);
      await refreshEventos();
    } catch (error) {
      logger.error('EVENTOS', 'Falha ao criar evento', error as Error);
      throw error;
    }
  };

  const updateEvento = async (id: string, evento: Partial<Evento>) => {
    try {
      logger.eventLog('Atualizando evento', id);

      const { error } = await supabase
        .from('eventos')
        .update(evento)
        .eq('id', id);

      if (error) {
        logger.error('EVENTOS', 'Erro ao atualizar evento', error, { id });
        throw error;
      }

      logger.eventLog('Evento atualizado com sucesso', id);
      await refreshEventos();
    } catch (error) {
      logger.error('EVENTOS', 'Falha ao atualizar evento', error as Error);
      throw error;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      logger.eventLog('Deletando evento', id);

      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('EVENTOS', 'Erro ao deletar evento', error, { id });
        throw error;
      }

      logger.eventLog('Evento deletado com sucesso', id);
      await refreshEventos();
    } catch (error) {
      logger.error('EVENTOS', 'Falha ao deletar evento', error as Error);
      throw error;
    }
  };

  const addContato = async (contato: Partial<ContatoEvento>) => {
    if (!eventoAtivo) {
      logger.warn('CONTATOS', 'Tentativa de adicionar contato sem evento ativo');
      return;
    }

    try {
      logger.contactLog('Adicionando novo contato');

      const { error } = await supabase
        .from('contatos_evento')
        .insert({
          ...contato,
          evento_id: eventoAtivo.id
        });

      if (error) {
        logger.error('CONTATOS', 'Erro ao adicionar contato', error);
        throw error;
      }

      logger.contactLog('Contato adicionado com sucesso');
      await refreshEventos();
    } catch (error) {
      logger.error('CONTATOS', 'Falha ao adicionar contato', error as Error);
      throw error;
    }
  };

  const updateContato = async (id: string, contato: Partial<ContatoEvento>) => {
    try {
      logger.contactLog('Atualizando contato', id);

      const { error } = await supabase
        .from('contatos_evento')
        .update(contato)
        .eq('id', id);

      if (error) {
        logger.error('CONTATOS', 'Erro ao atualizar contato', error, { id });
        throw error;
      }

      logger.contactLog('Contato atualizado com sucesso', id);
      await refreshEventos();
    } catch (error) {
      logger.error('CONTATOS', 'Falha ao atualizar contato', error as Error);
      throw error;
    }
  };

  const deleteContato = async (id: string) => {
    try {
      logger.contactLog('Deletando contato', id);

      const { error } = await supabase
        .from('contatos_evento')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('CONTATOS', 'Erro ao deletar contato', error, { id });
        throw error;
      }

      logger.contactLog('Contato deletado com sucesso', id);
      await refreshEventos();
    } catch (error) {
      logger.error('CONTATOS', 'Falha ao deletar contato', error as Error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      logger.authLog('Usuário autenticado, carregando eventos', user.id);
      refreshEventos();
    } else {
      logger.authLog('Usuário não autenticado, limpando dados');
      setEventos([]);
      setEventoAtivo(null);
      setLoading(false);
    }
  }, [user]);

  const value: EventosContextType = {
    eventos,
    eventoAtivo,
    loading,
    error,
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
