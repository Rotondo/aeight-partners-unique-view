import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { EXTERNAL_URLS } from '@/lib/constants'; // Importar a constante

interface MaterialPreviewModalProps {
  open: boolean;
  onClose: () => void;
  nome: string;
  arquivo_upload?: string | null;
  tipo_arquivo: string;
}

// BUCKET_URL foi removido daqui

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
  const [textContent, setTextContent] = useState<string | null>(null); // Novo estado para conteúdo de texto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Novo estado para erros de fetch

  useEffect(() => {
    if (!open) {
      setPublicUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    setLoading(true);
    setTextContent(null); // Resetar conteúdo de texto
    setError(null); // Resetar erro
    const sanitizedPath = sanitizePath(arquivo_upload);

    if (sanitizedPath) {
      const url = EXTERNAL_URLS.MATERIAIS_BUCKET_PUBLIC_URL + sanitizedPath; // Usar a constante
      setPublicUrl(url);

      // Se for .txt, tentar buscar o conteúdo
      if (tipo_arquivo === 'txt' || (arquivo_upload && arquivo_upload.toLowerCase().endsWith('.txt'))) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Falha ao buscar arquivo TXT: ${response.statusText}`);
            }
            return response.text();
          })
          .then(text => {
            setTextContent(text);
            setLoading(false);
          })
          .catch(err => {
            console.error("Erro ao buscar conteúdo do TXT:", err);
            setError("Não foi possível carregar o conteúdo do arquivo de texto.");
            setLoading(false);
          });
      } else {
        setLoading(false); // Para outros tipos, só definimos a URL
      }
    } else {
      setPublicUrl(null);
      setLoading(false);
      setError("Caminho do arquivo inválido.");
    }
  }, [open, arquivo_upload, tipo_arquivo]);

  const renderPreview = () => {
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
    if (!publicUrl && !textContent) return <div className="text-center text-gray-500">Arquivo não encontrado ou inválido.</div>;

    // Priorizar textContent se disponível (para .txt)
    if (textContent !== null) {
      return (
        <pre className="w-full h-full overflow-auto whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
          {textContent}
        </pre>
      );
    }

    // Se não for .txt (ou falhou o fetch do .txt mas temos publicUrl), continuar com a lógica anterior
    if (!publicUrl) return <div className="text-center text-gray-500">URL do arquivo não disponível.</div>;


    if (
      tipo_arquivo === 'pdf' ||
      (arquivo_upload && arquivo_upload.toLowerCase().endsWith('.pdf'))
    ) {
      return (
        <iframe
          title={nome}
          src={publicUrl}
          className="w-full h-full" // Ocupar todo o espaço do contêiner pai
          style={{ border: 0 }}
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
          className="max-w-full max-h-full object-contain" // object-contain para não cortar a imagem
        />
      );
    }

    // Suporte para DOC, DOCX, XLS, XLSX via Google Docs Viewer
    if (
      tipo_arquivo === 'document' || // Genérico, pode precisar de mais refinamento
      (arquivo_upload && /\.(docx?|xlsx?|pptx?)$/i.test(arquivo_upload)) // Adicionado pptx? para o futuro
    ) {
      // PPT/PPTX também são suportados pelo Google Docs Viewer, mas o escopo inicial era DOC, XLS.
      // Incluindo PPTX para robustez, mas o foco do pedido era DOC/XLS.
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(publicUrl)}&embedded=true`;
      return (
        <iframe
          title={nome}
          src={viewerUrl}
          className="w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
        />
      );
    }

    return (
      <div className="text-center text-gray-500 p-4">
        Não é possível pré-visualizar este tipo de arquivo ({tipo_arquivo || 'desconhecido'}).<br />
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-2 inline-block"
        >
          Baixar ou abrir em nova aba
        </a>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" aria-describedby="material-preview-desc">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">Pré-visualização: {nome}</DialogTitle>
        </DialogHeader>
        <div id="material-preview-desc" className="sr-only">
          Pré-visualização do arquivo selecionado.
        </div>
        {/* Ajustado padding e altura mínima para o contêiner do preview */}
        <div className="pt-2 pb-4 px-0 md:px-2 flex-grow flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
          {loading ? (
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          ) : (
            // O renderPreview agora precisa garantir que o conteúdo preencha o espaço
            <div className="w-full h-full flex items-center justify-center">
              {renderPreview()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialPreviewModal;
