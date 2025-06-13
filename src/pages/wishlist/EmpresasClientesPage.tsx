import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, Search, Building2, Calendar, Loader2, Edit2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
// MultiSelect
import { MultiSelect } from "@/components/ui/multiselect";

type EmpresaOption = {
  id: string;
  nome: string;
  tipo: string;
};

const EmpresasClientesPage: React.FC = () => {
  const {
    empresasClientes,
    loading: loadingEmpresasClientes,
    fetchEmpresasClientes,
    addEmpresaCliente,
    updateEmpresaCliente,
    solicitarApresentacao,
  } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState<"novo" | "editar">("novo");
  const [editRelacionamentoId, setEditRelacionamentoId] = useState<string | null>(null);

  // Solicitar apresentação
  const [modalApresentacaoOpen, setModalApresentacaoOpen] = useState(false);
  const [apresentacaoCliente, setApresentacaoCliente] = useState<any | null>(null);
  const [apresentacaoLoading, setApresentacaoLoading] = useState(false);
  const [apresentacaoObs, setApresentacaoObs] = useState("");

  // Form state
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [empresasClientesOptions, setEmpresasClientesOptions] = useState<EmpresaOption[]>([]);
  const [empresasParceiros, setEmpresasParceiros] = useState<EmpresaOption[]>([]);
  const [parceirosSelecionados, setParceirosSelecionados] = useState<string[]>([]);
  const [empresaCliente, setEmpresaCliente] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");

  // Estado para todas as empresas do tipo cliente (para exibir clientes não vinculados)
  const [empresasClientesAll, setEmpresasClientesAll] = useState<EmpresaOption[]>([]);

  // Buscar empresas para o formulário e ALL clientes para exibição
  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,tipo")
        .order("nome");

      if (!error && data) {
        setEmpresas(data);
        setEmpresasClientesOptions(data.filter((e: EmpresaOption) => e.tipo === "cliente"));
        setEmpresasParceiros(data.filter((e: EmpresaOption) => e.tipo === "parceiro" || e.tipo === "intragrupo"));
        setEmpresasClientesAll(data.filter((e: EmpresaOption) => e.tipo === "cliente"));
      }
    };
    fetchEmpresas();
  }, []);

  // Atualiza empresas para select ao abrir modal (mantendo lógica original)
  useEffect(() => {
    if (!modalOpen) return;
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,tipo")
        .order("nome");

      if (!error && data) {
        setEmpresas(data);
        setEmpresasClientesOptions(data.filter((e: EmpresaOption) => e.tipo === "cliente"));
        setEmpresasParceiros(data.filter((e: EmpresaOption) => e.tipo === "parceiro" || e.tipo === "intragrupo"));
      }
    };
    fetchEmpresas();
  }, [modalOpen]);

  // Handler: criar novo cliente rapidamente
  const handleCriarNovoCliente = async () => {
    if (!novoClienteNome.trim()) return;
    setCriandoNovoCliente(true);
    const existe = empresasClientesOptions.find(
      (c) => c.nome.trim().toLowerCase() === novoClienteNome.trim().toLowerCase()
    );
    let clienteId = "";
    if (existe) {
      clienteId = existe.id;
    } else {
      const { data, error } = await supabase
        .from("empresas")
        .insert({
          nome: novoClienteNome.trim(),
          tipo: "cliente",
          status: true,
        })
        .select("id")
        .single();
      if (!error && data) {
        clienteId = data.id;
        setEmpresasClientesOptions((prev) => [...prev, { id: data.id, nome: novoClienteNome.trim(), tipo: "cliente" }]);
        setEmpresas((prev) => [...prev, { id: data.id, nome: novoClienteNome.trim(), tipo: "cliente" }]);
        setEmpresasClientesAll((prev) => [...prev, { id: data.id, nome: novoClienteNome.trim(), tipo: "cliente" }]);
      }
    }
    if (clienteId) setEmpresaCliente(clienteId);
    setNovoClienteNome("");
    setCriandoNovoCliente(false);
  };

  const resetModal = () => {
    setParceirosSelecionados([]);
    setEmpresaCliente("");
    setObservacoes("");
    setNovoClienteNome("");
    setEditRelacionamentoId(null);
    setModalType("novo");
  };

  // Retorna IDs de todos os parceiros já vinculados ao cliente selecionado
  const parceirosJaVinculadosAoCliente = (clienteId: string) =>
    empresasClientes
      .filter((v) => v.empresa_cliente_id === clienteId)
      .map((v) => v.empresa_proprietaria_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    if (modalType === "editar" && editRelacionamentoId) {
      // Editar relacionamento individual
      await updateEmpresaCliente(editRelacionamentoId, {
        empresa_proprietaria_id: parceirosSelecionados[0],
        empresa_cliente_id: empresaCliente,
        observacoes,
      });
    } else {
      // Criar múltiplos vínculos: para cada parceiro selecionado, cria um vínculo com o cliente escolhido
      const jaVinculados = parceirosJaVinculadosAoCliente(empresaCliente);
      const novosParceiros = parceirosSelecionados.filter(id => !jaVinculados.includes(id));
      await Promise.all(novosParceiros.map(parceiroId =>
        addEmpresaCliente({
          empresa_proprietaria_id: parceiroId,
          empresa_cliente_id: empresaCliente,
          status: true,
          data_relacionamento: new Date().toISOString(),
          observacoes,
        })
      ));
    }
    setModalLoading(false);
    setModalOpen(false);
    resetModal();
    fetchEmpresasClientes();
  };

  const filteredClientesVinculados = empresasClientes.filter(cliente =>
    cliente.empresa_cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa_proprietaria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clientes não vinculados: todos do tipo cliente que não estão em nenhum vínculo
  const clientesVinculadosIds = new Set(empresasClientes.map(c => c.empresa_cliente_id));
  const filteredClientesNaoVinculados = empresasClientesAll
    .filter(cliente =>
      !clientesVinculadosIds.has(cliente.id) &&
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleEditar = (relacionamento: any) => {
    setModalType("editar");
    setEditRelacionamentoId(relacionamento.id);
    setParceirosSelecionados([relacionamento.empresa_proprietaria_id]);
    setEmpresaCliente(relacionamento.empresa_cliente_id);
    setObservacoes(relacionamento.observacoes || "");
    setModalOpen(true);
  };

  const handleSolicitarApresentacao = (relacionamento: any) => {
    setApresentacaoCliente(relacionamento);
    setModalApresentacaoOpen(true);
  };

  // Para o multi-select: filtrar parceiros já vinculados ao cliente selecionado
  const parceirosDisponiveis = empresaCliente
    ? empresasParceiros.filter(
        (parceiro) =>
          !parceirosJaVinculadosAoCliente(empresaCliente).includes(parceiro.id) ||
          parceirosSelecionados.includes(parceiro.id) // Permitir manter selecionados no modo edição
      )
    : empresasParceiros;

  // Handler para solicitar apresentação (exemplo simplificado)
  const handleSubmitApresentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setApresentacaoLoading(true);
    if (apresentacaoCliente && solicitarApresentacao) {
      await solicitarApresentacao({
        empresa_cliente_id: apresentacaoCliente.empresa_cliente_id,
        empresa_proprietaria_id: apresentacaoCliente.empresa_proprietaria_id,
        relacionamento_id: apresentacaoCliente.id,
        observacoes: apresentacaoObs,
      });
      setModalApresentacaoOpen(false);
      setApresentacaoCliente(null);
      setApresentacaoObs("");
    }
    setApresentacaoLoading(false);
  };

  if (loadingEmpresasClientes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie a base de clientes de cada parceiro
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={o => { setModalOpen(o); if (!o) resetModal(); }}>
          <Button onClick={() => { setModalOpen(true); setModalType("novo"); }}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {modalType === "editar" ? "Editar Relacionamento" : "Novo Relacionamento Parceiro-Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Parceiro(s) / Proprietário(s)</label>
                <MultiSelect
                  options={parceirosDisponiveis.map(p => ({ value: p.id, label: p.nome }))}
                  values={parceirosSelecionados}
                  onChange={setParceirosSelecionados}
                  disabled={modalType === "editar"}
                  placeholder="Selecione um ou mais parceiros proprietários"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Cliente</label>
                <Input
                  as="select"
                  value={empresaCliente}
                  onChange={e => setEmpresaCliente(e.target.value)}
                  disabled={modalType === "editar"}
                  className="w-full"
                >
                  <option value="" disabled>
                    Selecione cliente
                  </option>
                  {empresasClientesOptions.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </Input>
                <div className="flex mt-2 gap-2">
                  <Input
                    placeholder="Novo cliente"
                    value={novoClienteNome}
                    onChange={e => setNovoClienteNome(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCriarNovoCliente();
                      }
                    }}
                    disabled={criandoNovoCliente}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCriarNovoCliente}
                    disabled={criandoNovoCliente || !novoClienteNome.trim()}
                  >
                    {criandoNovoCliente && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O cliente será criado e vinculado à base Aeight.
                </p>
              </div>
              <div>
                <label className="block font-medium mb-1">Observações (opcional)</label>
                <Input
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Observações sobre o relacionamento"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    modalLoading ||
                    parceirosSelecionados.length === 0 ||
                    !empresaCliente
                  }
                >
                  {modalLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  {modalType === "editar" ? "Salvar Alterações" : "Criar Relacionamento(s)"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Modal Solicitar Apresentação */}
        <Dialog open={modalApresentacaoOpen} onOpenChange={setModalApresentacaoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Apresentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitApresentacao} className="space-y-4">
              <div>
                <div className="font-medium mb-2">
                  Cliente: <span className="font-normal">{apresentacaoCliente?.empresa_cliente?.nome}</span>
                </div>
                <div className="font-medium mb-2">
                  Proprietário: <span className="font-normal">{apresentacaoCliente?.empresa_proprietaria?.nome}</span>
                </div>
                <Input
                  placeholder="Observações para a apresentação"
                  value={apresentacaoObs}
                  onChange={e => setApresentacaoObs(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={apresentacaoLoading}>
                  {apresentacaoLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Solicitar Apresentação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes Vinculados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresasClientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proprietários Únicos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(empresasClientes.map(c => c.empresa_proprietaria_id)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relacionamentos Ativos</CardTitle>
            <Badge variant="outline">Ativo</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {empresasClientes.filter(c => c.status).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes Vinculados */}
      <div className="grid gap-4">
        {filteredClientesVinculados.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {cliente.empresa_cliente?.nome}
                  </CardTitle>
                  <CardDescription>
                    Proprietário: {cliente.empresa_proprietaria?.nome}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cliente.status ? "default" : "secondary"}>
                    {cliente.status ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">
                    {cliente.empresa_cliente?.tipo}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Relacionamento desde{" "}
                  {format(new Date(cliente.data_relacionamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                {cliente.observacoes && (
                  <p className="text-sm text-muted-foreground">
                    {cliente.observacoes}
                  </p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditar(cliente)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSolicitarApresentacao(cliente)}>
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Solicitar Apresentação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Clientes NÃO vinculados */}
        {filteredClientesNaoVinculados.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {cliente.nome}
                  </CardTitle>
                  <CardDescription>
                    <span className="italic text-muted-foreground">Sem relacionamento registrado</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Não vinculado</Badge>
                  <Badge variant="outline">{cliente.tipo}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                Cliente cadastrado na base, aguardando relacionamento.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmpresaCliente(cliente.id);
                    setModalOpen(true);
                    setModalType("novo");
                  }}
                >
                  Vincular a Proprietário
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Caso nenhum cliente exibido */}
        {filteredClientesVinculados.length + filteredClientesNaoVinculados.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Adicione o primeiro cliente à base"}
              </p>
              <Button onClick={() => { setModalOpen(true); setModalType("novo"); }}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmpresasClientesPage;
