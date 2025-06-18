
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Calendar, Target } from 'lucide-react';
import type { EventoWithContatos } from '@/types/eventos';

interface EventoAnalyticsProps {
  evento: EventoWithContatos;
}

export const EventoAnalytics: React.FC<EventoAnalyticsProps> = ({ evento }) => {
  const contatos = evento.contatos || [];
  
  // Métricas básicas
  const totalContatos = contatos.length;
  const contatosComEmail = contatos.filter(c => c.email).length;
  const contatosComTelefone = contatos.filter(c => c.telefone).length;
  const contatosComEmpresa = contatos.filter(c => c.empresa).length;

  // Análise por nível de interesse
  const interesseStats = contatos.reduce((acc, contato) => {
    const nivel = contato.interesse_nivel || 3;
    acc[nivel] = (acc[nivel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const interesseAlto = (interesseStats[4] || 0) + (interesseStats[5] || 0);
  const interesseMedio = interesseStats[3] || 0;
  const interesseBaixo = (interesseStats[1] || 0) + (interesseStats[2] || 0);

  // Top empresas
  const empresaStats = contatos
    .filter(c => c.empresa)
    .reduce((acc, contato) => {
      const empresa = contato.empresa!;
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topEmpresas = Object.entries(empresaStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Contatos com próximos passos definidos
  const contatosComFollowup = contatos.filter(c => c.proximos_passos).length;

  // Taxa de conversão (emails coletados)
  const taxaEmail = totalContatos > 0 ? (contatosComEmail / totalContatos) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Contatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContatos}</div>
            <p className="text-xs text-muted-foreground">
              contatos coletados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaEmail.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {contatosComEmail} de {totalContatos} contatos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Alto Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interesseAlto}</div>
            <p className="text-xs text-muted-foreground">
              contatos qualificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contatosComFollowup}</div>
            <p className="text-xs text-muted-foreground">
              com próximos passos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Interesse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Alto Interesse (4-5)</span>
                <span>{interesseAlto} contatos</span>
              </div>
              <Progress value={totalContatos > 0 ? (interesseAlto / totalContatos) * 100 : 0} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Médio Interesse (3)</span>
                <span>{interesseMedio} contatos</span>
              </div>
              <Progress value={totalContatos > 0 ? (interesseMedio / totalContatos) * 100 : 0} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Baixo Interesse (1-2)</span>
                <span>{interesseBaixo} contatos</span>
              </div>
              <Progress value={totalContatos > 0 ? (interesseBaixo / totalContatos) * 100 : 0} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Principais Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            {topEmpresas.length > 0 ? (
              <div className="space-y-2">
                {topEmpresas.map(([empresa, count]) => (
                  <div key={empresa} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{empresa}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum contato com empresa informada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Qualidade dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contatosComEmail}</div>
              <p className="text-sm text-muted-foreground">com email</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contatosComTelefone}</div>
              <p className="text-sm text-muted-foreground">com telefone</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{contatosComEmpresa}</div>
              <p className="text-sm text-muted-foreground">com empresa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
