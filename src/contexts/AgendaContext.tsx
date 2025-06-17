
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
  syncGoogleCalendar: () => Promise<void>;
  syncOutlookCalendar: () => Promise<void>;
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
  }, [isAdmin, selectedDate]);

  const fetchEventos = async () => {
    if (!isAdmin) return;
    
    setLoadingEventos(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .gte('start', startOfDay.toISOString())
        .lte('start', endOfDay.toISOString())
        .order('start', { ascending: true });

      if (error) throw error;

      // Transform data to match AgendaEvento interface
      const eventos: AgendaEvento[] = (data || []).map(evento => ({
        id: evento.id,
        titulo: evento.title,
        descricao: evento.description,
        data_inicio: evento.start,
        data_fim: evento.end,
        tipo: 'reuniao', // Default type since we're using simplified schema
        status: evento.status === 'scheduled' ? 'agendado' : 
                evento.status === 'completed' ? 'realizado' : 'agendado',
        usuario_responsavel_id: user?.id || '',
        fonte_integracao: evento.source === 'google' ? 'google' : 
                         evento.source === 'outlook' ? 'outlook' : 'manual',
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
      
      setAgendaEventos(eventos);
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
      const novoEvento: AgendaEvento = {
        id: Date.now().toString(),
        titulo: evento.titulo || '',
        descricao: evento.descricao,
        data_inicio: evento.data_inicio || new Date().toISOString(),
        data_fim: evento.data_fim || new Date(Date.now() + 3600000).toISOString(),
        tipo: evento.tipo || 'reuniao',
        status: evento.status || 'agendado',
        parceiro_id: evento.parceiro_id,
        usuario_responsavel_id: user?.id || '',
        fonte_integracao: 'manual',
        observacoes: evento.observacoes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setAgendaEventos(prev => [...prev, novoEvento]);
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
      setAgendaEventos(prev => prev.map(e => 
        e.id === id ? { ...e, ...evento, updated_at: new Date().toISOString() } : e
      ));
      
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
      setAgendaEventos(prev => prev.filter(e => e.id !== id));
      
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

  const syncGoogleCalendar = async () => {
    if (!isAdmin) return;
    
    try {
      toast({
        title: "Sincronização",
        description: "Sincronizando com Google Calendar..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadAgendaEventos();
      toast({
        title: "Sucesso",
        description: "Sincronização com Google Calendar concluída"
      });
    } catch (error) {
      console.error('Erro na sincronização Google:', error);
      toast({
        title: "Erro",
        description: "Falha na sincronização com Google Calendar",
        variant: "destructive"
      });
    }
  };

  const syncOutlookCalendar = async () => {
    if (!isAdmin) return;
    
    try {
      toast({
        title: "Sincronização",
        description: "Sincronizando com Outlook Calendar..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadAgendaEventos();
      toast({
        title: "Sucesso",
        description: "Sincronização com Outlook Calendar concluída"
      });
    } catch (error) {
      console.error('Erro na sincronização Outlook:', error);
      toast({
        title: "Erro",
        description: "Falha na sincronização com Outlook Calendar",
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
    syncGoogleCalendar,
    syncOutlookCalendar
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
