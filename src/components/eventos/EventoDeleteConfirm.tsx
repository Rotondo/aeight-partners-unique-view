
import React from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventoDeleteConfirmProps {
  evento: any;
  onConfirm: (eventoId: string) => Promise<void>;
  loading?: boolean;
}

export const EventoDeleteConfirm: React.FC<EventoDeleteConfirmProps> = ({
  evento,
  onConfirm,
  loading = false
}) => {
  const handleConfirm = async () => {
    await onConfirm(evento.id);
  };

  return (
    <ConfirmDialog
      title="Excluir Evento?"
      description={`Tem certeza que deseja excluir o evento "${evento.nome}"? Esta ação não pode ser desfeita e todos os contatos coletados serão perdidos.`}
      onConfirm={handleConfirm}
      confirmText={loading ? "Excluindo..." : "Excluir"}
      cancelText="Cancelar"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </ConfirmDialog>
  );
};
