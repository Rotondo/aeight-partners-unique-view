
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';

const CONSOLE_PREFIX = "[WishlistDebugPanel]";

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const WishlistDebugPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: DebugResult[] = [];

    try {
      // Teste 1: Conexão com Supabase
      console.log(`${CONSOLE_PREFIX} Testando conexão com Supabase...`);
      try {
        const { data: connectionTest } = await supabase.from('empresas').select('count').limit(1);
        testResults.push({
          test: 'Conexão Supabase',
          status: 'success',
          message: 'Conexão estabelecida com sucesso',
          data: connectionTest
        });
      } catch (error: any) {
        testResults.push({
          test: 'Conexão Supabase',
          status: 'error',
          message: `Erro de conexão: ${error.message}`,
          data: error
        });
      }

      // Teste 2: Verificar tabela empresas
      console.log(`${CONSOLE_PREFIX} Verificando dados da tabela empresas...`);
      try {
        const { data: empresas, error: empresasError } = await supabase
          .from('empresas')
          .select('id, nome, tipo')
          .limit(10);

        if (empresasError) throw empresasError;

        testResults.push({
          test: 'Tabela Empresas',
          status: 'success',
          message: `${empresas?.length || 0} empresas encontradas`,
          data: empresas?.slice(0, 3) // Apenas primeiras 3 para não lotar
        });
      } catch (error: any) {
        testResults.push({
          test: 'Tabela Empresas',
          status: 'error',
          message: `Erro ao acessar empresas: ${error.message}`,
          data: error
        });
      }

      // Teste 3: Verificar tabela empresa_clientes
      console.log(`${CONSOLE_PREFIX} Verificando dados da tabela empresa_clientes...`);
      try {
        const { data: relacionamentos, error: relacionamentosError } = await supabase
          .from('empresa_clientes')
          .select('*')
          .limit(10);

        if (relacionamentosError) throw relacionamentosError;

        testResults.push({
          test: 'Tabela Empresa_Clientes',
          status: relacionamentos && relacionamentos.length > 0 ? 'success' : 'warning',
          message: `${relacionamentos?.length || 0} relacionamentos encontrados`,
          data: relacionamentos?.slice(0, 3)
        });
      } catch (error: any) {
        testResults.push({
          test: 'Tabela Empresa_Clientes',
          status: 'error',
          message: `Erro ao acessar empresa_clientes: ${error.message}`,
          data: error
        });
      }

      // Teste 4: Teste da query com JOIN
      console.log(`${CONSOLE_PREFIX} Testando query com JOIN...`);
      try {
        const { data: joinTest, error: joinError } = await supabase
          .from('empresa_clientes')
          .select(`
            id,
            empresa_proprietaria_id,
            empresa_cliente_id,
            status,
            empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo),
            empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, tipo)
          `)
          .limit(5);

        if (joinError) throw joinError;

        testResults.push({
          test: 'Query com JOIN',
          status: 'success',
          message: `Query JOIN executada. ${joinTest?.length || 0} registros retornados`,
          data: joinTest?.map(item => ({
            id: item.id,
            proprietario: item.empresa_proprietaria?.nome || 'NULL',
            cliente: item.empresa_cliente?.nome || 'NULL',
            status: item.status
          }))
        });
      } catch (error: any) {
        testResults.push({
          test: 'Query com JOIN',
          status: 'error',
          message: `Erro na query JOIN: ${error.message}`,
          data: error
        });
      }

      // Teste 5: Verificar RLS policies
      console.log(`${CONSOLE_PREFIX} Testando políticas RLS...`);
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          testResults.push({
            test: 'RLS Authentication',
            status: 'error',
            message: 'Usuário não autenticado',
            data: null
          });
        } else {
          testResults.push({
            test: 'RLS Authentication',
            status: 'success',
            message: `Usuário autenticado: ${user.user.email}`,
            data: { userId: user.user.id, email: user.user.email }
          });
        }
      } catch (error: any) {
        testResults.push({
          test: 'RLS Authentication',
          status: 'error',
          message: `Erro de autenticação: ${error.message}`,
          data: error
        });
      }

      // Teste 6: Inserir dados de teste (se não houver dados)
      const relacionamentosExistentes = testResults.find(r => r.test === 'Tabela Empresa_Clientes');
      if (relacionamentosExistentes?.status === 'warning') {
        console.log(`${CONSOLE_PREFIX} Tentando criar dados de teste...`);
        try {
          // Primeiro verificar se existem empresas
          const { data: empresasDisponiveis } = await supabase
            .from('empresas')
            .select('id, nome, tipo')
            .limit(4);

          if (empresasDisponiveis && empresasDisponiveis.length >= 2) {
            const proprietario = empresasDisponiveis.find(e => e.tipo === 'parceiro' || e.tipo === 'intragrupo');
            const cliente = empresasDisponiveis.find(e => e.tipo === 'cliente');

            if (proprietario && cliente) {
              const { data: novoRelacionamento, error: insertError } = await supabase
                .from('empresa_clientes')
                .insert({
                  empresa_proprietaria_id: proprietario.id,
                  empresa_cliente_id: cliente.id,
                  data_relacionamento: new Date().toISOString().split('T')[0],
                  status: true,
                  observacoes: 'Relacionamento criado pelo diagnóstico'
                })
                .select()
                .single();

              if (insertError) throw insertError;

              testResults.push({
                test: 'Criação de Dados de Teste',
                status: 'success',
                message: `Relacionamento teste criado entre ${proprietario.nome} e ${cliente.nome}`,
                data: novoRelacionamento
              });
            } else {
              testResults.push({
                test: 'Criação de Dados de Teste',
                status: 'warning',
                message: 'Não foi possível criar dados de teste: faltam empresas do tipo correto',
                data: { proprietarios: empresasDisponiveis.filter(e => e.tipo === 'parceiro').length, clientes: empresasDisponiveis.filter(e => e.tipo === 'cliente').length }
              });
            }
          }
        } catch (error: any) {
          testResults.push({
            test: 'Criação de Dados de Teste',
            status: 'error',
            message: `Erro ao criar dados de teste: ${error.message}`,
            data: error
          });
        }
      }

      setResults(testResults);
      console.log(`${CONSOLE_PREFIX} Diagnóstico completo:`, testResults);

    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro geral no diagnóstico:`, error);
      testResults.push({
        test: 'Diagnóstico Geral',
        status: 'error',
        message: `Erro inesperado: ${error}`,
        data: error
      });
      setResults(testResults);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Painel de Diagnóstico da Wishlist
        </CardTitle>
        <CardDescription>
          Ferramenta de desenvolvimento para diagnosticar problemas na base de clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Diagnósticos...
            </>
          ) : (
            'Executar Diagnósticos'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {results.map((result, index) => (
              <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-medium">
                      {result.test}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {result.message}
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground">
                            Ver dados detalhados
                          </summary>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WishlistDebugPanel;
