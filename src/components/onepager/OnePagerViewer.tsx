
import React, { useState, useEffect } from 'react';
import { OnePager, Empresa } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, File, FileWarning, ExternalLink, Users, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OnePagerViewerProps {
  onePager: OnePager | null;
  parceiro: Empresa | null;
  isLoading: boolean;
}

const OnePagerViewer: React.FC<OnePagerViewerProps> = ({
  onePager,
  parceiro,
  isLoading,
}) => {
  const { toast } = useToast();
  const [clientesAssociados, setClientesAssociados] = useState<Empresa[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Carrega clientes associados quando OnePager muda
  useEffect(() => {
    if (onePager?.id) {
      fetchClientesAssociados(onePager.id);
    } else {
      setClientesAssociados([]);
    }
  }, [onePager?.id]);

  const fetchClientesAssociados = async (onepagerId: string) => {
    setLoadingClientes(true);
    try {
      const { data, error } = await supabase
        .from('onepager_clientes')
        .select(`
          cliente_id,
          empresas!onepager_clientes_cliente_id_fkey (
            id,
            nome,
            tipo
          )
        `)
        .eq('onepager_id', onepagerId);
      
      if (error) throw error;
      
      if (data) {
        const clientes = data
          .map(item => item.empresas)
          .filter(Boolean) as Empresa[];
        setClientesAssociados(clientes);
      }
    } catch (error) {
      console.error('Error fetching clientes associados:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!onePager) return;

    try {
      let fileUrl;
      let fileName;

      if (onePager.arquivo_upload) {
        const { data, error } = await supabase.storage
          .from('onepagers')
          .download(onePager.arquivo_upload);

        if (error) throw error;

        fileUrl = URL.createObjectURL(data);
        fileName = onePager.arquivo_upload.split('/').pop() || 'onepager';
      } else if (onePager.url_imagem) {
        const response = await fetch(onePager.url_imagem);
        const blob = await response.blob();
        fileUrl = URL.createObjectURL(blob);
        fileName = onePager.url_imagem.split('/').pop() || 'onepager';
      } else {
        throw new Error('No file available to download');
      }

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o arquivo.',
        variant: 'destructive',
      });
    }
  };

  const renderStructuredContent = () => {
    if (!onePager) return null;

    return (
      <div className="space-y-6">
        {/* Cabeçalho com informações básicas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {onePager.nome || parceiro?.nome}
                {onePager.nota_quadrante && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {onePager.nota_quadrante}
                  </Badge>
                )}
              </CardTitle>
              {onePager.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(onePager.url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Site
                </Button>
              )}
            </div>
          </CardHeader>
          {(onePager.icp || onePager.oferta) && (
            <CardContent className="space-y-4">
              {onePager.icp && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">ICP (Ideal Customer Profile)</h4>
                  <p className="text-sm text-muted-foreground">{onePager.icp}</p>
                </div>
              )}
              {onePager.oferta && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Oferta</h4>
                  <p className="text-sm text-muted-foreground">{onePager.oferta}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Diferenciais e Cases */}
        {(onePager.diferenciais || onePager.cases_sucesso) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diferenciais e Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {onePager.diferenciais && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Diferenciais</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{onePager.diferenciais}</p>
                </div>
              )}
              {onePager.cases_sucesso && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Cases de Sucesso</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{onePager.cases_sucesso}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Big Numbers e Pontos Fortes/Fracos */}
        {(onePager.big_numbers || onePager.ponto_forte || onePager.ponto_fraco) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {onePager.big_numbers && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Big Numbers</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{onePager.big_numbers}</p>
                </div>
              )}
              
              {(onePager.ponto_forte || onePager.ponto_fraco) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onePager.ponto_forte && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-800 mb-1">Ponto Forte</h4>
                      <p className="text-sm text-green-700">{onePager.ponto_forte}</p>
                    </div>
                  )}
                  {onePager.ponto_fraco && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-sm text-orange-800 mb-1">Ponto de Atenção</h4>
                      <p className="text-sm text-orange-700">{onePager.ponto_fraco}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contato */}
        {(onePager.contato_nome || onePager.contato_email || onePager.contato_telefone) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onePager.contato_nome && (
                  <p className="text-sm"><span className="font-medium">Nome:</span> {onePager.contato_nome}</p>
                )}
                {onePager.contato_email && (
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> 
                    <a href={`mailto:${onePager.contato_email}`} className="ml-1 text-blue-600 hover:underline">
                      {onePager.contato_email}
                    </a>
                  </p>
                )}
                {onePager.contato_telefone && (
                  <p className="text-sm">
                    <span className="font-medium">Telefone:</span> 
                    <a href={`tel:${onePager.contato_telefone}`} className="ml-1 text-blue-600 hover:underline">
                      {onePager.contato_telefone}
                    </a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clientes A&eight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes A&eight
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingClientes ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : clientesAssociados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {clientesAssociados.map((cliente) => (
                  <Badge key={cliente.id} variant="secondary">
                    {cliente.nome}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum cliente A&eight associado a este parceiro
              </p>
            )}
          </CardContent>
        </Card>

        {/* Arquivo/Imagem */}
        {(onePager.url_imagem || onePager.arquivo_upload) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Arquivo OnePager</CardTitle>
            </CardHeader>
            <CardContent>
              {renderFileContent()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderFileContent = () => {
    if (!onePager || (!onePager.url_imagem && !onePager.arquivo_upload)) {
      return null;
    }

    const isPdf =
      onePager.url_imagem?.toLowerCase().endsWith('.pdf') ||
      onePager.arquivo_upload?.toLowerCase().endsWith('.pdf');

    let publicUrl = '';
    if (onePager.arquivo_upload) {
      const { data } = supabase.storage
        .from('onepagers')
        .getPublicUrl(onePager.arquivo_upload);
      publicUrl = data?.publicUrl || '';
    } else if (onePager.url_imagem) {
      publicUrl = onePager.url_imagem;
    }

    if (!publicUrl) {
      return <p className="text-sm text-muted-foreground">Arquivo não encontrado.</p>;
    }

    if (isPdf) {
      return (
        <div className="space-y-2">
          <iframe
            src={publicUrl}
            className="w-full h-96 border rounded"
            title={`OnePager de ${parceiro?.nome}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(publicUrl, '_blank')}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir PDF em nova aba
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <img
            src={publicUrl}
            alt={`OnePager de ${parceiro?.nome}`}
            className="max-w-full max-h-96 object-contain rounded border"
          />
        </div>
      );
    }
  };

  const renderContent = () => {
    if (!parceiro) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <File size={48} className="mx-auto mb-4" />
            <p>Selecione um parceiro para visualizar o OnePager</p>
          </div>
        </div>
      );
    }

    if (!onePager) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileWarning size={48} className="mx-auto mb-4" />
            <p>Nenhum OnePager disponível para este parceiro</p>
          </div>
        </div>
      );
    }

    return renderStructuredContent();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-lg">
          {parceiro ? `OnePager: ${parceiro.nome}` : 'OnePager'}
        </h3>

        {onePager && (onePager.url_imagem || onePager.arquivo_upload) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center"
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default OnePagerViewer;
