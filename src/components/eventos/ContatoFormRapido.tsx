
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useEventos } from '@/contexts/EventosContext';
import { toast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/inputValidation';

interface ContatoFormRapidoProps {
  open: boolean;
  onClose: () => void;
}

type ContatoRapidoData = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
};

export const ContatoFormRapido: React.FC<ContatoFormRapidoProps> = ({
  open,
  onClose
}) => {
  const { addContato, eventoAtivo } = useEventos();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContatoRapidoData>({
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      empresa: ''
    }
  });

  const onSubmit = async (data: ContatoRapidoData) => {
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

      // Preparar dados
      const contatoData = {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone || null,
        empresa: data.empresa || null,
        interesse_nivel: 3, // Valor padrão para contato rápido
        data_contato: new Date().toISOString()
      };

      await addContato(contatoData);
      
      toast({
        title: "Contato adicionado",
        description: `Contato rápido adicionado ao evento "${eventoAtivo.nome}"`
      });

      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar contato rápido:', error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contato Rápido - {eventoAtivo.nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              {...register('empresa')}
              placeholder="Nome da empresa"
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
              {isSubmitting ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
