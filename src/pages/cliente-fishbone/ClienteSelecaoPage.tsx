import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ClienteMultiSelect, { ClienteOption, ClienteSelecionado } from "@/components/cliente-fishbone/ClienteMultiSelect";
import ClienteFormModal from "@/components/cliente-fishbone/ClienteFormModal";
import { supabase } from "@/lib/supabase";

const ClienteSelecaoPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [clientesSelecionados, setClientesSelecionados] = useState<ClienteSelecionado[]>([]);
  const [empresasIntragrupo, setEmpresasIntragrupo] = useState<{ id: string; nome: string; tipo: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carrega empresas intragrupo e clientes ativos
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Empresas intragrupo
      const { data: empresas, error: errEmp } = await supabase
        .from("empresas")
        .select("id, nome, tipo")
        .eq("tipo", "intragrupo")
        .eq("status", true)
        .order("nome");
      setEmpresasIntragrupo(empresas || []);

      // Clientes ativos + vínculo com empresa proprietária intragrupo
      const { data: rels, error: errRels } = await supabase
        .from("empresa_clientes")
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo)
        `)
        .eq("status", true);

      // Monta array do tipo ClienteOption
      const clientesArr: ClienteOption[] = (rels || [])
        .map((rel: any) =>
          rel.empresa_cliente && rel.empresa_proprietaria
            ? {
                id: rel.empresa_cliente.id,
                nome: rel.empresa_cliente.nome,
                empresa: {
                  id: rel.empresa_proprietaria.id,
                  nome: rel.empresa_proprietaria.nome,
                  tipo: rel.empresa_proprietaria.tipo,
                },
              }
            : null
        )
        .filter(Boolean);

      setClientes(clientesArr);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handler para inclusão de novo cliente
  const handleClienteCriado = (novoCliente: ClienteOption) => {
    setClientes((prev) => [...prev, novoCliente]);
    setClientesSelecionados((prev) => [
      ...prev,
      { ...novoCliente, prioridade: 3 },
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Clientes (Fishbone)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button onClick={() => setModalOpen(true)}>Adicionar Novo Cliente</Button>
          </div>
          <ClienteMultiSelect
            clientes={clientes}
            clientesSelecionados={clientesSelecionados}
            onClientesSelecionadosChange={setClientesSelecionados}
            loading={loading}
          />
        </CardContent>
      </Card>
      <ClienteFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        empresasIntragrupo={empresasIntragrupo}
        onClienteCriado={handleClienteCriado}
      />
    </div>
  );
};

export default ClienteSelecaoPage;