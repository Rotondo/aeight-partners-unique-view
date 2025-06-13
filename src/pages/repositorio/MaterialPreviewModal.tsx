import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MaterialPreviewModalProps {
  open: boolean;
  onClose: () => void;
  nome: string;
  arquivo_upload: string;
  tipo_arquivo: string;
}

const BUCKET_NAME = 'materiais';

const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({
  open,
  onClose,
  nome,
  arquivo_upload,
  tipo_arquivo,
}) => {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && arquivo_upload) {
      setLoading(true);
      // Tenta gerar URL assinada por 1 hora (caso bucket privado)
      supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(arquivo_upload, 3600)
        .then(({ data, error }) => {
          if (data?.signedUrl) setPublicUrl(data.signedUrl);
          else setPublicUrl(null);
        })
        .finally(() => setLoading(false));
    } else {
      setPublicUrl(null);
    }
  }, [open, arquivo_upload]);

  const renderPreview = () => {
    if (!publicUrl) return <div className="text-center text-gray-500">Arquivo não encontrado.</div>;

    if (tipo_arquivo === 'pdf' || arquivo_upload.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe
          title={nome}
          src={publicUrl}
          className="w-full"
          style={{ minHeight: 500, maxHeight: '80vh', border: 0 }}
          allowFullScreen
        />
      );
    }

    if (
      tipo_arquivo === 'image' ||
      /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(arquivo_upload)
    ) {
      return (
        <img
          src={publicUrl}
          alt={nome}
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            margin: '0 auto',
            display: 'block',
            borderRadius: 8,
          }}
        />
      );
    }

    // Para outros tipos, tenta embed ou mostra mensagem
    return (
      <div className="text-center text-gray-500">
        Não é possível pré-visualizar este tipo de arquivo.
        <br />
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Baixar/abrir arquivo em nova aba
        </a>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pré-visualização: {nome}</DialogTitle>
        </DialogHeader>
        <div className="p-2 min-h-[200px] flex items-center justify-center">
          {loading ? (
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          ) : (
            renderPreview()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPreviewModal;
