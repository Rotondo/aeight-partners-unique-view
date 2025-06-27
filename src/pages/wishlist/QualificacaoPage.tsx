
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useWishlist } from "@/contexts/WishlistContext";
import { Star, CheckCircle, Clock, ArrowRight, Users, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ClienteQualificacao {
  id: string;
  nome: string;
  parceiro: string;
  scoreQualificacao: number;
  statusQualificacao: 'pendente' | 'qualificado' | 'rejeitado' | 'convertido';
  observacoes?: string;
  dataQualificacao?: Date;
  criterios: {
    potencialReceita: number;
    facilidadeAcesso: number;
    alinhamentoEstrategico: number;
    urgencia: number;
  };
  proximosPassos?: string;
}

const QualificacaoPage: React.FC = () => {
  const { loading, convertToOportunidade } = useWishlist();
  const [clientesQualificacao, setClientesQualificacao] = useState<ClienteQualificacao[]>([
    {
      id: '1',
      nome: 'Nike Brasil',
      parceiro: 'Agência XYZ',
      scoreQualificacao: 0,
      statusQualificacao: 'pendente',
      criterios: {
        potencialReceita: 5,
        facilidadeAcesso: 3,
        alinhamentoEstrategico: 4,
        urgencia: 2
      }
    },
    {
      id: '2',
      nome: 'Adidas',
      parceiro: 'Marketing Plus',
      scoreQualificacao: 85,
      statusQualificacao: 'qualificado',
      criterios: {
        potencialReceita: 9,
        facilidadeAcesso: 8,
        alinhamentoEstrategico: 9,
        urgencia: 7
      },
      observacoes: 'Cliente com grande potencial, já demonstrou interesse em nossas soluções.',
      dataQualificacao: new Date('2024-01-15'),
      proximosPassos: 'Agendar reunião de apresentação com o CMO'
    }
  ]);

  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteQualificacao | null>(null);
  const [showConversaoDialog, setShowConversaoDialog] = useState(false);

  const calcularScore = (criterios: ClienteQualificacao['criterios']) => {
    const { potencialReceita, facilidadeAcesso, alinhamentoEstrategico, urgencia } = criterios;
    // Peso: Potencial (40%), Facilidade (20%), Alinhamento (25%), Urgência (15%)
    return Math.round((potencialReceita * 0.4 + facilidadeAcesso * 0.2 + alinhamentoEstrategico * 0.25 + urgencia * 0.15) * 10);
  };

  const atualizarCriterio = (clienteId: string, criterio: keyof ClienteQualificacao['criterios'], valor: number) => {
    setClientesQualificacao(prev => prev.map(cliente => {
      if (cliente.id === clienteId) {
        const novosCriterios = { ...cliente.criterios, [criterio]: valor };
        return {
          ...cliente,
          criterios: novosCriterios,
          scoreQualificacao: calcularScore(novosCriterios)
        };
      }
      return cliente;
    }));
  };

  const qualificarCliente = (clienteId: string, status: 'qualificado' | 'rejeitado', observacoes?: string, proximosPassos?: string) => {
    setClientesQualificacao(prev => prev.map(cliente => {
      if (cliente.id === clienteId) {
        return {
          ...cliente,
          statusQualificacao: status,
          observacoes,
          proximosPassos,
          dataQualificacao: new Date()
        };
      }
      return cliente;
    }));

    toast({
      title: status === 'qualificado' ? "Cliente Qualificado" : "Cliente Rejeitado",
      description: status === 'qualificado' 
        ? "Cliente aprovado para receber apresentação formal" 
        : "Cliente não passou na qualificação",
    });
  };

  const converterParaOportunidade = async (cliente: ClienteQualificacao) => {
    try {
      const oportunidadeData = {
        nome: `Apresentação - ${cliente.nome}`,
        descricao: cliente.observacoes || 'Oportunidade gerada via WishLift',
        valor_estimado: 0,
        probabilidade: cliente.scoreQualificacao,
        status: 'prospeccao',
      };

      // Simular conversão para oportunidade
      setClientesQualificacao(prev => prev.map(c => 
        c.id === cliente.id ? { ...c, statusQualificacao: 'convertido' } : c
      ));

      toast({
        title: "Convertido para Oportunidade",
        description: `${cliente.nome} foi convertido para uma oportunidade no pipeline`,
      });

      setShowConversaoDialog(false);
    } catch (error) {
      console.error("Erro ao converter:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'qualificado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'convertido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const clientesPendentes = clientesQualificacao.filter(c => c.statusQualificacao === 'pendente');
  const clientesQualificados = clientesQualificacao.filter(c => c.statusQualificacao === 'qualificado');
  const clientesConvertidos = clientesQualificacao.filter(c => c.statusQualificacao === 'convertido');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando qualificações...</p>
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
            Qualificação Colaborativa
          </h1>
          <p className="text-muted-foreground text-sm">
            Avalie o potencial de cada cliente e converta os melhores em oportunidades
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesPendentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesQualificados.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientesConvertidos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(clientesQualificacao.reduce((acc, c) => acc + c.scoreQualificacao, 0) / clientesQualificacao.length) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Qualificação */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({clientesPendentes.length})</TabsTrigger>
          <TabsTrigger value="qualificados">Qualificados ({clientesQualificados.length})</TabsTrigger>
          <TabsTrigger value="convertidos">Convertidos ({clientesConvertidos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {clientesPendentes.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <CardDescription>Parceiro: {cliente.parceiro}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(cliente.scoreQualificacao)}`}>
                      {cliente.scoreQualificacao}
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Critérios de Qualificação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Potencial de Receita</Label>
                    <div className="mt-2">
                      <Slider
                        value={[cliente.criterios.potencialReceita]}
                        onValueChange={([value]) => atualizarCriterio(cliente.id, 'potencialReceita', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Valor: {cliente.criterios.potencialReceita}/10
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Facilidade de Acesso</Label>
                    <div className="mt-2">
                      <Slider
                        value={[cliente.criterios.facilidadeAcesso]}
                        onValueChange={([value]) => atualizarCriterio(cliente.id, 'facilidadeAcesso', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Valor: {cliente.criterios.facilidadeAcesso}/10
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Alinhamento Estratégico</Label>
                    <div className="mt-2">
                      <Slider
                        value={[cliente.criterios.alinhamentoEstrategico]}
                        onValueChange={([value]) => atualizarCriterio(cliente.id, 'alinhamentoEstrategico', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Valor: {cliente.criterios.alinhamentoEstrategico}/10
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Urgência</Label>
                    <div className="mt-2">
                      <Slider
                        value={[cliente.criterios.urgencia]}
                        onValueChange={([value]) => atualizarCriterio(cliente.id, 'urgencia', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Valor: {cliente.criterios.urgencia}/10
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => qualificarCliente(cliente.id, 'qualificado')}
                    disabled={cliente.scoreQualificacao < 50}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Qualificar Cliente
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => qualificarCliente(cliente.id, 'rejeitado')}
                    className="flex-1"
                  >
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {clientesPendentes.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente pendente</h3>
                <p className="text-muted-foreground">
                  Todos os clientes foram qualificados ou rejeitados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qualificados" className="space-y-4">
          {clientesQualificados.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <CardDescription>Parceiro: {cliente.parceiro}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(cliente.statusQualificacao)}>
                      {cliente.statusQualificacao.toUpperCase()}
                    </Badge>
                    <div className={`text-xl font-bold ${getScoreColor(cliente.scoreQualificacao)} mt-1`}>
                      {cliente.scoreQualificacao}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {cliente.observacoes && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Observações</Label>
                    <p className="text-sm text-muted-foreground mt-1">{cliente.observacoes}</p>
                  </div>
                )}
                
                {cliente.proximosPassos && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Próximos Passos</Label>
                    <p className="text-sm text-muted-foreground mt-1">{cliente.proximosPassos}</p>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    setClienteSelecionado(cliente);
                    setShowConversaoDialog(true);
                  }}
                  className="w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Converter para Oportunidade
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="convertidos" className="space-y-4">
          {clientesConvertidos.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <CardDescription>Parceiro: {cliente.parceiro}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(cliente.statusQualificacao)}>
                    CONVERTIDO
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Convertido para oportunidade em {cliente.dataQualificacao?.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog de Conversão */}
      <Dialog open={showConversaoDialog} onOpenChange={setShowConversaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Converter para Oportunidade</DialogTitle>
            <DialogDescription>
              Confirme a conversão de {clienteSelecionado?.nome} para uma oportunidade no pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                Score: {clienteSelecionado?.scoreQualificacao}
              </div>
              <p className="text-sm text-muted-foreground">
                Cliente qualificado e pronto para apresentação formal
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => clienteSelecionado && converterParaOportunidade(clienteSelecionado)}
                className="flex-1"
              >
                Confirmar Conversão
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConversaoDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualificacaoPage;
