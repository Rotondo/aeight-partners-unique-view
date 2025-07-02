import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { EmpresaTipoString } from "@/types/common";

interface BulkClientResult {
  nome: string;
  action: "created" | "linked" | "error" | "duplicate";
  message: string;
  clienteId?: string;
}

interface BulkOperationResult {
  results: BulkClientResult[];
  totalProcessed: number;
  totalCreated: number;
  totalLinked: number;
  totalErrors: number;
  totalDuplicates: number;
}

export const useBulkClienteOperations = (
  fetchEmpresasClientes: () => Promise<void>
) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processBulkClients = async (
    clienteNames: string[],
    parceiroId: string,
    observacoes?: string
  ): Promise<BulkOperationResult> => {
    setProcessing(true);
    setProgress(0);

    const results: BulkClientResult[] = [];
    let totalCreated = 0;
    let totalLinked = 0;
    let totalErrors = 0;
    let totalDuplicates = 0;

    try {
      // Buscar clientes existentes de uma vez
      const { data: existingClients } = await supabase
        .from("empresas")
        .select("id, nome")
        .eq("tipo", "cliente");

      // Buscar vínculos existentes para o parceiro
      const { data: existingLinks } = await supabase
        .from("empresa_clientes")
        .select("empresa_cliente_id")
        .eq("empresa_proprietaria_id", parceiroId);

      const linkedClientIds = new Set(
        existingLinks?.map((link) => link.empresa_cliente_id) || []
      );

      // Mapear clientes existentes por nome (case insensitive)
      const existingClientMap = new Map(
        existingClients?.map((client) => [
          client.nome.toLowerCase().trim(),
          client
        ]) || []
      );

      for (let i = 0; i < clienteNames.length; i++) {
        const nome = clienteNames[i].trim();
        if (!nome) continue;

        const nomeKey = nome.toLowerCase();
        const existingClient = existingClientMap.get(nomeKey);

        try {
          if (existingClient) {
            // Cliente já existe
            if (linkedClientIds.has(existingClient.id)) {
              // Já está vinculado
              results.push({
                nome,
                action: "duplicate",
                message: "Cliente já está vinculado a este parceiro"
              });
              totalDuplicates++;
            } else {
              // Apenas criar o vínculo
              const { error } = await supabase
                .from("empresa_clientes")
                .insert({
                  empresa_proprietaria_id: parceiroId,
                  empresa_cliente_id: existingClient.id,
                  status: true,
                  data_relacionamento: new Date().toISOString(),
                  observacoes
                });

              if (error) throw error;

              results.push({
                nome,
                action: "linked",
                message: "Cliente vinculado com sucesso",
                clienteId: existingClient.id
              });
              totalLinked++;
              linkedClientIds.add(existingClient.id);
            }
          } else {
            // Criar novo cliente
            const { data: newClient, error: createError } = await supabase
              .from("empresas")
              .insert({
                nome,
                tipo: "cliente" as EmpresaTipoString,
                status: true
              })
              .select("id")
              .single();

            if (createError) throw createError;

            // Criar o vínculo
            const { error: linkError } = await supabase
              .from("empresa_clientes")
              .insert({
                empresa_proprietaria_id: parceiroId,
                empresa_cliente_id: newClient.id,
                status: true,
                data_relacionamento: new Date().toISOString(),
                observacoes
              });

            if (linkError) throw linkError;

            results.push({
              nome,
              action: "created",
              message: "Cliente criado e vinculado com sucesso",
              clienteId: newClient.id
            });
            totalCreated++;
            existingClientMap.set(nomeKey, { id: newClient.id, nome });
          }
        } catch (error) {
          console.error(`Erro ao processar cliente ${nome}:`, error);
          results.push({
            nome,
            action: "error",
            message: error instanceof Error ? error.message : "Erro desconhecido"
          });
          totalErrors++;
        }

        setProgress(((i + 1) / clienteNames.length) * 100);
      }

      // Atualizar dados
      await fetchEmpresasClientes();

      toast({
        title: "Processamento concluído",
        description: `${totalCreated} criados, ${totalLinked} vinculados, ${totalDuplicates} duplicados, ${totalErrors} erros`,
      });

    } catch (error) {
      console.error("Erro no processamento em lote:", error);
      toast({
        title: "Erro",
        description: "Erro durante o processamento em lote",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }

    return {
      results,
      totalProcessed: clienteNames.length,
      totalCreated,
      totalLinked,
      totalErrors,
      totalDuplicates
    };
  };

  return {
    processBulkClients,
    processing,
    progress
  };
};