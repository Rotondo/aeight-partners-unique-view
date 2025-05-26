import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Oportunidade, StatusOportunidade, OportunidadesFilterParams, Usuario } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface OportunidadesContextType {
  oportunidades: Oportunidade[];
  filteredOportunidades: Oportunidade[];
  isLoading: boolean;
  error: string | null;
  filterParams: OportunidadesFilterParams;
  setFilterParams: (params: OportunidadesFilterParams) => void;
  fetchOportunidades: () => Promise<void>;
  createOportunidade: (oportunidade: Partial<Oportunidade>) => Promise<string | null>;
  updateOportunidade: (id: string, oportunidade: Partial<Oportunidade>) => Promise<boolean>;
  deleteOportunidade: (id: string) => Promise<boolean>;
  getOportunidade: (id: string) => Oportunidade | undefined;
}

const OportunidadesContext = createContext<OportunidadesContextType | undefined>(undefined);

// Validação de UUID v4
function isValidUUID(uuid: string | undefined | null): boolean {
  if (!uuid) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export const OportunidadesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [filteredOportunidades, setFilteredOportunidades] = useState<Oportunidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<OportunidadesFilterParams>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchOportunidades = async () => {
    if (!user) {
      setOportunidades([]);
      setFilteredOportunidades([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('oportunidades')
        .select(`
          id,
          empresa_origem_id,
          empresa_destino_id,
          contato_id,
          valor,
          status,
          data_indicacao,
          data_fechamento,
          motivo_perda,
          usuario_envio_id,
          usuario_recebe_id,
          observacoes,
          created_at,
          nome_lead,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo, status, descricao),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo, status, descricao),
          contato:contatos(id, nome, email, telefone),
          usuario_envio:usuarios!usuario_envio_id(id, nome, email, papel, ativo, empresa_id),
          usuario_recebe:usuarios!usuario_recebe_id(id, nome, email, papel, ativo, empresa_id)
        `)
        .order('data_indicacao', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const processedData: Oportunidade[] = data.map(item => ({
          id: item.id,
          empresa_origem_id: item.empresa_origem_id,
          empresa_destino_id: item.empresa_destino_id,
          contato_id: item.contato_id,
          valor: item.valor,
          status: item.status as StatusOportunidade,
          data_indicacao: item.data_indicacao,
          data_fechamento: item.data_fechamento,
          motivo_perda: item.motivo_perda,
          usuario_envio_id: item.usuario_envio_id,
          usuario_recebe_id: item.usuario_recebe_id,
          observacoes: item.observacoes,
          nome_lead: item.nome_lead,
          created_at: item.created_at,
          tipo_relacao: item.empresa_origem?.tipo === "intragrupo" && item.empresa_destino?.tipo === "intragrupo" ? "intra" : "extra",
          isRemetente: item.usuario_envio_id === user?.id,
          isDestinatario: item.usuario_recebe_id === user?.id,
          tipo_natureza: item.empresa_origem?.tipo === "intragrupo" && item.empresa_destino?.tipo === "intragrupo" ? "intragrupo" : "extragrupo",
          empresa_origem: item.empresa_origem
            ? {
                id: item.empresa_origem.id,
                nome: item.empresa_origem.nome,
                tipo: item.empresa_origem.tipo as "intragrupo" | "parceiro" | "cliente",
                status: item.empresa_origem.status,
                descricao: item.empresa_origem.descricao || ""
              }
            : undefined,
          empresa_destino: item.empresa_destino
            ? {
                id: item.empresa_destino.id,
                nome: item.empresa_destino.nome,
                tipo: item.empresa_destino.tipo as "intragrupo" | "parceiro" | "cliente",
                status: item.empresa_destino.status,
                descricao: item.empresa_destino.descricao || ""
              }
            : undefined,
          contato: Array.isArray(item.contato) ? item.contato[0] : item.contato,
          usuario_envio: item.usuario_envio ? {
            id: item.usuario_envio.id,
            nome: item.usuario_envio.nome,
            email: item.usuario_envio.email,
            papel: item.usuario_envio.papel,
            ativo: item.usuario_envio.ativo,
            empresa_id: item.usuario_envio.empresa_id || ''
          } : undefined,
          usuario_recebe: item.usuario_recebe ? {
            id: item.usuario_recebe.id,
            nome: item.usuario_recebe.nome,
            email: item.usuario_recebe.email,
            papel: item.usuario_recebe.papel,
            ativo: item.usuario_recebe.ativo,
            empresa_id: item.usuario_recebe.empresa_id || ''
          } : undefined
        }));

        setOportunidades(processedData);
        applyFilters(processedData, filterParams);
      }
    } catch (error) {
      console.error("Erro ao buscar oportunidades:", error);
      setError("Falha ao carregar oportunidades. Por favor, tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar as oportunidades.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: Oportunidade[], params: OportunidadesFilterParams) => {
    let filtered = [...data];

    if (params.dataInicio && params.dataFim) {
      const dataInicio = new Date(params.dataInicio);
      const dataFim = new Date(params.dataFim);
      dataFim.setHours(23, 59, 59, 999);

      filtered = filtered.filter(op => {
        const dataIndicacao = new Date(op.data_indicacao);
        return dataIndicacao >= dataInicio && dataIndicacao <= dataFim;
      });
    } else if (params.dataInicio) {
      const dataInicio = new Date(params.dataInicio);
      filtered = filtered.filter(op => new Date(op.data_indicacao) >= dataInicio);
    } else if (params.dataFim) {
      const dataFim = new Date(params.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtered = filtered.filter(op => new Date(op.data_indicacao) <= dataFim);
    }

    if (params.empresaOrigemId) {
      filtered = filtered.filter(op => op.empresa_origem_id === params.empresaOrigemId);
    }

    if (params.empresaDestinoId) {
      filtered = filtered.filter(op => op.empresa_destino_id === params.empresaDestinoId);
    }

    if (params.status) {
      filtered = filtered.filter(op => op.status === params.status);
    }

    if (params.usuarioId) {
      filtered = filtered.filter(
        op =>
          op.usuario_envio_id === params.usuarioId ||
          op.usuario_recebe_id === params.usuarioId
      );
    }

    setFilteredOportunidades(filtered);
  };

  const recordHistory = async (
    oportunidadeId: string,
    campo: string,
    valorAntigo: any,
    valorNovo: any
  ) => {
    if (!user) return;
    if (valorAntigo === valorNovo) return;
    const oldValue = valorAntigo !== null ? String(valorAntigo) : null;
    const newValue = valorNovo !== null ? String(valorNovo) : null;

    try {
      await supabase
        .from('historico_oportunidade')
        .insert({
          oportunidade_id: oportunidadeId,
          campo_alterado: campo,
          valor_antigo: oldValue,
          valor_novo: newValue,
          usuario_id: user.id
        });
    } catch (error) {
      console.error("Erro ao registrar histórico:", error);
    }
  };

  const createOportunidade = async (oportunidade: Partial<Oportunidade>): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma oportunidade.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Validação UUID dos campos obrigatórios e opcionais
      if (!oportunidade.empresa_origem_id || !oportunidade.empresa_destino_id) {
        toast({
          title: "Erro",
          description: "Empresa de origem e destino são obrigatórias.",
          variant: "destructive",
        });
        return null;
      }
      if (!isValidUUID(oportunidade.empresa_origem_id)) {
        toast({
          title: "Erro",
          description: "ID da empresa de origem é inválido.",
          variant: "destructive",
        });
        return null;
      }
      if (!isValidUUID(oportunidade.empresa_destino_id)) {
        toast({
          title: "Erro",
          description: "ID da empresa de destino é inválido.",
          variant: "destructive",
        });
        return null;
      }
      if (oportunidade.contato_id && !isValidUUID(oportunidade.contato_id)) {
        toast({
          title: "Erro",
          description: "ID do contato é inválido.",
          variant: "destructive",
        });
        return null;
      }
      if (oportunidade.usuario_recebe_id && !isValidUUID(oportunidade.usuario_recebe_id)) {
        toast({
          title: "Erro",
          description: "ID do executivo responsável é inválido.",
          variant: "destructive",
        });
        return null;
      }

      const newOportunidade = {
        empresa_origem_id: oportunidade.empresa_origem_id,
        empresa_destino_id: oportunidade.empresa_destino_id,
        contato_id: oportunidade.contato_id,
        valor: oportunidade.valor,
        status: oportunidade.status || "em_contato" as StatusOportunidade,
        data_indicacao: oportunidade.data_indicacao || new Date().toISOString(),
        data_fechamento: oportunidade.data_fechamento,
        motivo_perda: oportunidade.motivo_perda,
        usuario_envio_id: user.id,
        usuario_recebe_id: oportunidade.usuario_recebe_id,
        observacoes: oportunidade.observacoes,
        nome_lead: oportunidade.nome_lead || ""
      };

      const { data, error } = await supabase
        .from('oportunidades')
        .insert(newOportunidade)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Oportunidade criada com sucesso!"
      });

      await fetchOportunidades();
      return data.id;
    } catch (error) {
      console.error("Erro ao criar oportunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a oportunidade.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOportunidade = async (id: string, updates: Partial<Oportunidade>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para atualizar uma oportunidade.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const currentOp = oportunidades.find(op => op.id === id);
      if (!currentOp) throw new Error("Oportunidade não encontrada");

      const { error } = await supabase
        .from('oportunidades')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      for (const [key, newValue] of Object.entries(updates)) {
        const oldValue = (currentOp as any)[key];
        await recordHistory(id, key, oldValue, newValue);
      }

      toast({
        title: "Sucesso",
        description: "Oportunidade atualizada com sucesso!"
      });

      await fetchOportunidades();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar oportunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a oportunidade.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteOportunidade = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para excluir uma oportunidade.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('oportunidades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Oportunidade excluída com sucesso!"
      });

      await fetchOportunidades();
      return true;
    } catch (error) {
      console.error("Erro ao excluir oportunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a oportunidade.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getOportunidade = (id: string): Oportunidade | undefined => {
    return oportunidades.find(op => op.id === id);
  };

  useEffect(() => {
    if (oportunidades.length > 0) {
      applyFilters(oportunidades, filterParams);
    }
  }, [filterParams, oportunidades]);

  useEffect(() => {
    fetchOportunidades();
  }, [user]);

  const value = {
    oportunidades,
    filteredOportunidades,
    isLoading,
    error,
    filterParams,
    setFilterParams,
    fetchOportunidades,
    createOportunidade,
    updateOportunidade,
    deleteOportunidade,
    getOportunidade
  };

  return (
    <OportunidadesContext.Provider value={value}>
      {children}
    </OportunidadesContext.Provider>
  );
};

export const useOportunidades = () => {
  const context = useContext(OportunidadesContext);
  if (context === undefined) {
    throw new Error("useOportunidades must be used within an OportunidadesProvider");
  }
  return context;
};
