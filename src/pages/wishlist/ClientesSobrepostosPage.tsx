
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/lib/supabase";
import { Search, Users, Building2, AlertCircle, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClienteSobreposto {
  cliente_nome: string;
  cliente_id: string;
  parceiros: {
    id: string;
    nome: string;
    tipo: string;
    data_relacionamento: string;
  }[];
  total_parceiros: number;
  potencial_networking: 'alto' | 'medio' | 'baixo';
}

interface EstatisticasSobreposicao {
  totalClientesCompartilhados: number;
  totalClientesUnicos: number;
  parceiroComMaisCompartilhamentos: string;
  mediaCompartilhamentosPorCliente: number;
}

const ClientesSobrepostosPage: React.FC = () => {
  const { empresasClientes, loading } = useWishlist();
  const [clientesSobrepostos, setClientesSobrepostos] = useState<ClienteSobreposto[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasSobreposicao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [loadingAnalise, setLoadingAnalise] = useState(false);

  const calcularPotencialNetworking = (totalParceiros: number): 'alto' | 'medio' | 'baixo' => {
    if (totalParceiros >= 4) return 'alto';
    if (totalParceiros >= 2) return 'medio';
    return 'baixo';
  };

  const analisarClientesSobrepostos = async () => {
    setLoadingAnalise(true);
    try {
      // Buscar todos os relacionamentos com informações das empresas
      const { data: relacionamentos, error } = await supabase
        .from("empresa_clientes")
        .select(`
          *,
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(*),
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(*)
        `)
        .eq("status", true);

      if (error) throw error;

      // Agrupar clientes por ID e contar quantos parceiros os atendem
      const clientesMap = new Map<string, {
        nome: string;
        parceiros: any[];
      }>();

      relacionamentos?.forEach((rel) => {
        const clienteId = rel.empresa_cliente_id;
        const clienteNome = rel.empresa_cliente?.nome || 'Cliente sem nome';
        
        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            nome: clienteNome,
            parceiros: []
          });
        }

        clientesMap.get(clienteId)?.parceiros.push({
          id: rel.empresa_proprietaria_id,
          nome: rel.empresa_proprietaria?.nome || 'Parceiro sem nome',
          tipo: rel.empresa_proprietaria?.tipo || 'indefinido',
          data_relacionamento: rel.data_relacionamento
        });
      });

      // Filtrar apenas clientes com mais de 1 parceiro (sobrepostos)
      const sobrepostos: ClienteSobreposto[] = Array.from(clientesMap.entries())
        .filter(([_, cliente]) => cliente.parceiros.length > 1)
        .map(([clienteId, cliente]) => ({
          cliente_nome: cliente.nome,
          cliente_id: clienteId,
          parceiros: cliente.parceiros,
          total_parceiros: cliente.parceiros.length,
          potencial_networking: calcularPotencialNetworking(cliente.parceiros.length)
        }))
        .sort((a, b) => b.total_parceiros - a.total_parceiros);

      setClientesSobrepostos(sobrepostos);

      // Calcular estatísticas
      const totalUnicos = clientesMap.size;
      const totalCompartilhados = sobrepostos.length;
      
      const parceiroContador = new Map<string, number>();
      sobrepostos.forEach(cliente => {
        cliente.parceiros.forEach(parceiro => {
          parceiroContador.set(parceiro.nome, (parceiroContador.get(parceiro.nome) || 0) + 1);
        });
      });

      const parceiroComMais = Array.from(parceiroContador.entries())
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      const mediaCompartilhamentos = sobrepostos.length > 0 
        ? sobrepostos.reduce((acc, cliente) => acc + cliente.total_parceiros, 0) / sobrepostos.length 
        : 0;

      setEstatisticas({
        totalClientesCompartilhados: totalCompartilhados,
        totalClientesUnicos: totalUnicos,
        parceiroComMaisCompartilhamentos: parceiroComMais,
        mediaCompartilhamentosPorCliente: Math.round(mediaCompartilhamentos * 100) / 100
      });

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
  }, [empresasClientes]);

  const clientesFiltrados = clientesSobrepostos.filter(cliente => {
    const matchSearch = cliente.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cliente.parceiros.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchTipo = filtroTipo === "todos" || 
                     cliente.parceiros.some(p => p.tipo === filtroTipo);
    
    return matchSearch && matchTipo;
  });

  const getPotencialColor = (potencial: string) => {
    switch (potencial) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixo': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading || loadingAnalise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analisando clientes sobrepostos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Dashboard de Clientes Sobrepostos
          </h1>
          <p className="text-muted-foreground text-sm">
            Identifique oportunidades de networking através de clientes compartilhados
          </p>
        </div>
        <Button onClick={analisarClientesSobrepostos} disabled={loadingAnalise}>
          <Eye className="mr-2 h-4 w-4" />
          Reanalisar
        </Button>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Compartilhados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalClientesCompartilhados}</div>
              <p className="text-xs text-muted-foreground">
                de {estadisticas?.totalClientesUnicos} únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parceiro Líder</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {estatisticas.parceiroComMaisCompartilhamentos}
              </div>
              <p className="text-xs text-muted-foreground">
                Mais compartilhamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Parceiros</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.mediaCompartilhamentosPorCliente}</div>
              <p className="text-xs text-muted-foreground">
                Por cliente compartilhado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sobreposição</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estatisticas.totalClientesUnicos > 0 
                  ? Math.round((estatisticas.totalClientesCompartilhados / estatisticas.totalClientesUnicos) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Clientes com múltiplos parceiros
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
          <option value="parceiro">Parceiros</option>
          <option value="intragrupo">Intragrupo</option>
          <option value="cliente">Clientes</option>
        </select>
      </div>

      {/* Tabela de Clientes Sobrepostos */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Compartilhados</CardTitle>
          <CardDescription>
            Lista de clientes atendidos por múltiplos parceiros - oportunidades de networking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Parceiros</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Potencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.cliente_id}>
                    <TableCell className="font-medium">
                      {cliente.cliente_nome}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cliente.parceiros.map((parceiro, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {parceiro.nome}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cliente.total_parceiros} parceiros
                      </Badge>
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
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente sobreposto encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filtroTipo !== "todos" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Cadastre mais relacionamentos entre empresas e clientes para identificar sobreposições"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesSobrepostosPage;
