
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useEventos } from '@/contexts/EventosContext';
import type { Evento } from '@/types/eventos';

interface EventoFormModalProps {
  open: boolean;
  onClose: () => void;
  evento?: Partial<Evento>;
}

export const EventoFormModal: React.FC<EventoFormModalProps> = ({
  open,
  onClose,
  evento
}) => {
  const { createEvento, updateEvento } = useEventos();
  const isEditing = !!evento?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<Partial<Evento>>({
    defaultValues: evento || {
      status: 'planejado'
    }
  });

  React.useEffect(() => {
    if (evento) {
      reset(evento);
    } else {
      reset({
        status: 'planejado',
        data_inicio: new Date().toISOString().slice(0, 16)
      });
    }
  }, [evento, reset]);

  const onSubmit = async (data: Partial<Evento>) => {
    try {
      if (isEditing && evento?.id) {
        await updateEvento(evento.id, data);
      } else {
        await createEvento(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input
              id="nome"
              {...register('nome', { required: 'Nome é obrigatório' })}
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              {...register('local')}
              placeholder="Ex: Centro de Convenções Rebouças"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
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
