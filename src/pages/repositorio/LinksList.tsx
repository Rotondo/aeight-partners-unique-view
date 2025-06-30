
import React, { useState } from 'react';
import { RepositorioLink, Categoria, Empresa, RepositorioTag } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, ExternalLink, Search, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LinksListProps {
  links: RepositorioLink[];
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  isLoading: boolean;
  onRefresh: () => void;
}

const LinksList: React.FC<LinksListProps> = ({
  links,
  categorias,
  parceiros,
  tags,
  isLoading,
  onRefresh,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLinks = links.filter(link =>
    link.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoriaName = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId)?.nome || 'N/A';
  };

  const getParceiroName = (empresaId: string) => {
    return parceiros.find(p => p.id === empresaId)?.nome || 'N/A';
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    
    try {
      const { error } = await supabase
        .from('repositorio_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Link removido com sucesso!',
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o link.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link className="h-5 w-5" />
          Links dos Parceiros
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8">
            <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum link encontrado' : 'Nenhum link cadastrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{link.nome}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {getCategoriaName(link.categoria_id)} - {getParceiroName(link.empresa_id)}
                      </p>
                      {link.descricao && (
                        <p className="text-xs text-muted-foreground mb-2">{link.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(link.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      {user?.papel === 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              disabled={deletingId === link.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o link "{link.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(link.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  
                  {link.tag_categoria && link.tag_categoria.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {link.tag_categoria.map((tagName, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tagName}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Adicionado em {new Date(link.data_upload).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default LinksList;
