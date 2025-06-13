import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface MaterialPreviewModalProps {
  open: boolean;
  onClose: () => void;
  nome: string;
  arquivo_upload?: string | null;
  tipo_arquivo: string;
}

const BUCKET_URL = "https://amuadbftctnmckncgeua.supabase.co/storage/v1/object/public/materiais/";

function sanitizePath(path: string | undefined | null): string | null {
  if (!path || typeof path !== 'string') return null;
  return path.replace(/^\/+/, '').trim();
}

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
    if (!open) {
      setPublicUrl(null);
      return;
    }

    const sanitizedPath = sanitizePath(arquivo_upload);

    if (sanitizedPath) {
      setLoading(true);
      setPublicUrl(BUCKET_URL + sanitizedPath);
      setLoading(false);
    } else {
      setPublicUrl(null);
    }
  }, [open, arquivo_upload]);

  const renderPreview = () => {
    if (!publicUrl) return <div className="text-center text-gray-500">Arquivo não encontrado.</div>;

    if (
      tipo_arquivo === 'pdf' ||
      (arquivo_upload && arquivo_upload.toLowerCase().endsWith('.pdf'))
    ) {
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
      (arquivo_upload && /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(arquivo_upload))
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

    return (
      <div className="text-center text-gray-500">
        Não é possível pré-visualizar este tipo de arquivo.<br />
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
      <DialogContent className="max-w-3xl" aria-describedby="material-preview-desc">
        <DialogHeader>
          <DialogTitle>Pré-visualização: {nome}</DialogTitle>
        </DialogHeader>
        <div id="material-preview-desc" className="sr-only">
          Pré-visualização do arquivo selecionado.
        </div>
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
