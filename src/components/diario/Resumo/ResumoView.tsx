
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Download, TrendingUp, Eye, Search } from 'lucide-react';
import { useResumo } from '@/contexts/ResumoContext';
import { TipoResumo } from '@/types/diario';
import { DatePicker } from '@/components/ui/date-picker';
import { ResumoDetailsModal } from './ResumoDetailsModal';

export const ResumoView: React.FC = () => {
  const { 
    resumos, 
    loadingResumos, 
    generateResumo, 
    exportResumoToPdf, 
    exportResumoToCsv 
  } = useResumo();
  
  const [tipoResumo, setTipoResumo] = useState<TipoResumo>('semanal');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResumo, setSelectedResumo] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleGenerateResumo = async () => {
    if (!dataInicio || !dataFim) return;
    
    setIsGenerating(true);
    try {
      await generateResumo(
        tipoResumo,
        dataInicio.toISOString(),
        dataFim.toISOString()
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowDetails = (resumo: any) => {
    setSelectedResumo(resumo);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Resumos com Dados Reais</h2>
          <p className="text-muted-foreground">
            Todos os números são baseados em dados verificáveis do sistema
          </p>
        </div>
      </div>

      {/* Gerador de resumos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Gerar Novo Resumo
          </CardTitle>
          <CardDescription>
            Configure o período e tipo - os dados serão extraídos em tempo real
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Resumo</label>
              <Select value={tipoResumo} onValueChange={(value) => setTipoResumo(value as TipoResumo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <DatePicker
                selected={dataInicio}
                onSelect={setDataInicio}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <DatePicker
                selected={dataFim}
                onSelect={setDataFim}
              />
            </div>
            
            <Button 
              onClick={handleGenerateResumo}
              disabled={!dataInicio || !dataFim || isGenerating}
              className="h-10"
            >
              {isGenerating ? 'Processando...' : 'Gerar com Dados Reais'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de resumos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumos Gerados com Dados Verificáveis</CardTitle>
          <CardDescription>
            Clique em "Ver Detalhes" para verificar a origem de cada número
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loadingResumos ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : resumos.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum resumo encontrado</h3>
              <p className="text-muted-foreground">
                Gere seu primeiro resumo para ver dados reais do sistema
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumos.map((resumo) => (
                <Card key={resumo.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{resumo.titulo}</h4>
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            {resumo.tipo}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Dados Reais
                          </span>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          Período: {new Date(resumo.periodo_inicio).toLocaleDateString('pt-BR')} 
                          {' até '}
                          {new Date(resumo.periodo_fim).toLocaleDateString('pt-BR')}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                               onClick={() => handleShowDetails(resumo)}>
                            <div className="text-2xl font-bold text-blue-600">
                              {resumo.total_eventos}
                            </div>
                            <p className="text-xs text-muted-foreground">Eventos</p>
                            <p className="text-xs text-blue-600 mt-1">
                              <Search className="h-3 w-3 inline mr-1" />
                              Ver detalhes
                            </p>
                          </div>
                          
                          <div className="text-center cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
                               onClick={() => handleShowDetails(resumo)}>
                            <div className="text-2xl font-bold text-green-600">
                              {resumo.total_acoes_crm}
                            </div>
                            <p className="text-xs text-muted-foreground">Ações CRM</p>
                            <p className="text-xs text-green-600 mt-1">
                              <Search className="h-3 w-3 inline mr-1" />
                              Ver detalhes
                            </p>
                          </div>
                          
                          <div className="text-center cursor-pointer hover:bg-purple-50 p-2 rounded transition-colors"
                               onClick={() => handleShowDetails(resumo)}>
                            <div className="text-2xl font-bold text-purple-600">
                              {resumo.total_parceiros_envolvidos}
                            </div>
                            <p className="text-xs text-muted-foreground">Parceiros</p>
                            <p className="text-xs text-purple-600 mt-1">
                              <Search className="h-3 w-3 inline mr-1" />
                              Ver detalhes
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded text-sm">
                          <p className="font-medium mb-1">Principais Realizações:</p>
                          <ul className="text-xs space-y-1">
                            {resumo.principais_realizacoes.slice(0, 3).map((realizacao, index) => (
                              <li key={index}>• {realizacao}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDetails(resumo)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportResumoToPdf(resumo.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportResumoToCsv(resumo.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">{resumos.length}</div>
            <p className="text-center text-muted-foreground">Total de Resumos</p>
            <p className="text-center text-xs text-green-600 mt-1">Com dados verificáveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {resumos.filter(r => r.tipo === 'mensal').length}
            </div>
            <p className="text-center text-muted-foreground">Resumos Mensais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">
              {resumos.filter(r => r.tipo === 'trimestral').length}
            </div>
            <p className="text-center text-muted-foreground">Resumos Trimestrais</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      {selectedResumo && (
        <ResumoDetailsModal
          resumoId={selectedResumo.id}
          resumo={selectedResumo}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedResumo(null);
          }}
        />
      )}
    </div>
  );
};
