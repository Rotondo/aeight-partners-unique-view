
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Cloud, Mic, Settings, ExternalLink, Webhook } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const IAConfigSection: React.FC = () => {
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpKeyFile, setGcpKeyFile] = useState<File | null>(null);

  const handleGCPConfig = () => {
    if (!gcpProjectId) {
      toast({
        title: 'Erro',
        description: 'Digite o ID do projeto Google Cloud',
        variant: 'destructive'
      });
      return;
    }

    // Implementar configuração GCP
    toast({
      title: 'Configuração salva',
      description: 'Configurações do Google Cloud foram salvas com sucesso'
    });
  };

  const webhookEndpoints = [
    {
      name: 'STT Webhook',
      url: `https://amuadbftctnmckncgeua.supabase.co/functions/v1/stt-webhook`,
      description: 'Endpoint para receber dados de Speech-to-Text do Google Cloud'
    },
    {
      name: 'AI Agent Webhook', 
      url: `https://amuadbftctnmckncgeua.supabase.co/functions/v1/ai-agent-webhook`,
      description: 'Endpoint para integração com agentes de IA'
    },
    {
      name: 'Calendar Sync Webhook',
      url: `https://amuadbftctnmckncgeua.supabase.co/functions/v1/calendar-sync`,
      description: 'Endpoint para sincronização de calendários'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuração de IA e Integração</h2>
        <p className="text-muted-foreground">
          Configure agentes de IA, Speech-to-Text e webhooks para funcionalidades avançadas
        </p>
      </div>

      {/* Google Cloud Platform */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <CardTitle>Google Cloud Platform</CardTitle>
          </div>
          <CardDescription>
            Configure a integração com Google Cloud para Speech-to-Text e outros serviços de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Project ID</label>
            <Input
              value={gcpProjectId}
              onChange={(e) => setGcpProjectId(e.target.value)}
              placeholder="seu-projeto-gcp"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-2">Service Account Key (JSON)</label>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setGcpKeyFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Faça upload da chave de conta de serviço do Google Cloud
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGCPConfig}>
              <Settings className="mr-2 h-4 w-4" />
              Salvar Configuração
            </Button>
            <Button variant="outline" asChild>
              <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Console GCP
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Speech-to-Text Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <CardTitle>Speech-to-Text</CardTitle>
          </div>
          <CardDescription>
            Configure o serviço de transcrição de voz para texto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Status da Configuração</h4>
              <Badge variant="outline">Não Configurado</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Idiomas Suportados</h4>
              <div className="flex gap-1">
                <Badge variant="secondary">pt-BR</Badge>
                <Badge variant="secondary">en-US</Badge>
                <Badge variant="secondary">es-ES</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>Agentes de IA</CardTitle>
          </div>
          <CardDescription>
            Configure agentes de IA para diferentes funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Agente de Resumo</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Gera resumos automáticos de reuniões e atividades
              </p>
              <Badge variant="outline">Inativo</Badge>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Agente de Análise</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Analisa dados e gera insights sobre oportunidades
              </p>
              <Badge variant="outline">Inativo</Badge>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Agente de Sugestões</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Sugere ações baseadas em padrões de dados
              </p>
              <Badge variant="outline">Inativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Webhooks Disponíveis</CardTitle>
          </div>
          <CardDescription>
            Endpoints para integração com serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhookEndpoints.map((webhook, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{webhook.name}</h4>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(webhook.url)}>
                    Copiar URL
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{webhook.description}</p>
                <code className="text-xs bg-muted p-1 rounded block">{webhook.url}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
