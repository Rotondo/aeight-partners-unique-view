
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEventos } from '@/contexts/EventosContext';
import { logger } from '@/lib/logger';
import type { Evento } from '@/types/eventos';

interface EventoFormModalProps {
  open: boolean;
  onClose: () => void;
  evento?: Partial<Evento>;
}

type EventoFormData = {
  nome: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  descricao: string;
  status: 'planejado' | 'em_andamento' | 'finalizado' | 'cancelado';
};

export const EventoFormModal: React.FC<EventoFormModalProps> = ({
  open,
  onClose,
  evento
}) => {
  const { createEvento, updateEvento, error } = useEventos();
  const isEditing = !!evento?.id;

  // Valores padrão sempre como strings vazias - NUNCA undefined
  const defaultValues: EventoFormData = {
    nome: '',
    data_inicio: new Date().toISOString().slice(0, 16),
    data_fim: '',
    local: '',
    descricao: '',
    status: 'planejado'
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventoFormData>({
    defaultValues
  });

  React.useEffect(() => {
    if (evento && open) {
      logger.eventLog('Inicializando formulário para edição', evento.id);
      // Garantir que todos os valores sejam strings, nunca undefined
      const formData: EventoFormData = {
        nome: evento.nome || '',
        data_inicio: evento.data_inicio || new Date().toISOString().slice(0, 16),
        data_fim: evento.data_fim || '',
        local: evento.local || '',
        descricao: evento.descricao || '',
        status: evento.status || 'planejado'
      };
      reset(formData);
    } else if (open) {
      logger.eventLog('Inicializando formulário para criação');
      reset(defaultValues);
    }
  }, [evento, open, reset]);

  const onSubmit = async (data: EventoFormData) => {
    try {
      logger.eventLog('Submetendo formulário', evento?.id, data);
      
      if (isEditing && evento?.id) {
        await updateEvento(evento.id, data);
        logger.eventLog('Evento atualizado via formulário', evento.id);
      } else {
        await createEvento(data);
        logger.eventLog('Evento criado via formulário');
      }
      
      onClose();
      reset(defaultValues);
    } catch (error) {
      logger.error('EVENTOS', 'Erro ao salvar evento via formulário', error as Error);
    }
  };

  const handleClose = () => {
    logger.eventLog('Fechando formulário de evento');
    onClose();
    reset(defaultValues);
  };

  // Valores seguros para os campos controlados
  const watchedValues = {
    nome: watch('nome') || '',
    data_inicio: watch('data_inicio') || '',
    data_fim: watch('data_fim') || '',
    local: watch('local') || '',
    descricao: watch('descricao') || '',
    status: watch('status') || 'planejado'
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input
              id="nome"
              {...register('nome', { required: 'Nome é obrigatório' })}
              value={watchedValues.nome}
              placeholder="Ex: Feira de Tecnologia 2024"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                {...register('data_inicio', { required: 'Data de início é obrigatória' })}
                value={watchedValues.data_inicio}
              />
              {errors.data_inicio && (
                <p className="text-sm text-red-600">{errors.data_inicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                {...register('data_fim')}
                value={watchedValues.data_fim}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              {...register('local')}
              value={watchedValues.local}
              placeholder="Ex: Centro de Convenções Rebouças"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedValues.status}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              value={watchedValues.descricao}
              placeholder="Descreva o evento, objetivos, etc..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
