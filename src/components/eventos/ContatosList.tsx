
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContatoFormAvancado } from './ContatoFormAvancado';
import { ContatoLoadingSkeleton } from './ContatoLoadingSkeleton';
import { useEventos } from '@/contexts/EventosContext';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Calendar,
  MessageSquare,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import type { ContatoEvento } from '@/types/eventos';

interface ContatosListProps {
  contatos: (ContatoEvento & { evento_nome?: string })[];
}

export const ContatosList: React.FC<ContatosListProps> = ({ contatos }) => {
  const { deleteContato } = useEventos();
  const [editingContato, setEditingContato] = useState<any>(null);
  const [deletingContatoId, setDeletingContatoId] = useState<string | null>(null);

  const getInteresseBadge = (nivel: number) => {
    const configs = {
      1: { label: 'Muito Baixo', variant: 'destructive' as const },
      2: { label: 'Baixo', variant: 'secondary' as const },
      3: { label: 'Médio', variant: 'default' as const },
      4: { label: 'Alto', variant: 'default' as const },
      5: { label: 'Muito Alto', variant: 'default' as const }
    };

    const config = configs[nivel as keyof typeof configs] || configs[3];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleDeleteContato = async (contatoId: string) => {
    try {
      setDeletingContatoId(contatoId);
      await deleteContato(contatoId);
      toast({
        title: "Contato excluído",
        description: "O contato foi removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o contato. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeletingContatoId(null);
    }
  };

  if (contatos.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum contato encontrado
          </h3>
          <p className="text-gray-600">
            Os contatos aparecerão aqui conforme forem coletados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contatos.map((contato) => (
        <Card key={contato.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {contato.nome || 'Nome não informado'}
                </CardTitle>
                {contato.evento_nome && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Evento: {contato.evento_nome}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getInteresseBadge(contato.interesse_nivel || 3)}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingContato(contato)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title="Excluir Contato?"
                    description={`Tem certeza que deseja excluir o contato de ${contato.nome || 'contato sem nome'}? Esta ação não pode ser desfeita.`}
                    onConfirm={() => handleDeleteContato(contato.id)}
                    confirmText={deletingContatoId === contato.id ? "Excluindo..." : "Excluir"}
                    cancelText="Cancelar"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingContatoId === contato.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {contato.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${contato.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contato.email}
                    </a>
                  </div>
                )}

                {contato.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`tel:${contato.telefone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contato.telefone}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {contato.empresa && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{contato.empresa}</span>
                  </div>
                )}

                {contato.cargo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{contato.cargo}</span>
                  </div>
                )}
              </div>
            </div>

            {contato.discussao && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Discussão</p>
                    <p className="text-sm text-gray-700 mt-1">{contato.discussao}</p>
                  </div>
                </div>
              </div>
            )}

            {contato.proximos_passos && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-blue-800">Próximos Passos</p>
                    <p className="text-sm text-blue-700 mt-1">{contato.proximos_passos}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                Coletado em {new Date(contato.data_contato).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <ContatoFormAvancado
        open={!!editingContato}
        onClose={() => setEditingContato(null)}
        contato={editingContato}
      />
    </div>
  );
};
