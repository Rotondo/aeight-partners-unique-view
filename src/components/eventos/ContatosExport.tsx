
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ContatoEvento } from '@/types/eventos';

interface ContatosExportProps {
  contatos: ContatoEvento[];
  eventoNome?: string;
}

export const ContatosExport: React.FC<ContatosExportProps> = ({
  contatos,
  eventoNome = 'evento'
}) => {
  const [formato, setFormato] = useState<'csv' | 'excel'>('csv');
  const [filtroInteresse, setFiltroInteresse] = useState<string>('all');
  const [camposSelecionados, setCamposSelecionados] = useState({
    nome: true,
    email: true,
    telefone: true,
    empresa: true,
    cargo: true,
    interesse_nivel: true,
    discussao: false,
    proximos_passos: true,
    observacoes: false,
    data_contato: true
  });

  const campos = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'empresa', label: 'Empresa' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'interesse_nivel', label: 'Nível de Interesse' },
    { key: 'discussao', label: 'Discussão' },
    { key: 'proximos_passos', label: 'Próximos Passos' },
    { key: 'observacoes', label: 'Observações' },
    { key: 'data_contato', label: 'Data do Contato' }
  ];

  const contatosFiltrados = contatos.filter(contato => {
    if (filtroInteresse === 'all') return true;
    if (filtroInteresse === 'alto') return contato.interesse_nivel >= 4;
    if (filtroInteresse === 'medio') return contato.interesse_nivel === 3;
    if (filtroInteresse === 'baixo') return contato.interesse_nivel <= 2;
    return true;
  });

  const toggleCampo = (campo: string) => {
    setCamposSelecionados(prev => ({
      ...prev,
      [campo]: !prev[campo as keyof typeof prev]
    }));
  };

  const exportarCSV = () => {
    const camposAtivos = campos.filter(campo => 
      camposSelecionados[campo.key as keyof typeof camposSelecionados]
    );

    const headers = camposAtivos.map(campo => campo.label);
    
    const linhas = contatosFiltrados.map(contato => 
      camposAtivos.map(campo => {
        const valor = contato[campo.key as keyof ContatoEvento];
        
        if (campo.key === 'data_contato' && valor) {
          return new Date(valor as string).toLocaleDateString('pt-BR');
        }
        
        if (campo.key === 'interesse_nivel') {
          const niveis = { 1: 'Muito Baixo', 2: 'Baixo', 3: 'Médio', 4: 'Alto', 5: 'Muito Alto' };
          return niveis[valor as keyof typeof niveis] || valor;
        }
        
        // Escapar aspas e quebras de linha para CSV
        if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"') || valor.includes('\n'))) {
          return `"${valor.replace(/"/g, '""')}"`;
        }
        
        return valor || '';
      })
    );

    const csvContent = [headers, ...linhas]
      .map(linha => linha.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contatos_${eventoNome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export realizado",
      description: `${contatosFiltrados.length} contatos exportados em formato CSV`
    });
  };

  const exportarExcel = () => {
    // Para simplicidade, vamos exportar como CSV mas com extensão .xlsx
    // Em produção, seria melhor usar uma biblioteca como xlsx
    exportarCSV();
    
    toast({
      title: "Export realizado", 
      description: `${contatosFiltrados.length} contatos exportados (formato CSV compatível com Excel)`
    });
  };

  const handleExport = () => {
    if (formato === 'csv') {
      exportarCSV();
    } else {
      exportarExcel();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Contatos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportar Contatos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato</label>
            <Select value={formato} onValueChange={(value: 'csv' | 'excel') => setFormato(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel (compatível)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrar por Interesse</label>
            <Select value={filtroInteresse} onValueChange={setFiltroInteresse}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis ({contatos.length})</SelectItem>
                <SelectItem value="alto">Alto interesse (4-5)</SelectItem>
                <SelectItem value="medio">Médio interesse (3)</SelectItem>
                <SelectItem value="baixo">Baixo interesse (1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Campos para exportar</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {campos.map(campo => (
                <div key={campo.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={campo.key}
                    checked={camposSelecionados[campo.key as keyof typeof camposSelecionados]}
                    onCheckedChange={() => toggleCampo(campo.key)}
                  />
                  <label htmlFor={campo.key} className="text-sm cursor-pointer">
                    {campo.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {contatosFiltrados.length} contatos serão exportados
            </p>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
