
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Square, Upload } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { StatusAcaoCrm } from '@/types/diario';

export const CrmFormVideo: React.FC = () => {
  const { createAcaoCrm } = useCrm();
  const { partners, loading: loadingPartners } = usePartners();
  
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    parceiroId: '',
    status: 'pendente' as StatusAcaoCrm,
    proximosPassos: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Upload do arquivo de vídeo para o Supabase Storage
      await createAcaoCrm({
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: 'video',
        status: formData.status,
        parceiro_id: formData.parceiroId || undefined,
        proximos_passos: formData.proximosPassos || undefined,
        // arquivo_video: 'path/to/uploaded/video.webm' // TODO: Implementar upload
      });

      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        parceiroId: '',
        status: 'pendente',
        proximosPassos: ''
      });
      setVideoBlob(null);
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Gravação de vídeo */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <Label className="text-sm font-medium mb-3 block">Gravação de Vídeo</Label>
        
        {/* Preview/Playback */}
        <div className="mb-4">
          {isRecording ? (
            <video
              ref={previewRef}
              className="w-full h-48 bg-black rounded-lg"
              autoPlay
              muted
            />
          ) : videoBlob ? (
            <video
              ref={videoRef}
              className="w-full h-48 bg-black rounded-lg"
              controls
              src={URL.createObjectURL(videoBlob)}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum vídeo gravado</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              type="button"
              onClick={startRecording}
              variant="outline"
              size="sm"
            >
              <Video className="h-4 w-4 mr-2" />
              Iniciar Gravação
            </Button>
          ) : (
            <Button
              type="button"
              onClick={stopRecording}
              variant="destructive"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Parar Gravação
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            Gravando...
          </div>
        )}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Ex: Apresentação de proposta"
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o contexto da gravação..."
          rows={3}
          required
        />
      </div>

      {/* Parceiro */}
      <div className="space-y-2">
        <Label>Parceiro (Opcional)</Label>
        <Select value={formData.parceiroId} onValueChange={(value) => setFormData({ ...formData, parceiroId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um parceiro" />
          </SelectTrigger>
          <SelectContent>
            {partners.map((partner) => (
              <SelectItem key={partner.id} value={partner.id}>
                {partner.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as StatusAcaoCrm })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Próximos passos */}
      <div className="space-y-2">
        <Label htmlFor="proximos_passos">Próximos Passos</Label>
        <Textarea
          id="proximos_passos"
          value={formData.proximosPassos}
          onChange={(e) => setFormData({ ...formData, proximosPassos: e.target.value })}
          placeholder="Defina as próximas ações..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!videoBlob}>
        <Upload className="h-4 w-4 mr-2" />
        Salvar Registro
      </Button>
    </form>
  );
};
