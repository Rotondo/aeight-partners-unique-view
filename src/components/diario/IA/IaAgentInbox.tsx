
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useIA } from '@/contexts/IAContext';
import { IaApproveField } from './IaApproveField';
import { StatusSugestaoIA } from '@/types/diario';

export const IaAgentInbox: React.FC = () => {
  const { iaSugestoes, loadingIa } = useIA();
  const [activeTab, setActiveTab] = useState('pendente');

  // Filtrar sugestões por status
  const sugestoesPendentes = iaSugestoes.filter(s => s.status === 'pendente');
  const sugestoesEmRevisao = iaSugestoes.filter(s => s.status === 'em_revisao');
  const sugestoesAprovadas = iaSugestoes.filter(s => s.status === 'aprovada');
  const sugestoesRejeitadas = iaSugestoes.filter(s => s.status === 'rejeitada');

  const getStatusBadge = (status: StatusSugestaoIA) => {
    const variants = {
      pendente: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      em_revisao: { className: 'bg-blue-100 text-blue-800', icon: Clock },
      aprovada: { className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejeitada: { className: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const renderSugestoesList = (sugestoes: typeof iaSugestoes) => {
    if (sugestoes.length === 0) {
      return (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
          <p className="text-muted-foreground">
            As sugestões da IA aparecerão aqui quando disponíveis
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sugestoes.map((sugestao) => (
          <Card key={sugestao.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{sugestao.titulo}</h4>
                  <p className="text-sm text-muted-foreground">
                    Tipo: {sugestao.tipo_sugestao}
                  </p>
                </div>
                {getStatusBadge(sugestao.status)}
              </div>

              {sugestao.parceiro && (
                <p className="text-sm text-muted-foreground mb-3">
                  Parceiro: {sugestao.parceiro.nome}
                </p>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Conteúdo Original:</p>
                  <div className="bg-muted/50 p-3 rounded text-sm">
                    {sugestao.conteudo_original}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Sugestão da IA:</p>
                  <div className="bg-blue-50/50 p-3 rounded text-sm border-l-4 border-blue-500">
                    {sugestao.conteudo_sugerido}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Justificativa:</p>
                  <p className="text-sm text-muted-foreground">
                    {sugestao.justificativa_ia}
                  </p>
                </div>

                {sugestao.conteudo_aprovado && (
                  <div>
                    <p className="text-sm font-medium mb-1">Versão Aprovada:</p>
                    <div className="bg-green-50/50 p-3 rounded text-sm border-l-4 border-green-500">
                      {sugestao.conteudo_aprovado}
                    </div>
                  </div>
                )}

                {sugestao.observacoes_revisor && (
                  <div>
                    <p className="text-sm font-medium mb-1">Observações do Revisor:</p>
                    <p className="text-sm text-muted-foreground">
                      {sugestao.observacoes_revisor}
                    </p>
                  </div>
                )}
              </div>

              {/* Campo de aprovação para sugestões pendentes ou em revisão */}
              {(sugestao.status === 'pendente' || sugestao.status === 'em_revisao') && (
                <div className="mt-4 pt-4 border-t">
                  <IaApproveField sugestao={sugestao} />
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
                <span>
                  Criada em: {new Date(sugestao.created_at).toLocaleString('pt-BR')}
                </span>
                {sugestao.data_revisao && (
                  <span>
                    Revisada em: {new Date(sugestao.data_revisao).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Assistente IA</h2>
          <p className="text-muted-foreground">
            Revise e aprove sugestões geradas pela inteligência artificial
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-yellow-600">
              {sugestoesPendentes.length}
            </div>
            <p className="text-center text-muted-foreground text-sm">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {sugestoesEmRevisao.length}
            </div>
            <p className="text-center text-muted-foreground text-sm">Em Revisão</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">
              {sugestoesAprovadas.length}
            </div>
            <p className="text-center text-muted-foreground text-sm">Aprovadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-red-600">
              {sugestoesRejeitadas.length}
            </div>
            <p className="text-center text-muted-foreground text-sm">Rejeitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com sugestões */}
      <Card>
        <CardHeader>
          <CardTitle>Sugestões da IA</CardTitle>
          <CardDescription>
            Gerencie as sugestões de melhorias da inteligência artificial
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pendente">
                Pendentes ({sugestoesPendentes.length})
              </TabsTrigger>
              <TabsTrigger value="em_revisao">
                Em Revisão ({sugestoesEmRevisao.length})
              </TabsTrigger>
              <TabsTrigger value="aprovada">
                Aprovadas ({sugestoesAprovadas.length})
              </TabsTrigger>
              <TabsTrigger value="rejeitada">
                Rejeitadas ({sugestoesRejeitadas.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendente" className="mt-6">
              {loadingIa ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                renderSugestoesList(sugestoesPendentes)
              )}
            </TabsContent>

            <TabsContent value="em_revisao" className="mt-6">
              {renderSugestoesList(sugestoesEmRevisao)}
            </TabsContent>

            <TabsContent value="aprovada" className="mt-6">
              {renderSugestoesList(sugestoesAprovadas)}
            </TabsContent>

            <TabsContent value="rejeitada" className="mt-6">
              {renderSugestoesList(sugestoesRejeitadas)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
