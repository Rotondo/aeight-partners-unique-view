
import { supabase } from './supabase';

export interface Atividade {
  id: string;
  oportunidade_id: string;
  titulo: string;
  descricao?: string;
  data_prevista: string;
  data_realizada?: string;
  concluida: boolean;
  usuario_responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

// Function to get activities for an opportunity
export const getAtividadesOportunidade = async (oportunidadeId: string): Promise<Atividade[]> => {
  try {
    const { data, error } = await supabase
      .from('atividades_oportunidade')
      .select('*')
      .eq('oportunidade_id', oportunidadeId)
      .order('data_prevista', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

// Function to get pending activities for an opportunity
export const getAtividadesPendentes = async (oportunidadeId: string): Promise<Atividade[]> => {
  try {
    const { data, error } = await supabase
      .from('atividades_oportunidade')
      .select('*')
      .eq('oportunidade_id', oportunidadeId)
      .eq('concluida', false)
      .order('data_prevista', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending activities:', error);
    return [];
  }
};

// Function to check if opportunity has pending activities
export const hasAtividadesPendentes = async (oportunidadeId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('atividades_oportunidade')
      .select('id')
      .eq('oportunidade_id', oportunidadeId)
      .eq('concluida', false)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking pending activities:', error);
    return false;
  }
};

// Function to create a new activity
export const createAtividade = async (atividade: Partial<Atividade>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('atividades_oportunidade')
      .insert({
        oportunidade_id: atividade.oportunidade_id,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        data_prevista: atividade.data_prevista,
        usuario_responsavel_id: atividade.usuario_responsavel_id
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// Function to update an activity
export const updateAtividade = async (id: string, updates: Partial<Atividade>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('atividades_oportunidade')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating activity:', error);
    return false;
  }
};

// Function to mark activity as completed
export const completeAtividade = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('atividades_oportunidade')
      .update({
        concluida: true,
        data_realizada: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing activity:', error);
    return false;
  }
};

// Function to delete an activity
export const deleteAtividade = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('atividades_oportunidade')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};
