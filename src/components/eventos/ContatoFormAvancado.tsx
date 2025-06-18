
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { useEventos } from '@/contexts/EventosContext';
import { toast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/inputValidation';
import type { ContatoEvento } from '@/types/eventos';

interface ContatoFormAvancadoProps {
  open: boolean;
  onClose: () => void;
  contato?: Partial<ContatoEvento>;
}

type ContatoFormData = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  discussao: string;
  proximos_passos: string;
  interesse_nivel: number;
  observacoes: string;
};

export const ContatoFormAvancado: React.FC<ContatoFormAvancadoProps> = ({
  open,
  onClose,
  contato
}) => {
  const { addContato, updateContato, eventoAtivo } = useEventos();
  const isEditing = !!contato?.id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ContatoFormData>({
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      cargo: '',
      discussao: '',
      proximos_passos: '',
      interesse_nivel: 3,
      observacoes: ''
    }
  });

  const interesseNivel = watch('interesse_nivel');

  React.useEffect(() => {
    if (contato && open) {
      reset({
        nome: contato.nome || '',
        email: contato.email || '',
        telefone: contato.telefone || '',
        empresa: contato.empresa || '',
        cargo: contato.cargo || '',
        discussao: contato.discussao || '',
        proximos_passos: contato.proximos_passos || '',
        interesse_nivel: contato.interesse_nivel || 3,
        observacoes: contato.observacoes || ''
      });
    }
  }, [contato, open, reset]);

  const onSubmit = async (data: ContatoFormData) => {
    try {
      // Verificar se há evento ativo
      if (!eventoAtivo) {
        toast({
          title: "Erro",
          description: "Nenhum evento está ativo. Ative um evento primeiro.",
          variant: "destructive"
        });
        return;
      }

      // Validação de email
      if (data.email && !validateEmail(data.email)) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados, removendo campos vazios que podem causar erro
      const contatoData = {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        empresa: data.empresa || null,
        cargo: data.cargo || null,
        discussao: data.discussao || null,
        proximos_passos: data.proximos_passos || null,
        interesse_nivel: data.interesse_nivel,
        observacoes: data.observacoes || null,
        data_contato: new Date().toISOString()
      };

      if (isEditing && contato?.id) {
        await updateContato(contato.id, contatoData);
        toast({
          title: "Contato atualizado",
          description: "As informações do contato foram atualizadas com sucesso"
        });
      } else {
        await addContato(contatoData);
        toast({
          title: "Contato adicionado",
          description: `Contato adicionado ao evento "${eventoAtivo.nome}"`
        });
      }

      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o contato. Tente novamente.",
        variant: "destructive"
      });
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

  // Se não há evento ativo, mostrar aviso
  if (!eventoAtivo) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nenhum evento ativo</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Para cadastrar contatos, você precisa ativar um evento primeiro.
            </p>
            <Button onClick={handleClose}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contato' : `Novo Contato - ${eventoAtivo.nome}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                {...register('nome', { required: 'Nome é obrigatório' })}
                placeholder="Nome completo"
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
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
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              {...register('cargo')}
              placeholder="Ex: Diretor de Marketing"
            />
          </div>

          <div className="space-y-2">
            <Label>Nível de Interesse: {getInteresseLabel(interesseNivel)}</Label>
            <Slider
              value={[interesseNivel]}
              onValueChange={(value) => setValue('interesse_nivel', value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Muito Baixo</span>
              <span>Muito Alto</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discussao">Discussão/Conversa</Label>
            <Textarea
              id="discussao"
              {...register('discussao')}
              placeholder="O que foi conversado? Principais pontos discutidos..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proximos_passos">Próximos Passos</Label>
            <Textarea
              id="proximos_passos"
              {...register('proximos_passos')}
              placeholder="Qual o próximo passo definido? Follow-up..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais, contexto..."
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
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
