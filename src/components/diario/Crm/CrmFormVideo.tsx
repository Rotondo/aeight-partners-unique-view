
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Square, Upload } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { StatusAcaoCrm, MetodoComunicacao } from '@/types/diario';

export const CrmFormVideo: React.FC = () => {
  const { createAcaoCrm } = useCrm();
  const { partners, loading: loadingPartners } = usePartners();
  
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    content: '',
    communication_method: 'reuniao_meet' as MetodoComunicacao,
    partner_id: 'none',
    status: 'pendente' as StatusAcaoCrm,
    next_steps: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);

  // CORREÇÃO: Filtrar parceiros válidos para evitar IDs vazios
  const validPartners = partners.filter(partner => partner.id && partner.id.trim() !== '');

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
        description: formData.description,
        content: formData.content,
        communication_method: formData.communication_method,
        status: formData.status,
        partner_id: formData.partner_id === 'none' ? undefined : formData.partner_id,
        next_steps: formData.next_steps || undefined,
        // arquivo_video: 'path/to/uploaded/video.webm' // TODO: Implementar upload
      });

      // Reset form
      setFormData({
        description: '',
        content: '',
        communication_method: 'reuniao_meet',
        partner_id: 'none',
        status: 'pendente',
        next_steps: ''
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

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Apresentação de proposta"
          required
        />
      </div>

      {/* Conteúdo adicional */}
      <div className="space-y-2">
        <Label htmlFor="content">Contexto/Observações</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Descreva o contexto da gravação..."
          rows={3}
          required
        />
      </div>

      {/* Parceiro */}
      <div className="space-y-2">
        <Label>Parceiro (Opcional)</Label>
        <Select value={formData.partner_id} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um parceiro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum parceiro</SelectItem>
            {validPartners.map((partner) => (
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
        <Label htmlFor="next_steps">Próximos Passos</Label>
        <Textarea
          id="next_steps"
          value={formData.next_steps}
          onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
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
