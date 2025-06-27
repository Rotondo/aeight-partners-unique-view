
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useWishlist } from "@/contexts/WishlistContext";
import { ArrowLeftRight, Check, X, Plus, Trash2, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";

interface ClienteInteresse {
  id: string;
  nome: string;
  parceiro: string;
  interesse: 'alto' | 'medio' | 'baixo' | null;
  observacoes?: string;
}

interface NegociacaoAtiva {
  id: string;
  parceiro: string;
  minhosInteresses: ClienteInteresse[];
  interessesParceiro: ClienteInteresse[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataInicio: Date;
  dataUltimaAtualizacao: Date;
}

const TrocaMutuaPage: React.FC = () => {
  const { empresasClientes, loading } = useWishlist();
  const navigate = useNavigate();
  const [negociacoesAtivas, setNegociacoesAtivas] = useState<NegociacaoAtiva[]>([]);
  const [novaNegociacao, setNovaNegociacao] = useState<Partial<NegociacaoAtiva> | null>(null);
  const [showNovoClienteDialog, setShowNovoClienteDialog] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoClienteParceiro, setNovoClienteParceiro] = useState("");

  const empresas = Array.from(
    new Set(empresasClientes.map(ec => ec.empresa_proprietaria?.nome).filter(Boolean))
  );

  const iniciarNovaNegociacao = () => {
    // Use the first available partner company or a placeholder
    const parceiroSelecionado = empresas.length > 0 ? empresas[0] : "Selecionar Parceiro";
    
    const novaNeg: NegociacaoAtiva = {
      id: Date.now().toString(),
      parceiro: parceiroSelecionado,
      minhosInteresses: [],
      interessesParceiro: [],
      status: 'pendente',
      dataInicio: new Date(),
      dataUltimaAtualizacao: new Date()
    };
    setNegociacoesAtivas([...negociacoesAtivas, novaNeg]);
  };

  const adicionarClienteInteresse = (negociacaoId: string, tipo: 'meus' | 'parceiro') => {
    if (!novoClienteNome.trim()) return;

    const novoCliente: ClienteInteresse = {
      id: Date.now().toString(),
      nome: novoClienteNome,
      parceiro: novoClienteParceiro,
      interesse: null
    };

    setNegociacoesAtivas(prev => prev.map(neg => {
      if (neg.id === negociacaoId) {
        return {
          ...neg,
          [tipo === 'meus' ? 'minhosInteresses' : 'interessesParceiro']: [
            ...neg[tipo === 'meus' ? 'minhosInteresses' : 'interessesParceiro'],
            novoCliente
          ],
          dataUltimaAtualizacao: new Date()
        };
      }
      return neg;
    }));

    setNovoClienteNome("");
    setNovoClienteParceiro("");
    setShowNovoClienteDialog(false);
  };

  const atualizarInteresse = (negociacaoId: string, clienteId: string, tipo: 'meus' | 'parceiro', interesse: 'alto' | 'medio' | 'baixo') => {
    setNegociacoesAtivas(prev => prev.map(neg => {
      if (neg.id === negociacaoId) {
        const campo = tipo === 'meus' ? 'minhosInteresses' : 'interessesParceiro';
        return {
          ...neg,
          [campo]: neg[campo].map(cliente => 
            cliente.id === clienteId ? { ...cliente, interesse } : cliente
          ),
          dataUltimaAtualizacao: new Date()
        };
      }
      return neg;
    }));
  };

  const removerCliente = (negociacaoId: string, clienteId: string, tipo: 'meus' | 'parceiro') => {
    setNegociacoesAtivas(prev => prev.map(neg => {
      if (neg.id === negociacaoId) {
        const campo = tipo === 'meus' ? 'minhosInteresses' : 'interessesParceiro';
        return {
          ...neg,
          [campo]: neg[campo].filter(cliente => cliente.id !== clienteId),
          dataUltimaAtualizacao: new Date()
        };
      }
      return neg;
    }));
  };

  const finalizarNegociacao = (negociacaoId: string, status: 'aprovado' | 'rejeitado') => {
    setNegociacoesAtivas(prev => prev.map(neg => {
      if (neg.id === negociacaoId) {
        return {
          ...neg,
          status,
          dataUltimaAtualizacao: new Date()
        };
      }
      return neg;
    }));

    toast({
      title: status === 'aprovado' ? "Negociação Aprovada" : "Negociação Rejeitada",
      description: status === 'aprovado' 
        ? "Os clientes selecionados seguem para a fase de qualificação" 
        : "Esta negociação foi encerrada",
    });
  };

  const getInteresseColor = (interesse: string | null) => {
    switch (interesse) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'baixo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando negociações...</p>
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
              Sistema de Troca Mútua
            </h1>
            <p className="text-muted-foreground text-sm">
              Gerencie negociações de clientes e interesses mútuos com parceiros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Button onClick={iniciarNovaNegociacao}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Negociação
          </Button>
        </div>
      </div>

      {/* Negociações Ativas */}
      <div className="space-y-6">
        {negociacoesAtivas.map((negociacao) => (
          <Card key={negociacao.id} className="border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    Negociação com <PrivateData type="company">
                      {negociacao.parceiro}
                    </PrivateData>
                  </CardTitle>
                  <CardDescription>
                    Iniciada em {negociacao.dataInicio.toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(negociacao.status)}>
                  {negociacao.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meus Interesses */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Meus Interesses</h3>
                    <Dialog open={showNovoClienteDialog} onOpenChange={setShowNovoClienteDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Cliente de Interesse</DialogTitle>
                          <DialogDescription>
                            Adicione um cliente que você tem interesse em conhecer
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cliente-nome">Nome do Cliente</Label>
                            <Input
                              id="cliente-nome"
                              value={novoClienteNome}
                              onChange={(e) => setNovoClienteNome(e.target.value)}
                              placeholder="Nome da empresa..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="cliente-parceiro">Parceiro</Label>
                            <select 
                              id="cliente-parceiro"
                              value={novoClienteParceiro}
                              onChange={(e) => setNovoClienteParceiro(e.target.value)}
                              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                              <option value="">Selecione um parceiro</option>
                              {empresas.map(empresa => (
                                <option key={empresa} value={empresa}>{empresa}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => adicionarClienteInteresse(negociacao.id, 'meus')}
                              disabled={!novoClienteNome.trim()}
                            >
                              Adicionar
                            </Button>
                            <Button variant="outline" onClick={() => setShowNovoClienteDialog(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-2">
                    {negociacao.minhosInteresses.map((cliente) => (
                      <div key={cliente.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              <PrivateData type="company">
                                {cliente.nome}
                              </PrivateData>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <PrivateData type="company">
                                {cliente.parceiro}
                              </PrivateData>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removerCliente(negociacao.id, cliente.id, 'meus')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          {['alto', 'medio', 'baixo'].map((nivel) => (
                            <Button
                              key={nivel}
                              size="sm"
                              variant={cliente.interesse === nivel ? "default" : "outline"}
                              onClick={() => atualizarInteresse(negociacao.id, cliente.id, 'meus', nivel as any)}
                              className="text-xs"
                            >
                              {nivel}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {negociacao.minhosInteresses.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Nenhum cliente adicionado ainda
                      </div>
                    )}
                  </div>
                </div>

                {/* Interesses do Parceiro */}
                <div>
                  <h3 className="font-semibold mb-4">Interesses do Parceiro</h3>
                  <div className="space-y-2">
                    {negociacao.interessesParceiro.map((cliente) => (
                      <div key={cliente.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              <PrivateData type="company">
                                {cliente.nome}
                              </PrivateData>
                            </div>
                            <div className="text-sm text-muted-foreground">Nosso cliente</div>
                          </div>
                          <Badge className={getInteresseColor(cliente.interesse)}>
                            {cliente.interesse || 'Não avaliado'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {negociacao.interessesParceiro.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Aguardando interesses do parceiro
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações */}
              {negociacao.status === 'pendente' && (
                <div className="mt-6 flex gap-2">
                  <Button 
                    onClick={() => finalizarNegociacao(negociacao.id, 'aprovado')}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aprovar Negociação
                  </Button>
                  <Button 
                    onClick={() => finalizarNegociacao(negociacao.id, 'rejeitado')}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {negociacoesAtivas.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma negociação ativa</h3>
              <p className="text-muted-foreground mb-4">
                Inicie uma nova negociação para trocar interesses com parceiros
              </p>
              <Button onClick={iniciarNovaNegociacao}>
                <Plus className="mr-2 h-4 w-4" />
                Iniciar Primeira Negociação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrocaMutuaPage;
