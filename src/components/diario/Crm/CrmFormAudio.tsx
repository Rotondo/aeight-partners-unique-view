
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Square, Play, Pause, Upload } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { StatusAcaoCrm, MetodoComunicacao } from '@/types/diario';

export const CrmFormAudio: React.FC = () => {
  const { createAcaoCrm } = useCrm();
  const { partners, loading: loadingPartners } = usePartners();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    content: '',
    communication_method: 'ligacao' as MetodoComunicacao,
    partner_id: 'none',
    status: 'pendente' as StatusAcaoCrm,
    next_steps: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CORREÇÃO ROBUSTA: Filtrar parceiros com validação mais rigorosa
  const validPartners = partners.filter(partner => {
    const hasValidId = partner.id && 
                      typeof partner.id === 'string' && 
                      partner.id.trim() !== '' && 
                      partner.id !== 'undefined' && 
                      partner.id !== 'null';
    const hasValidName = partner.nome && 
                        typeof partner.nome === 'string' && 
                        partner.nome.trim() !== '';
    
    console.log('[CrmFormAudio] Partner validation:', { 
      id: partner.id, 
      nome: partner.nome, 
      hasValidId, 
      hasValidName,
      isValid: hasValidId && hasValidName 
    });
    
    return hasValidId && hasValidName;
  });

  console.log('[CrmFormAudio] Total partners:', partners.length, 'Valid partners:', validPartners.length);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
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

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Upload do arquivo de áudio para o Supabase Storage
      await createAcaoCrm({
        description: formData.description,
        content: formData.content,
        communication_method: formData.communication_method,
        status: formData.status,
        partner_id: formData.partner_id === 'none' ? undefined : formData.partner_id,
        next_steps: formData.next_steps || undefined,
        // arquivo_audio: 'path/to/uploaded/audio.wav' // TODO: Implementar upload
      });

      // Reset form
      setFormData({
        description: '',
        content: '',
        communication_method: 'ligacao',
        partner_id: 'none',
        status: 'pendente',
        next_steps: ''
      });
      setAudioBlob(null);
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Gravação de áudio */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <Label className="text-sm font-medium mb-3 block">Gravação de Áudio</Label>
        
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              type="button"
              onClick={startRecording}
              variant="outline"
              size="sm"
            >
              <Mic className="h-4 w-4 mr-2" />
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

          {audioBlob && (
            <Button
              type="button"
              onClick={isPlaying ? pauseAudio : playAudio}
              variant="outline"
              size="sm"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            Gravando...
          </div>
        )}

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Reunião de alinhamento"
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
            {validPartners.map((partner) => {
              // Verificação adicional antes do render
              if (!partner.id || partner.id.trim() === '') {
                console.error('[CrmFormAudio] Skipping partner with invalid ID:', partner);
                return null;
              }
              
              console.log('[CrmFormAudio] Rendering SelectItem:', { id: partner.id, nome: partner.nome });
              return (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.nome}
                </SelectItem>
              );
            })}
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

      <Button type="submit" className="w-full" disabled={!audioBlob}>
        <Upload className="h-4 w-4 mr-2" />
        Salvar Registro
      </Button>
    </form>
  );
};
