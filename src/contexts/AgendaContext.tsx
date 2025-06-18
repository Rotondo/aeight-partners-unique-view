
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgendaEvento } from '@/types/diario';

interface AgendaContextType {
  agendaEventos: AgendaEvento[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  loadingEventos: boolean;
  createEvento: (evento: Partial<AgendaEvento>) => Promise<void>;
  updateEvento: (id: string, updates: Partial<AgendaEvento>) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  refreshEventos: () => Promise<void>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};

interface AgendaProviderProps {
  children: ReactNode;
}

export const AgendaProvider: React.FC<AgendaProviderProps> = ({ children }) => {
  const [agendaEventos, setAgendaEventos] = useState<AgendaEvento[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loadingEventos, setLoadingEventos] = useState(true);

  const loadEventos = async () => {
    try {
      setLoadingEventos(true);
      
      // Carregar eventos da agenda
      const { data: eventosData, error: eventosError } = await supabase
        .from('diario_agenda_eventos')
        .select('*');

      if (eventosError) {
        console.error('Erro ao carregar eventos:', eventosError);
        return;
      }

      // Carregar ações do CRM com próximos passos
      const { data: crmData, error: crmError } = await supabase
        .from('diario_crm_acoes')
        .select('*')
        .not('next_step_date', 'is', null);

      if (crmError) {
        console.error('Erro ao carregar ações CRM:', crmError);
        return;
      }

      // Converter eventos da agenda
      const eventos: AgendaEvento[] = (eventosData || []).map(evento => ({
        id: evento.id,
        title: evento.title,
        description: evento.description,
        start: evento.start,
        end: evento.end,
        status: evento.status,
        partner_id: evento.partner_id,
        source: evento.source,
        external_id: evento.external_id,
        event_type: 'manual',
        related_crm_action_id: undefined,
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));

      // Converter próximos passos do CRM em eventos
      const eventosCrm: AgendaEvento[] = (crmData || []).map(acao => ({
        id: `crm-${acao.id}`,
        title: `Próximo Passo: ${acao.content?.substring(0, 50) || 'Ação CRM'}`,
        description: acao.content,
        start: acao.next_step_date!,
        end: acao.next_step_date!,
        status: 'scheduled' as const,
        partner_id: acao.partner_id,
        source: 'crm_integration',
        event_type: 'proximo_passo_crm',
        related_crm_action_id: acao.id,
        created_at: acao.created_at,
        updated_at: acao.created_at
      }));

      setAgendaEventos([...eventos, ...eventosCrm]);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const createEvento = async (evento: Partial<AgendaEvento>) => {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .insert([{
          title: evento.title!,
          description: evento.description,
          start: evento.start!,
          end: evento.end!,
          status: evento.status || 'scheduled',
          partner_id: evento.partner_id,
          source: evento.source || 'manual'
        }]);

      if (error) throw error;
      await loadEventos();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  };

  const updateEvento = async (id: string, updates: Partial<AgendaEvento>) => {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .update({
          title: updates.title,
          description: updates.description,
          start: updates.start,
          end: updates.end,
          status: updates.status,
          partner_id: updates.partner_id
        })
        .eq('id', id);

      if (error) throw error;
      await loadEventos();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadEventos();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  };

  const refreshEventos = async () => {
    await loadEventos();
  };

  useEffect(() => {
    loadEventos();
  }, []);

  return (
    <AgendaContext.Provider
      value={{
        agendaEventos,
        selectedDate,
        setSelectedDate,
        loadingEventos,
        createEvento,
        updateEvento,
        deleteEvento,
        refreshEventos
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};
