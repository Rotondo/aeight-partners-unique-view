
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContatosList } from './ContatosList';
import { useEventos } from '@/contexts/EventosContext';
import { Download, Filter, Users } from 'lucide-react';
import type { ContatoEvento } from '@/types/eventos';

export const ContatosColetados: React.FC = () => {
  const { eventos } = useEventos();
  const [eventoFilter, setEventoFilter] = useState<string>('all');
  const [interesseFilter, setInteresseFilter] = useState<string>('all');

  // Consolidar todos os contatos de todos os eventos
  const todosContatos: (ContatoEvento & { evento_nome: string })[] = eventos.flatMap(evento =>
    evento.contatos.map(contato => ({
      ...contato,
      evento_nome: evento.nome
    }))
  );

  // Aplicar filtros
  const contatosFiltrados = todosContatos.filter(contato => {
    if (eventoFilter !== 'all' && contato.evento_id !== eventoFilter) {
      return false;
    }
    if (interesseFilter !== 'all' && contato.interesse_nivel !== parseInt(interesseFilter)) {
      return false;
    }
    return true;
  });

  const exportarContatos = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Evento', 'Interesse', 'Discussão', 'Próximos Passos'].join(','),
      ...contatosFiltrados.map(contato => [
        contato.nome || '',
        contato.email || '',
        contato.telefone || '',
        contato.empresa || '',
        contato.cargo || '',
        contato.evento_nome,
        contato.interesse_nivel.toString(),
        `"${contato.discussao || ''}"`,
        `"${contato.proximos_passos || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contatos_eventos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Todos os Contatos ({contatosFiltrados.length})
            </CardTitle>
            <Button onClick={exportarContatos} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            
            <Select value={eventoFilter} onValueChange={setEventoFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {eventos.map(evento => (
                  <SelectItem key={evento.id} value={evento.id}>
                    {evento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={interesseFilter} onValueChange={setInteresseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por interesse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="5">Muito Alto</SelectItem>
                <SelectItem value="4">Alto</SelectItem>
                <SelectItem value="3">Médio</SelectItem>
                <SelectItem value="2">Baixo</SelectItem>
                <SelectItem value="1">Muito Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ContatosList contatos={contatosFiltrados} />
    </div>
  );
};
