
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { IndicadoresParceiro, Empresa, TamanhoEmpresa } from "@/types";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const IndicadoresList: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresParceiro[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIndicadores, setFilteredIndicadores] = useState<IndicadoresParceiro[]>([]);
  
  const [currentIndicador, setCurrentIndicador] = useState<Partial<IndicadoresParceiro>>({
    empresa_id: "",
    potencial_leads: 0,
    base_clientes: undefined,
    engajamento: 0,
    alinhamento: 0,
    potencial_investimento: 0,
    tamanho: "M",
    score_x: undefined,
    score_y: undefined,
    data_avaliacao: new Date().toISOString()
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredIndicadores(indicadores);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredIndicadores(
        indicadores.filter(indicador => {
          const empresa = empresas.find(e => e.id === indicador.empresa_id);
          return empresa && empresa.nome.toLowerCase().includes(lowercasedTerm);
        })
      );
    }
  }, [searchTerm, indicadores, empresas]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .eq('tipo', 'parceiro')
        .order('nome');
      
      if (empresasError) throw empresasError;
      setEmpresas(empresasData || []);
      
      // Buscar indicadores
      const { data: indicadoresData, error: indicadoresError } = await supabase
        .from('indicadores_parceiro')
        .select('*');
      
      if (indicadoresError) throw indicadoresError;
      setIndicadores(indicadoresData || []);
      setFilteredIndicadores(indicadoresData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (indicador?: IndicadoresParceiro) => {
    if (indicador) {
      setCurrentIndicador(indicador);
      setIsEditing(true);
    } else {
      setCurrentIndicador({
        empresa_id: "",
        potencial_leads: 0,
        base_clientes: undefined,
        engajamento: 0,
        alinhamento: 0,
        potencial_investimento: 0,
        tamanho: "M",
        score_x: undefined,
        score_y: undefined,
        data_avaliacao: new Date().toISOString()
      });
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentIndicador({
      empresa_id: "",
      potencial_leads: 0,
      base_clientes: undefined,
      engajamento: 0,
      alinhamento: 0,
      potencial_investimento: 0,
      tamanho: "M",
      score_x: undefined,
      score_y: undefined,
      data_avaliacao: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentIndicador.empresa_id) {
      toast({
        title: "Erro",
        description: "Empresa é um campo obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validar valores numéricos
    if (
      currentIndicador.potencial_leads === undefined ||
      currentIndicador.engajamento === undefined ||
      currentIndicador.alinhamento === undefined ||
      currentIndicador.potencial_investimento === undefined ||
      !currentIndicador.tamanho
    ) {
      toast({
        title: "Erro",
        description: "Todos os campos de avaliação são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Calcular scoreX e scoreY para posicionamento no quadrante
    // Exemplo simplificado - normalmente seria um cálculo mais complexo
    const scoreX = (currentIndicador.potencial_leads + (currentIndicador.base_clientes || 0)) / 2;
    const scoreY = (currentIndicador.engajamento + currentIndicador.alinhamento) / 2;

    try {
      const dataToSave = {
        empresa_id: currentIndicador.empresa_id,
        potencial_leads: currentIndicador.potencial_leads,
        base_clientes: currentIndicador.base_clientes,
        engajamento: currentIndicador.engajamento,
        alinhamento: currentIndicador.alinhamento,
        potencial_investimento: currentIndicador.potencial_investimento,
        tamanho: currentIndicador.tamanho,
        score_x: scoreX,
        score_y: scoreY,
        data_avaliacao: new Date().toISOString()
      };

      if (isEditing && currentIndicador.id) {
        // Atualizar indicador
        const { error } = await supabase
          .from('indicadores_parceiro')
          .update(dataToSave)
          .eq('id', currentIndicador.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Indicador atualizado com sucesso!",
        });
      } else {
        // Criar indicador
        const { error } = await supabase
          .from('indicadores_parceiro')
          .insert(dataToSave);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Indicador criado com sucesso!",
        });
      }
      
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar indicador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o indicador.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('indicadores_parceiro')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Indicador excluído com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir indicador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o indicador.",
        variant: "destructive",
      });
    }
  };

  const getEmpresaNome = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : "-";
  };

  const getTamanhoBadge = (tamanho: TamanhoEmpresa) => {
    switch (tamanho) {
      case 'PP':
        return <Badge variant="outline">PP</Badge>;
      case 'P':
        return <Badge variant="outline">P</Badge>;
      case 'M':
        return <Badge>M</Badge>;
      case 'G':
        return <Badge className="bg-blue-500">G</Badge>;
      case 'GG':
        return <Badge className="bg-purple-500">GG</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Indicadores de Parceiros</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Indicador
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filteredIndicadores.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum indicador encontrado." : "Nenhum indicador cadastrado."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Potencial</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Alinhamento</TableHead>
                  <TableHead>Data Avaliação</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicadores.map((indicador) => (
                  <TableRow key={indicador.id}>
                    <TableCell className="font-medium">{getEmpresaNome(indicador.empresa_id)}</TableCell>
                    <TableCell>{getTamanhoBadge(indicador.tamanho)}</TableCell>
                    <TableCell>{indicador.potencial_leads}</TableCell>
                    <TableCell>{indicador.engajamento}</TableCell>
                    <TableCell>{indicador.alinhamento}</TableCell>
                    <TableCell>{formatDate(indicador.data_avaliacao)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenForm(indicador)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Confirmar exclusão"
                          description="Tem certeza que deseja excluir este indicador?"
                          onConfirm={() => handleDelete(indicador.id)}
                        >
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Indicador" : "Novo Indicador"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa Parceira</Label>
              <Select
                value={currentIndicador.empresa_id}
                onValueChange={(value) => 
                  setCurrentIndicador({...currentIndicador, empresa_id: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tamanho">Tamanho</Label>
              <Select
                value={currentIndicador.tamanho}
                onValueChange={(value: TamanhoEmpresa) => 
                  setCurrentIndicador({...currentIndicador, tamanho: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PP">PP</SelectItem>
                  <SelectItem value="P">P</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="GG">GG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="potencial_leads">Potencial de Leads (0-10)</Label>
                <Input
                  id="potencial_leads"
                  type="number"
                  min="0"
                  max="10"
                  value={currentIndicador.potencial_leads || ""}
                  onChange={(e) => setCurrentIndicador({
                    ...currentIndicador, 
                    potencial_leads: parseInt(e.target.value) || 0
                  })}
                  placeholder="0-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base_clientes">Base de Clientes (opcional)</Label>
                <Input
                  id="base_clientes"
                  type="number"
                  min="0"
                  value={currentIndicador.base_clientes || ""}
                  onChange={(e) => setCurrentIndicador({
                    ...currentIndicador, 
                    base_clientes: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="Quantidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="engajamento">Engajamento (0-10)</Label>
                <Input
                  id="engajamento"
                  type="number"
                  min="0"
                  max="10"
                  value={currentIndicador.engajamento || ""}
                  onChange={(e) => setCurrentIndicador({
                    ...currentIndicador, 
                    engajamento: parseInt(e.target.value) || 0
                  })}
                  placeholder="0-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alinhamento">Alinhamento (0-10)</Label>
                <Input
                  id="alinhamento"
                  type="number"
                  min="0"
                  max="10"
                  value={currentIndicador.alinhamento || ""}
                  onChange={(e) => setCurrentIndicador({
                    ...currentIndicador, 
                    alinhamento: parseInt(e.target.value) || 0
                  })}
                  placeholder="0-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="potencial_investimento">Potencial de Investimento (0-10)</Label>
                <Input
                  id="potencial_investimento"
                  type="number"
                  min="0"
                  max="10"
                  value={currentIndicador.potencial_investimento || ""}
                  onChange={(e) => setCurrentIndicador({
                    ...currentIndicador, 
                    potencial_investimento: parseInt(e.target.value) || 0
                  })}
                  placeholder="0-10"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
