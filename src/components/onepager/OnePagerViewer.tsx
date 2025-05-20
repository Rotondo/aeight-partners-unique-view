
import React from 'react';
import { OnePager, Empresa } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, File, FileWarning, Image } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OnePagerViewerProps {
  onePager: OnePager | null;
  parceiro: Empresa | null;
  isLoading: boolean;
}

const OnePagerViewer: React.FC<OnePagerViewerProps> = ({ 
  onePager, 
  parceiro,
  isLoading 
}) => {
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-[80%] w-[90%]" />
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
        // Download from Storage
        const { data, error } = await supabase.storage
          .from('onepagers')
          .download(onePager.arquivo_upload);

        if (error) throw error;
        
        fileUrl = URL.createObjectURL(data);
        fileName = onePager.arquivo_upload.split('/').pop() || 'onepager';
      } else if (onePager.url_imagem) {
        // Download from external URL
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

    const isPdf = onePager.url_imagem?.endsWith('.pdf') || onePager.arquivo_upload?.endsWith('.pdf');
    const imageUrl = onePager.url_imagem || 
      (onePager.arquivo_upload ? 
        `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/onepagers/${onePager.arquivo_upload}` : 
        '');

    if (isPdf) {
      return (
        <div className="flex-1 flex flex-col">
          <iframe 
            src={imageUrl}
            className="flex-1 w-full h-full border rounded"
            title={`OnePager de ${parceiro.nome}`}
          />
        </div>
      );
    } else {
      return (
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img 
            src={imageUrl} 
            alt={`OnePager de ${parceiro.nome}`} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-lg">
          {parceiro ? `OnePager: ${parceiro.nome}` : 'OnePager'}
        </h3>
        
        {onePager && (
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

      {renderContent()}
    </div>
  );
};

export default OnePagerViewer;
