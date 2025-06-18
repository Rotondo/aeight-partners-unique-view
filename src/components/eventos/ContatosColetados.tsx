
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContatosList } from './ContatosList';
import { ContatosFilters } from './ContatosFilters';
import { ContatosExport } from './ContatosExport';
import { useEventos } from '@/contexts/EventosContext';
import { Users } from 'lucide-react';
import type { ContatoEvento } from '@/types/eventos';

export const ContatosColetados: React.FC = () => {
  const { eventos } = useEventos();
  const [searchTerm, setSearchTerm] = useState('');
  const [interesseFilter, setInteresseFilter] = useState('all');
  const [empresaFilter, setEmpresaFilter] = useState('all');

  // Consolidar todos os contatos de todos os eventos
  const todosContatos: (ContatoEvento & { evento_nome: string })[] = eventos.flatMap(evento =>
    evento.contatos.map(contato => ({
      ...contato,
      evento_nome: evento.nome
    }))
  );

  // Obter empresas únicas
  const empresasDisponiveis = Array.from(
    new Set(todosContatos.filter(c => c.empresa).map(c => c.empresa!))
  ).sort();

  // Aplicar filtros
  const contatosFiltrados = todosContatos.filter(contato => {
    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        (contato.nome?.toLowerCase().includes(term)) ||
        (contato.email?.toLowerCase().includes(term)) ||
        (contato.empresa?.toLowerCase().includes(term)) ||
        (contato.cargo?.toLowerCase().includes(term)) ||
        (contato.evento_nome.toLowerCase().includes(term));
      
      if (!matchSearch) return false;
    }

    // Filtro de interesse
    if (interesseFilter !== 'all' && contato.interesse_nivel !== parseInt(interesseFilter)) {
      return false;
    }

    // Filtro de empresa
    if (empresaFilter !== 'all' && contato.empresa !== empresaFilter) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setInteresseFilter('all');
    setEmpresaFilter('all');
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
            <ContatosExport 
              contatos={contatosFiltrados} 
              eventoNome="todos_eventos"
            />
          </div>
        </CardHeader>

        <CardContent>
          <ContatosFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            interesseFilter={interesseFilter}
            onInteresseChange={setInteresseFilter}
            empresaFilter={empresaFilter}
            onEmpresaChange={setEmpresaFilter}
            empresasDisponiveis={empresasDisponiveis}
            onClearFilters={clearFilters}
            totalContatos={todosContatos.length}
            contatosFiltrados={contatosFiltrados.length}
          />
        </CardContent>
      </Card>

      <ContatosList contatos={contatosFiltrados} />
    </div>
  );
};
