
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ClienteSobreposto {
  cliente_nome: string;
  cliente_id: string;
  parceiros: {
    id: string;
    nome: string;
    tipo: string;
  }[];
  total_parceiros: number;
}

export const useClientesSobrepostos = () => {
  const [clientesSobrepostos, setClientesSobrepostos] = useState<ClienteSobreposto[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimaAnalise, setUltimaAnalise] = useState<Date | null>(null);

  const detectarClientesSobrepostos = async () => {
    setLoading(true);
    try {
      const { data: relacionamentos, error } = await supabase
        .from("empresa_clientes")
        .select(`
          empresa_cliente_id,
          empresa_proprietaria_id,
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(nome),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(nome, tipo)
        `)
        .eq("status", true);

      if (error) throw error;

      // Agrupar por cliente
      const clientesMap = new Map<string, {
        nome: string;
        parceiros: Set<string>;
        parceirosInfo: any[];
      }>();

      relacionamentos?.forEach((rel) => {
        const clienteId = rel.empresa_cliente_id;
        const clienteNome = rel.empresa_cliente?.nome || 'Cliente sem nome';
        const parceiroId = rel.empresa_proprietaria_id;
        const parceiroInfo = {
          id: parceiroId,
          nome: rel.empresa_proprietaria?.nome || 'Parceiro sem nome',
          tipo: rel.empresa_proprietaria?.tipo || 'indefinido'
        };

        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            nome: clienteNome,
            parceiros: new Set(),
            parceirosInfo: []
          });
        }

        const cliente = clientesMap.get(clienteId)!;
        if (!cliente.parceiros.has(parceiroId)) {
          cliente.parceiros.add(parceiroId);
          cliente.parceirosInfo.push(parceiroInfo);
        }
      });

      // Filtrar apenas clientes com sobreposição (>1 parceiro)
      const sobrepostos = Array.from(clientesMap.entries())
        .filter(([_, cliente]) => cliente.parceiros.size > 1)
        .map(([clienteId, cliente]) => ({
          cliente_nome: cliente.nome,
          cliente_id: clienteId,
          parceiros: cliente.parceirosInfo,
          total_parceiros: cliente.parceiros.size
        }))
        .sort((a, b) => b.total_parceiros - a.total_parceiros);

      setClientesSobrepostos(sobrepostos);
      setUltimaAnalise(new Date());

      if (sobrepostos.length > 0) {
        toast({
          title: "Análise Concluída",
          description: `${sobrepostos.length} clientes compartilhados identificados`,
        });
      }

    } catch (error) {
      console.error("Erro ao detectar clientes sobrepostos:", error);
      toast({
        title: "Erro",
        description: "Erro ao analisar clientes sobrepostos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getClientesMaisCompartilhados = (limite: number = 5) => {
    return clientesSobrepostos
      .slice(0, limite)
      .map(cliente => ({
        nome: cliente.cliente_nome,
        total: cliente.total_parceiros,
        parceiros: cliente.parceiros.map(p => p.nome)
      }));
  };

  const getParceirosComMaisSobreposicoes = () => {
    const parceiroContador = new Map<string, number>();
    
    clientesSobrepostos.forEach(cliente => {
      cliente.parceiros.forEach(parceiro => {
        parceiroContador.set(
          parceiro.nome, 
          (parceiroContador.get(parceiro.nome) || 0) + 1
        );
      });
    });

    return Array.from(parceiroContador.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nome, total]) => ({ nome, total }));
  };

  useEffect(() => {
    detectarClientesSobrepostos();
  }, []);

  return {
    clientesSobrepostos,
    loading,
    ultimaAnalise,
    detectarClientesSobrepostos,
    getClientesMaisCompartilhados,
    getParceirosComMaisSobreposicoes,
    totalSobrepostos: clientesSobrepostos.length
  };
};
