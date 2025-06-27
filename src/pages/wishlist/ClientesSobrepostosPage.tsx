import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/lib/supabase";
import { Search, Users, Eye, ChevronLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";

interface ClienteSobreposto {
  cliente_nome: string;
  cliente_id: string;
  parceirosIntragrupo: {
    id: string;
    nome: string;
    tipo: string;
    data_relacionamento: string;
  }[];
  parceirosExternos: {
    id: string;
    nome: string;
    tipo: string;
    data_relacionamento: string;
  }[];
  total_parceiros: number;
  potencial_networking: "alto" | "medio" | "baixo";
}

const ClientesSobrepostosPage: React.FC = () => {
  const { empresasClientes, loading } = useWishlist();
  const [clientesSobrepostos, setClientesSobrepostos] = useState<ClienteSobreposto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [loadingAnalise, setLoadingAnalise] = useState(false);
  const navigate = useNavigate();

  // Potencial em função da quantidade de parceiros
  const calcularPotencialNetworking = (totalParceiros: number): "alto" | "medio" | "baixo" => {
    if (totalParceiros >= 4) return "alto";
    if (totalParceiros >= 2) return "medio";
    return "baixo";
  };

  // Função para analisar clientes sobrepostos e separar parceiros intragrupo/externos
  const analisarClientesSobrepostos = async () => {
    setLoadingAnalise(true);
    try {
      // Buscar todos os relacionamentos com informações das empresas
      const { data: relacionamentos, error } = await supabase
        .from("empresa_clientes")
        .select(
          `
          *,
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(*),
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(*)
        `
        )
        .eq("status", true);

      if (error) throw error;

      // Agrupar clientes por ID e contar quantos parceiros os atendem
      const clientesMap = new Map<
        string,
        {
          nome: string;
          parceirosIntragrupo: any[];
          parceirosExternos: any[];
          total_parceiros: number;
        }
      >();

      relacionamentos?.forEach((rel) => {
        const clienteId = rel.empresa_cliente_id;
        const clienteNome = rel.empresa_cliente?.nome || "Cliente sem nome";
        const parceiro = {
          id: rel.empresa_proprietaria_id,
          nome: rel.empresa_proprietaria?.nome || "Parceiro sem nome",
          tipo: rel.empresa_proprietaria?.tipo || "indefinido",
          data_relacionamento: rel.data_relacionamento,
        };

        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            nome: clienteNome,
            parceirosIntragrupo: [],
            parceirosExternos: [],
            total_parceiros: 0,
          });
        }

        const clienteData = clientesMap.get(clienteId)!;
        if (parceiro.tipo === "intragrupo") {
          clienteData.parceirosIntragrupo.push(parceiro);
        } else {
          clienteData.parceirosExternos.push(parceiro);
        }
        clienteData.total_parceiros += 1;
      });

      // Filtrar apenas clientes com mais de 1 parceiro (sobrepostos)
      const sobrepostos: ClienteSobreposto[] = Array.from(clientesMap.entries())
        .filter(([_, cliente]) => cliente.total_parceiros > 1)
        .map(([clienteId, cliente]) => ({
          cliente_nome: cliente.nome,
          cliente_id: clienteId,
          parceirosIntragrupo: cliente.parceirosIntragrupo,
          parceirosExternos: cliente.parceirosExternos,
          total_parceiros: cliente.total_parceiros,
          potencial_networking: calcularPotencialNetworking(cliente.total_parceiros),
        }))
        .sort((a, b) => b.total_parceiros - a.total_parceiros);

      setClientesSobrepostos(sobrepostos);
    } catch (error) {
      console.error("Erro ao analisar clientes sobrepostos:", error);
    } finally {
      setLoadingAnalise(false);
    }
  };

  useEffect(() => {
    if (empresasClientes.length > 0) {
      analisarClientesSobrepostos();
    }
    // eslint-disable-next-line
  }, [empresasClientes]);

  const clientesFiltrados = clientesSobrepostos.filter((cliente) => {
    const matchSearch =
      cliente.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.parceirosIntragrupo.some((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cliente.parceirosExternos.some((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchTipo = true;
    if (filtroTipo !== "todos") {
      if (filtroTipo === "intragrupo") {
        matchTipo = cliente.parceirosIntragrupo.length > 0;
      } else {
        matchTipo = cliente.parceirosExternos.some((p) => p.tipo === filtroTipo);
      }
    }

    return matchSearch && matchTipo;
  });

  const getPotencialColor = (potencial: string) => {
    switch (potencial) {
      case "alto":
        return "bg-red-100 text-red-800 border-red-300";
      case "medio":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "baixo":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading || loadingAnalise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analisando clientes compartilhados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/wishlist")} className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              Dashboard de Clientes Compartilhados
            </h1>
            <p className="text-muted-foreground text-sm">
              Abaixo estão listados todos os clientes que são atendidos por mais de um parceiro (compartilhados). 
              Use os filtros para refinar a análise.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Button onClick={analisarClientesSobrepostos} disabled={loadingAnalise}>
            <Eye className="mr-2 h-4 w-4" />
            Reanalisar
          </Button>
        </div>
      </div>

      {/* Card único de estatística */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Compartilhados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesSobrepostos.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes listados abaixo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente ou parceiro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="todos">Todos os tipos</option>
          <option value="parceiro">Parceiros Externos</option>
          <option value="intragrupo">Intragrupo</option>
          <option value="cliente">Clientes</option>
        </select>
      </div>

      {/* Tabela de Clientes Compartilhados */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Compartilhados</CardTitle>
          <CardDescription>
            Lista de clientes atendidos por múltiplos parceiros. Parceiros intragrupo e externos são listados separadamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Parceiros Intragrupo</TableHead>
                  <TableHead>Parceiros Externos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Potencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.cliente_id}>
                    <TableCell className="font-medium">
                      <PrivateData type="company">
                        {cliente.cliente_nome}
                      </PrivateData>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cliente.parceirosIntragrupo.length === 0
                          ? <span className="text-xs text-muted-foreground">—</span>
                          : cliente.parceirosIntragrupo.map((parceiro, idx) => (
                              <Badge key={parceiro.id + idx} variant="secondary" className="text-xs">
                                <PrivateData type="company">
                                  {parceiro.nome}
                                </PrivateData>
                              </Badge>
                            ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cliente.parceirosExternos.length === 0
                          ? <span className="text-xs text-muted-foreground">—</span>
                          : cliente.parceirosExternos.map((parceiro, idx) => (
                              <Badge key={parceiro.id + idx} variant="outline" className="text-xs">
                                <PrivateData type="company">
                                  {parceiro.nome}
                                </PrivateData>
                              </Badge>
                            ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente.total_parceiros} parceiros</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPotencialColor(cliente.potencial_networking)}>
                        {cliente.potencial_networking.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente compartilhado encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filtroTipo !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Cadastre mais relacionamentos entre empresas e clientes para identificar compartilhamentos"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesSobrepostosPage;
