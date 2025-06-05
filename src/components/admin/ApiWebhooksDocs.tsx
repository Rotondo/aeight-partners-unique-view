
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Database, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiWebhooksDocs: React.FC = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const supabaseUrl = "https://amuadbftctnmckncgeua.supabase.co";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdWFkYmZ0Y3RubWNrbmNnZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDAyNTIsImV4cCI6MjA2MzMxNjI1Mn0.sx8PDd0vlbt4nQRQfdK6hOuEFbmGVQjD4RJcuU2okxM";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  const endpoints = [
    {
      title: "Empresas",
      method: "GET",
      url: `${supabaseUrl}/rest/v1/empresas`,
      description: "Listar todas as empresas",
      example: `curl -X GET "${supabaseUrl}/rest/v1/empresas" \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"`
    },
    {
      title: "Oportunidades",
      method: "GET", 
      url: `${supabaseUrl}/rest/v1/oportunidades`,
      description: "Listar todas as oportunidades",
      example: `curl -X GET "${supabaseUrl}/rest/v1/oportunidades" \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"`
    },
    {
      title: "OnePagers",
      method: "GET",
      url: `${supabaseUrl}/rest/v1/onepager`,
      description: "Listar todos os OnePagers",
      example: `curl -X GET "${supabaseUrl}/rest/v1/onepager" \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"`
    },
    {
      title: "Indicadores de Parceiros",
      method: "GET",
      url: `${supabaseUrl}/rest/v1/indicadores_parceiro`,
      description: "Listar indicadores dos parceiros",
      example: `curl -X GET "${supabaseUrl}/rest/v1/indicadores_parceiro" \\
  -H "apikey: ${anonKey}" \\
  -H "Authorization: Bearer ${anonKey}"`
    }
  ];

  const jsExamples = [
    {
      title: "JavaScript/Node.js com Supabase Client",
      code: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  '${supabaseUrl}',
  '${anonKey}'
)

// Buscar empresas
const { data: empresas, error } = await supabase
  .from('empresas')
  .select('*')

// Buscar oportunidades com filtro
const { data: oportunidades, error } = await supabase
  .from('oportunidades')
  .select('*, empresas(*)')
  .eq('status', 'em_contato')

// Inserir nova oportunidade
const { data, error } = await supabase
  .from('oportunidades')
  .insert({
    nome_lead: 'Nova Oportunidade',
    empresa_origem_id: 'uuid-origem',
    empresa_destino_id: 'uuid-destino',
    status: 'em_contato'
  })`
    },
    {
      title: "Python com requests",
      code: `import requests

headers = {
    'apikey': '${anonKey}',
    'Authorization': f'Bearer ${anonKey}',
    'Content-Type': 'application/json'
}

# Buscar empresas
response = requests.get(
    '${supabaseUrl}/rest/v1/empresas',
    headers=headers
)
empresas = response.json()

# Inserir nova empresa
new_empresa = {
    'nome': 'Nova Empresa',
    'tipo': 'cliente',
    'status': True
}

response = requests.post(
    '${supabaseUrl}/rest/v1/empresas',
    headers=headers,
    json=new_empresa
)`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">APIs & Webhooks</h2>
        <p className="text-muted-foreground">
          Documentação para integração com sistemas externos via Supabase REST API
        </p>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                    <Badge variant="outline">{endpoint.method}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">URL:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                          {endpoint.url}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.url, `url-${index}`)}
                        >
                          {copiedCode === `url-${index}` ? "Copiado!" : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Exemplo cURL:</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <pre className="bg-muted p-2 rounded text-xs flex-1 overflow-x-auto">
                          {endpoint.example}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example, `curl-${index}`)}
                        >
                          {copiedCode === `curl-${index}` ? "Copiado!" : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid gap-4">
            {jsExamples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    {example.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <pre className="bg-muted p-4 rounded text-sm flex-1 overflow-x-auto">
                      {example.code}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(example.code, `example-${index}`)}
                    >
                      {copiedCode === `example-${index}` ? "Copiado!" : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2" />
                Configuração de Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Configure webhooks para receber notificações em tempo real sobre mudanças nos dados.
              </p>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">URL do Webhook Supabase:</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                      {supabaseUrl}/functions/v1/webhook
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://supabase.com/dashboard/project/amuadbftctnmckncgeua/functions`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Exemplo de payload:</Label>
                  <pre className="bg-muted p-2 rounded text-xs mt-1">
{`{
  "type": "INSERT",
  "table": "oportunidades",
  "record": {
    "id": "uuid",
    "nome_lead": "Nova Oportunidade",
    "status": "em_contato",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "old_record": null
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configuração do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Project URL:</Label>
                  <code className="bg-muted px-2 py-1 rounded text-sm block mt-1">
                    {supabaseUrl}
                  </code>
                </div>
                <div>
                  <Label className="text-sm font-medium">Anon Key:</Label>
                  <code className="bg-muted px-2 py-1 rounded text-sm block mt-1 break-all">
                    {anonKey}
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Links Úteis:</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://supabase.com/dashboard/project/amuadbftctnmckncgeua/api`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Settings no Supabase
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://supabase.com/dashboard/project/amuadbftctnmckncgeua/sql`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    SQL Editor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://supabase.com/dashboard/project/amuadbftctnmckncgeua/functions`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edge Functions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <label className={className}>{children}</label>
);
