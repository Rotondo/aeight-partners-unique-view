
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { useEventos } from '@/contexts/EventosContext';
import type { ContatoEvento } from '@/types/eventos';

interface ContatoFormRapidoProps {
  open: boolean;
  onClose: () => void;
  contato?: Partial<ContatoEvento>;
}

export const ContatoFormRapido: React.FC<ContatoFormRapidoProps> = ({
  open,
  onClose,
  contato
}) => {
  const { addContato, updateContato } = useEventos();
  const isEditing = !!contato?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<Partial<ContatoEvento>>({
    defaultValues: contato || {
      interesse_nivel: 3
    }
  });

  const interesseNivel = watch('interesse_nivel') || 3;

  React.useEffect(() => {
    if (contato) {
      reset(contato);
    } else {
      reset({
        interesse_nivel: 3
      });
    }
  }, [contato, reset]);

  const onSubmit = async (data: Partial<ContatoEvento>) => {
    try {
      if (isEditing && contato?.id) {
        await updateContato(contato.id, data);
      } else {
        await addContato(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const getInteresseLabel = (nivel: number) => {
    const labels = {
      1: 'Muito Baixo',
      2: 'Baixo', 
      3: 'Médio',
      4: 'Alto',
      5: 'Muito Alto'
    };
    return labels[nivel as keyof typeof labels] || 'Médio';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                {...register('empresa')}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              {...register('cargo')}
              placeholder="Cargo/Posição"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discussao">O que discutimos?</Label>
            <Textarea
              id="discussao"
              {...register('discussao')}
              placeholder="Resumo da conversa, pontos importantes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proximos_passos">Próximos passos</Label>
            <Textarea
              id="proximos_passos"
              {...register('proximos_passos')}
              placeholder="O que deve ser feito no follow-up..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Nível de Interesse: {getInteresseLabel(interesseNivel)}</Label>
            <Slider
              value={[interesseNivel]}
              onValueChange={(value) => setValue('interesse_nivel', value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Muito Baixo</span>
              <span>Muito Alto</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sugestao_followup">Sugestão de Follow-up</Label>
            <Input
              id="sugestao_followup"
              type="datetime-local"
              {...register('sugestao_followup')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações adicionais</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Outras informações relevantes..."
              rows={2}
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
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
