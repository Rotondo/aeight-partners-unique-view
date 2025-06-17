
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ContatoFormRapido } from './ContatoFormRapido';
import { useEventos } from '@/contexts/EventosContext';
import { Edit, Trash2, Search, Mail, Phone, Building, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ContatoEvento } from '@/types/eventos';

interface ContatosListProps {
  contatos: ContatoEvento[];
}

export const ContatosList: React.FC<ContatosListProps> = ({ contatos }) => {
  const { deleteContato } = useEventos();
  const [search, setSearch] = useState('');
  const [editingContato, setEditingContato] = useState<ContatoEvento | null>(null);

  const filteredContatos = contatos.filter(contato =>
    contato.nome?.toLowerCase().includes(search.toLowerCase()) ||
    contato.empresa?.toLowerCase().includes(search.toLowerCase()) ||
    contato.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInteresseBadge = (nivel: number) => {
    const variants = {
      1: 'destructive',
      2: 'secondary', 
      3: 'default',
      4: 'default',
      5: 'default'
    } as const;

    const labels = {
      1: 'Muito Baixo',
      2: 'Baixo',
      3: 'Médio', 
      4: 'Alto',
      5: 'Muito Alto'
    };

    return (
      <Badge variant={variants[nivel as keyof typeof variants] || 'default'}>
        {labels[nivel as keyof typeof labels] || 'Médio'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Contatos Coletados ({contatos.length})
            </CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, empresa ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {filteredContatos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            {search ? (
              <>
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum contato encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os termos de busca
                </p>
              </>
            ) : (
              <>
                <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum contato coletado ainda
                </h3>
                <p className="text-gray-600">
                  Os contatos aparecerão aqui conforme você os adicionar
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContatos.map((contato) => (
            <Card key={contato.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {contato.nome || 'Nome não informado'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatDistanceToNow(new Date(contato.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getInteresseBadge(contato.interesse_nivel)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingContato(contato)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este contato?')) {
                          deleteContato(contato.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {contato.empresa && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{contato.empresa}</span>
                      {contato.cargo && <span>• {contato.cargo}</span>}
                    </div>
                  )}

                  {contato.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{contato.email}</span>
                    </div>
                  )}

                  {contato.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{contato.telefone}</span>
                    </div>
                  )}

                  {contato.sugestao_followup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Follow-up: {new Date(contato.sugestao_followup).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {contato.discussao && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Discussão:</p>
                    <p className="text-sm text-gray-600">{contato.discussao}</p>
                  </div>
                )}

                {contato.proximos_passos && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Próximos passos:</p>
                    <p className="text-sm text-gray-600">{contato.proximos_passos}</p>
                  </div>
                )}

                {contato.observacoes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
                    <p className="text-sm text-gray-600">{contato.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContatoFormRapido
        open={!!editingContato}
        onClose={() => setEditingContato(null)}
        contato={editingContato || undefined}
      />
    </div>
  );
};
