
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { AgendaEvento } from '@/types/diario';

interface AgendaContextType {
  // Estados
  agendaEventos: AgendaEvento[];
  loadingEventos: boolean;
  selectedDate: Date;
  
  // Ações
  setSelectedDate: (date: Date) => void;
  fetchEventos: () => Promise<void>;
  createEvento: (evento: Partial<AgendaEvento>) => Promise<void>;
  updateEvento: (id: string, evento: Partial<AgendaEvento>) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  createEventoFromCrmAction: (crmActionId: string, title: string, date: Date) => Promise<void>;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

interface AgendaProviderProps {
  children: ReactNode;
}

export const AgendaProvider: React.FC<AgendaProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [agendaEventos, setAgendaEventos] = useState<AgendaEvento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isAdmin = user?.papel === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchEventos();
    }
  }, [isAdmin]);

  const fetchEventos = async () => {
    if (!isAdmin) return;
    
    setLoadingEventos(true);
    try {
      // Fetch manual events
      const { data: manualEvents, error: manualError } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .order('start', { ascending: true });

      if (manualError) throw manualError;

      // Fetch CRM actions with next step dates to create agenda events
      const { data: crmActions, error: crmError } = await supabase
        .from('diario_crm_acoes')
        .select('*')
        .not('next_step_date', 'is', null)
        .order('next_step_date', { ascending: true });

      if (crmError) throw crmError;

      // Transform manual events
      const transformedManualEvents: AgendaEvento[] = (manualEvents || []).map(evento => ({
        id: evento.id,
        titulo: evento.title,
        descricao: evento.description,
        data_inicio: evento.start,
        data_fim: evento.end,
        tipo: 'reuniao', // Default type
        status: evento.status === 'scheduled' ? 'agendado' : 
                evento.status === 'completed' ? 'realizado' : 'agendado',
        usuario_responsavel_id: user?.id || '',
        fonte_integracao: 'manual',
        event_type: evento.event_type || 'manual',
        related_crm_action_id: evento.related_crm_action_id,
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));

      // Transform CRM actions into agenda events
      const crmAgendaEvents: AgendaEvento[] = (crmActions || []).map(action => ({
        id: `crm_${action.id}`,
        titulo: `Próximo passo: ${action.description}`,
        descricao: action.next_steps,
        data_inicio: action.next_step_date!,
        data_fim: new Date(new Date(action.next_step_date!).getTime() + 3600000).toISOString(), // 1 hour later
        tipo: 'proximo_passo_crm',
        status: 'agendado',
        parceiro_id: action.partner_id,
        usuario_responsavel_id: action.user_id,
        fonte_integracao: 'crm_integration',
        event_type: 'crm_next_step',
        related_crm_action_id: action.id,
        created_at: action.created_at,
        updated_at: action.created_at
      }));

      // Combine all events
      const allEvents = [...transformedManualEvents, ...crmAgendaEvents];
      setAgendaEventos(allEvents);
      
    } catch (error) {
      console.error('Erro ao carregar eventos da agenda:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar eventos da agenda",
        variant: "destructive"
      });
    } finally {
      setLoadingEventos(false);
    }
  };

  const createEvento = async (evento: Partial<AgendaEvento>) => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .insert({
          title: evento.titulo || '',
          description: evento.descricao,
          start: evento.data_inicio || new Date().toISOString(),
          end: evento.data_fim || new Date(Date.now() + 3600000).toISOString(),
          source: 'manual',
          status: 'scheduled',
          event_type: 'manual',
          partner_id: evento.parceiro_id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEventos(); // Refresh the list
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso"
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

  const updateEvento = async (id: string, evento: Partial<AgendaEvento>) => {
    if (!isAdmin) return;
    
    try {
      // Only update manual events, not CRM-generated ones
      if (id.startsWith('crm_')) {
        toast({
          title: "Aviso",
          description: "Eventos de próximos passos do CRM devem ser editados no módulo CRM",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('diario_agenda_eventos')
        .update({
          title: evento.titulo,
          description: evento.descricao,
          start: evento.data_inicio,
          end: evento.data_fim,
          status: evento.status === 'realizado' ? 'completed' : 'scheduled'
        })
        .eq('id', id);

      if (error) throw error;

      await fetchEventos(); // Refresh the list
      
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso"
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
    if (!isAdmin) return;
    
    try {
      // Only delete manual events, not CRM-generated ones
      if (id.startsWith('crm_')) {
        toast({
          title: "Aviso",
          description: "Eventos de próximos passos do CRM devem ser gerenciados no módulo CRM",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('diario_agenda_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEventos(); // Refresh the list
      
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso"
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

  const createEventoFromCrmAction = async (crmActionId: string, title: string, date: Date) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .insert({
          title,
          start: date.toISOString(),
          end: new Date(date.getTime() + 3600000).toISOString(), // 1 hour later
          source: 'crm_integration',
          status: 'scheduled',
          event_type: 'crm_related',
          related_crm_action_id: crmActionId
        });

      if (error) throw error;

      await fetchEventos();
      
      toast({
        title: "Sucesso",
        description: "Evento criado a partir da ação do CRM"
      });
    } catch (error) {
      console.error('Erro ao criar evento do CRM:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar evento",
        variant: "destructive"
      });
    }
  };

  const value: AgendaContextType = {
    agendaEventos,
    loadingEventos,
    selectedDate,
    setSelectedDate,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    createEventoFromCrmAction
  };

  return (
    <AgendaContext.Provider value={value}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error('useAgenda deve ser usado dentro de um AgendaProvider');
  }
  return context;
};
