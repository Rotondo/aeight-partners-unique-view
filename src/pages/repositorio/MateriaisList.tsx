
import React, { useState } from 'react';
import { RepositorioMaterial, Categoria, Empresa, RepositorioTag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MaterialEditModal from './MaterialEditModal';

interface MateriaisListProps {
  materiais: RepositorioMaterial[];
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  isLoading: boolean;
  onRefresh: () => void;
}

const MateriaisList: React.FC<MateriaisListProps> = ({
  materiais,
  categorias,
  parceiros,
  tags,
  isLoading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');
  const [selectedParceiro, setSelectedParceiro] = useState<string>('all');
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  const [editingMaterial, setEditingMaterial] = useState<RepositorioMaterial | null>(null);

  // Filtrar materiais
  const filteredMateriais = materiais.filter((material) => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === 'all' || material.categoria_id === selectedCategoria;
    const matchesParceiro = selectedParceiro === 'all' || material.empresa_id === selectedParceiro;
    const matchesTipo = selectedTipo === 'all' || material.tipo_arquivo === selectedTipo;

    return matchesSearch && matchesCategoria && matchesParceiro && matchesTipo;
  });

  const handleDownload = async (material: RepositorioMaterial) => {
    try {
      // Implementar download do arquivo
      console.log('Download material:', material);
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const getCategoriaName = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria?.nome || 'Categoria não encontrada';
  };

  const getParceiroName = (empresaId: string) => {
    const parceiro = parceiros.find(p => p.id === empresaId);
    return parceiro?.nome || 'Parceiro não encontrado';
  };

  const getTagInfo = (tagName: string) => {
    const tag = tags.find(t => t.nome === tagName);
    return tag || { nome: tagName, cor: '#gray' };
  };

  const renderFileIcon = (tipoArquivo: string) => {
    if (tipoArquivo.toLowerCase().includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (isLoading) {
    return <div>Carregando materiais...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedParceiro} onValueChange={setSelectedParceiro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os parceiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os parceiros</SelectItem>
                  {parceiros.map((parceiro) => (
                    <SelectItem key={parceiro.id} value={parceiro.id}>
                      {parceiro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      <div className="grid gap-4">
        {filteredMateriais.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Nenhum material encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMateriais.map((material) => (
            <Card key={material.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {renderFileIcon(material.tipo_arquivo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2">{material.nome}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Categoria:</span>
                          {getCategoriaName(material.categoria_id)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Parceiro:</span>
                          {getParceiroName(material.empresa_id)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Upload: {format(new Date(material.data_upload), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        {material.validade_contrato && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Validade: {format(new Date(material.validade_contrato), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        )}
                      </div>

                      {material.tag_categoria && material.tag_categoria.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {material.tag_categoria.map((tagName, index) => {
                            const tagInfo = getTagInfo(tagName);
                            return (
                              <Badge
                                key={index}
                                style={{ backgroundColor: tagInfo.cor }}
                                className="text-white text-xs"
                              >
                                {tagInfo.nome}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMaterial(material)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(material)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição */}
      {editingMaterial && (
        <MaterialEditModal
          material={editingMaterial}
          categorias={categorias}
          parceiros={parceiros}
          tags={tags}
          onClose={() => setEditingMaterial(null)}
          onSuccess={() => {
            setEditingMaterial(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default MateriaisList;
