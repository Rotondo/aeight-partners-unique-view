import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAllActivePartners } from "@/hooks/usePartners";
import { Monitor, Download, Share2, Users, Search, Plus, ChevronLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Utilizado para seleção individual
interface ClienteSelecionado {
  id: string;
  nome: string;
  parceiro: string;
  observacoes?: string;
}

const ModoApresentacaoPage: React.FC = () => {
  const { empresasClientes, loading, addEmpresaCliente } = useWishlist();
  const { partners: allPartners, loading: loadingPartners } = useAllActivePartners();
  const navigate = useNavigate();

  // Estado para seleção dos parceiros intragrupo
  const [parceirosSelecionados, setParceirosSelecionados] = useState<string[]>([]);
  // Estado para seleção do parceiro externo
  const [parceiroExternoSelecionado, setParceiroExternoSelecionado] = useState<string>("");
  // Estado para adicionar novo cliente ao parceiro externo
  const [novoClienteNome, setNovoClienteNome] = useState<string>("");
  const [adicionandoCliente, setAdicionandoCliente] = useState(false);

  // Estado para busca global (sobre todas as tabelas)
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para seleção individual (painel lateral)
  const [clientesSelecionados, setClientesSelecionados] = useState<ClienteSelecionado[]>([]);
  // Modo visual de apresentação (borda e badge)
  const [modoApresentacao, setModoApresentacao] = useState(false);

  // Listas de empresas intragrupo e parceiras externas baseadas em TODOS os parceiros ativos
  // Não apenas aqueles que já têm clientes vinculados
  const empresasIntragrupo = allPartners
    .filter(partner => partner.tipo === "intragrupo")
    .map(partner => ({
      id: partner.id,
      nome: partner.nome,
    }));
    
  const empresasParceiras = allPartners
    .filter(partner => partner.tipo === "parceiro")
    .map(partner => ({
      id: partner.id,
      nome: partner.nome,
    }));

  // Clientes das empresas intragrupo selecionadas
  const clientesIntragrupo = empresasClientes.filter(
    (ec) =>
      parceirosSelecionados.includes(ec.empresa_proprietaria_id) &&
      ec.empresa_proprietaria?.tipo === "intragrupo" &&
      (!searchTerm ||
        ec.empresa_cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ec.empresa_proprietaria?.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Clientes do parceiro externo selecionado
  const clientesParceiroExterno = empresasClientes.filter(
    (ec) =>
      ec.empresa_proprietaria_id === parceiroExternoSelecionado &&
      ec.empresa_proprietaria?.tipo === "parceiro" &&
      (!searchTerm ||
        ec.empresa_cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ec.empresa_proprietaria?.nome?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Adicionar novo cliente ao parceiro externo
  const handleAdicionarClienteExterno = async () => {
    if (!novoClienteNome.trim() || !parceiroExternoSelecionado) return;
    setAdicionandoCliente(true);
    
    try {
      // Primeiro, criar o cliente na tabela empresas
      const { data: clienteData, error: clienteError } = await supabase
        .from('empresas')
        .insert({
          nome: novoClienteNome,
          tipo: 'cliente',
          status: true,
        })
        .select('id')
        .single();

      if (clienteError) throw clienteError;

      // Depois, criar o relacionamento empresa_clientes
      await addEmpresaCliente({
        empresa_proprietaria_id: parceiroExternoSelecionado,
        empresa_cliente_id: clienteData.id,
        data_relacionamento: new Date().toISOString(),
        status: true,
        observacoes: `Cliente adicionado via Modo Apresentação: ${novoClienteNome}`,
      });

      setNovoClienteNome("");
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAdicionandoCliente(false);
    }
  };

  // Seleção múltipla de parceiros intragrupo
  const handleToggleParceiroIntragrupo = (id: string) => {
    setParceirosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Seleção individual (painel lateral, exportação)
  const toggleClienteSelecao = (cliente: { 
    empresa_cliente_id: string, 
    empresa_cliente?: { nome: string }, 
    empresa_proprietaria?: { nome: string } 
  }) => {
    const clienteId = cliente.empresa_cliente_id;
    const isSelected = clientesSelecionados.some(c => c.id === clienteId);
    if (isSelected) {
      setClientesSelecionados(prev => prev.filter(c => c.id !== clienteId));
    } else {
      setClientesSelecionados(prev => [
        ...prev,
        {
          id: clienteId,
          nome: cliente.empresa_cliente?.nome || 'Cliente sem nome',
          parceiro: cliente.empresa_proprietaria?.nome || 'Parceiro sem nome'
        }
      ]);
    }
  };

  const exportarLista = () => {
    const csv = [
      ['Cliente', 'Parceiro', 'Observações'],
      ...clientesSelecionados.map(c => [c.nome, c.parceiro, c.observacoes || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes-selecionados-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const limparSelecoes = () => {
    setClientesSelecionados([]);
  };

  if (loading || loadingPartners) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando modo apresentação...</p>
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
              Modo Apresentação - Wishlist
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Button
            variant={modoApresentacao ? "default" : "outline"}
            onClick={() => setModoApresentacao(!modoApresentacao)}
          >
            <Monitor className="mr-2 h-4 w-4" />
            {modoApresentacao ? "Sair do Modo" : "Modo Apresentação"}
          </Button>
        </div>
      </div>

      {/* Filtros globais */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente ou parceiro em todas as listas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Badge variant="secondary" className="px-3 py-1">
          {clientesSelecionados.length} selecionados
        </Badge>
        {clientesSelecionados.length > 0 && (
          <Button variant="outline" size="sm" onClick={limparSelecoes}>
            Limpar
          </Button>
        )}
      </div>

      {/* Seletor de parceiros */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione os parceiros para apresentação</CardTitle>
          <CardDescription>
            Escolha um ou mais parceiros intragrupo e um parceiro externo para visualizar e comparar as carteiras. 
            Todos os parceiros ativos são exibidos, mesmo aqueles sem clientes cadastrados ainda.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div>
            <div className="mb-2 font-medium">Parceiros Intragrupo</div>
            <div className="flex flex-wrap gap-2">
              {empresasIntragrupo.map((parc) => (
                <Button
                  key={parc.id}
                  variant={parceirosSelecionados.includes(parc.id) ? "default" : "outline"}
                  onClick={() => handleToggleParceiroIntragrupo(parc.id)}
                  size="sm"
                >
                  {parc.nome}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 font-medium">Parceiro Externo</div>
            <select
              value={parceiroExternoSelecionado}
              onChange={(e) => setParceiroExternoSelecionado(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Selecione o parceiro</option>
              {empresasParceiras.map((parc) => (
                <option key={parc.id} value={parc.id}>
                  {parc.nome}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas de clientes e painel seleção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes Intragrupo */}
        <div className="lg:col-span-1">
          <Card className={modoApresentacao ? "border-2 border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Intragrupo
                {modoApresentacao && <Badge variant="secondary">Modo Apresentação</Badge>}
              </CardTitle>
              <CardDescription>
                Clientes das empresas intragrupo selecionadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clientesIntragrupo.map((cliente) => {
                  const isSelected = clientesSelecionados.some(c => c.id === cliente.empresa_cliente_id);
                  return (
                    <div
                      key={cliente.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleClienteSelecao({
                        empresa_cliente_id: cliente.empresa_cliente_id,
                        empresa_cliente: cliente.empresa_cliente,
                        empresa_proprietaria: cliente.empresa_proprietaria
                      })}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          <PrivateData type="company">
                            {cliente.empresa_cliente?.nome}
                          </PrivateData>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Proprietário: <PrivateData type="company">
                            {cliente.empresa_proprietaria?.nome}
                          </PrivateData>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {cliente.empresa_proprietaria?.tipo || 'Indefinido'}
                      </Badge>
                    </div>
                  );
                })}

                {clientesIntragrupo.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {parceirosSelecionados.length === 0 
                        ? "Selecione parceiros intragrupo para visualizar clientes"
                        : "Nenhum cliente encontrado para os parceiros selecionados"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de clientes do parceiro externo */}
        <div className="lg:col-span-1">
          <Card className={modoApresentacao ? "border-2 border-primary" : ""}>
            <CardHeader>
              <CardTitle>Clientes do Parceiro Externo</CardTitle>
              <CardDescription>
                Adicione novos clientes em tempo real para o parceiro selecionado.
              </CardDescription>
              {parceiroExternoSelecionado && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Adicionar novo cliente"
                    value={novoClienteNome}
                    onChange={(e) => setNovoClienteNome(e.target.value)}
                    disabled={adicionandoCliente}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdicionarClienteExterno();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAdicionarClienteExterno}
                    disabled={!novoClienteNome.trim() || adicionandoCliente}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {adicionandoCliente ? "Adicionando..." : "Incluir"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {parceiroExternoSelecionado ? (
                  clientesParceiroExterno.length > 0 ? (
                    clientesParceiroExterno.map((cliente) => {
                      const isSelected = clientesSelecionados.some(c => c.id === cliente.empresa_cliente_id);
                      return (
                        <div
                          key={cliente.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleClienteSelecao({
                            empresa_cliente_id: cliente.empresa_cliente_id,
                            empresa_cliente: cliente.empresa_cliente,
                            empresa_proprietaria: cliente.empresa_proprietaria
                          })}
                        >
                          <Checkbox checked={isSelected} onChange={() => {}} />
                          <div className="flex-1">
                            <div className="font-medium">
                              <PrivateData type="company">
                                {cliente.empresa_cliente?.nome}
                              </PrivateData>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Parceiro: <PrivateData type="company">
                                {cliente.empresa_proprietaria?.nome}
                              </PrivateData>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>Este parceiro ainda não possui clientes cadastrados.</p>
                      <p className="text-sm mt-2">Use o campo acima para adicionar o primeiro cliente.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Selecione um parceiro externo para ver/registrar clientes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Seleções (clientes selecionados para exportação) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Clientes Selecionados
              </CardTitle>
              <CardDescription>
                Lista para compartilhar/exportar com o parceiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientesSelecionados.map((cliente) => (
                  <div key={cliente.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium text-sm">{cliente.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {cliente.parceiro}
                    </div>
                  </div>
                ))}

                {clientesSelecionados.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Nenhum cliente selecionado ainda
                    </p>
                  </div>
                )}
              </div>

              {clientesSelecionados.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Button onClick={exportarLista} className="w-full" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Lista
                  </Button>
                  <Button onClick={limparSelecoes} variant="outline" className="w-full" size="sm">
                    Limpar Seleções
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModoApresentacaoPage;
