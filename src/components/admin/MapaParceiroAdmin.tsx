
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import { EtapaJornada, SubnivelEtapa } from '@/types/mapa-parceiros';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MapaParceiroAdmin: React.FC = () => {
  const { etapas, subniveis, carregarDados } = useMapaParceiros();
  const [isCreatingEtapa, setIsCreatingEtapa] = useState(false);
  const [isCreatingSubnivel, setIsCreatingSubnivel] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<EtapaJornada | null>(null);
  const [editingSubnivel, setEditingSubnivel] = useState<SubnivelEtapa | null>(null);
  const [selectedEtapaForSubnivel, setSelectedEtapaForSubnivel] = useState<string>('');

  // Form states
  const [etapaForm, setEtapaForm] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6',
    icone: '',
    ordem: 1,
    ativo: true
  });

  const [subnivelForm, setSubnivelForm] = useState({
    nome: '',
    descricao: '',
    ordem: 1,
    ativo: true,
    etapa_id: ''
  });

  const resetEtapaForm = () => {
    setEtapaForm({
      nome: '',
      descricao: '',
      cor: '#3B82F6',
      icone: '',
      ordem: etapas.length + 1,
      ativo: true
    });
  };

  const resetSubnivelForm = () => {
    setSubnivelForm({
      nome: '',
      descricao: '',
      ordem: 1,
      ativo: true,
      etapa_id: selectedEtapaForSubnivel
    });
  };

  const handleCreateEtapa = async () => {
    try {
      const { error } = await supabase
        .from('etapas_jornada')
        .insert([etapaForm]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Etapa criada com sucesso.",
      });

      resetEtapaForm();
      setIsCreatingEtapa(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEtapa = async () => {
    if (!editingEtapa) return;

    try {
      const { error } = await supabase
        .from('etapas_jornada')
        .update(etapaForm)
        .eq('id', editingEtapa.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Etapa atualizada com sucesso.",
      });

      setEditingEtapa(null);
      resetEtapaForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEtapa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('etapas_jornada')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Etapa excluída com sucesso.",
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubnivel = async () => {
    try {
      const { error } = await supabase
        .from('subniveis_etapa')
        .insert([subnivelForm]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subnível criado com sucesso.",
      });

      resetSubnivelForm();
      setIsCreatingSubnivel(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar subnível:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o subnível.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubnivel = async () => {
    if (!editingSubnivel) return;

    try {
      const { error } = await supabase
        .from('subniveis_etapa')
        .update(subnivelForm)
        .eq('id', editingSubnivel.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subnível atualizado com sucesso.",
      });

      setEditingSubnivel(null);
      resetSubnivelForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar subnível:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o subnível.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubnivel = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este subnível? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subniveis_etapa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subnível excluído com sucesso.",
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir subnível:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o subnível.",
        variant: "destructive",
      });
    }
  };

  const handleToggleEtapaStatus = async (etapa: EtapaJornada) => {
    try {
      const { error } = await supabase
        .from('etapas_jornada')
        .update({ ativo: !etapa.ativo })
        .eq('id', etapa.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Etapa ${etapa.ativo ? 'desativada' : 'ativada'} com sucesso.`,
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status da etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da etapa.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSubnivelStatus = async (subnivel: SubnivelEtapa) => {
    try {
      const { error } = await supabase
        .from('subniveis_etapa')
        .update({ ativo: !subnivel.ativo })
        .eq('id', subnivel.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Subnível ${subnivel.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status do subnível:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do subnível.",
        variant: "destructive",
      });
    }
  };

  const handleReorderEtapa = async (etapa: EtapaJornada, direction: 'up' | 'down') => {
    const currentOrder = etapa.ordem;
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    const targetEtapa = etapas.find(e => e.ordem === targetOrder);
    if (!targetEtapa) return;

    try {
      // Swap orders
      await supabase
        .from('etapas_jornada')
        .update({ ordem: targetOrder })
        .eq('id', etapa.id);

      await supabase
        .from('etapas_jornada')
        .update({ ordem: currentOrder })
        .eq('id', targetEtapa.id);

      carregarDados();
    } catch (error) {
      console.error('Erro ao reordenar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar a etapa.",
        variant: "destructive",
      });
    }
  };

  const handleReorderSubnivel = async (subnivel: SubnivelEtapa, direction: 'up' | 'down') => {
    const currentOrder = subnivel.ordem;
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    const targetSubnivel = subniveis.find(s => s.etapa_id === subnivel.etapa_id && s.ordem === targetOrder);
    if (!targetSubnivel) return;

    try {
      // Swap orders
      await supabase
        .from('subniveis_etapa')
        .update({ ordem: targetOrder })
        .eq('id', subnivel.id);

      await supabase
        .from('subniveis_etapa')
        .update({ ordem: currentOrder })
        .eq('id', targetSubnivel.id);

      carregarDados();
    } catch (error) {
      console.error('Erro ao reordenar subnível:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar o subnível.",
        variant: "destructive",
      });
    }
  };

  const openEditEtapa = (etapa: EtapaJornada) => {
    setEditingEtapa(etapa);
    setEtapaForm({
      nome: etapa.nome,
      descricao: etapa.descricao || '',
      cor: etapa.cor || '#3B82F6',
      icone: etapa.icone || '',
      ordem: etapa.ordem,
      ativo: etapa.ativo
    });
  };

  const openEditSubnivel = (subnivel: SubnivelEtapa) => {
    setEditingSubnivel(subnivel);
    setSubnivelForm({
      nome: subnivel.nome,
      descricao: subnivel.descricao || '',
      ordem: subnivel.ordem,
      ativo: subnivel.ativo,
      etapa_id: subnivel.etapa_id
    });
  };

  const getSubniveisPorEtapa = (etapaId: string) => {
    return subniveis.filter(s => s.etapa_id === etapaId).sort((a, b) => a.ordem - b.ordem);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administração do Mapa de Parceiros</h1>
          <p className="text-muted-foreground mt-2">Gerencie as etapas e subníveis da jornada do e-commerce</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isCreatingEtapa} onOpenChange={setIsCreatingEtapa}>
            <DialogTrigger asChild>
              <Button onClick={() => {resetEtapaForm(); setIsCreatingEtapa(true);}}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Etapa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Etapa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={etapaForm.nome}
                    onChange={(e) => setEtapaForm({...etapaForm, nome: e.target.value})}
                    placeholder="Nome da etapa"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={etapaForm.descricao}
                    onChange={(e) => setEtapaForm({...etapaForm, descricao: e.target.value})}
                    placeholder="Descrição da etapa"
                  />
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    type="color"
                    value={etapaForm.cor}
                    onChange={(e) => setEtapaForm({...etapaForm, cor: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={etapaForm.ordem}
                    onChange={(e) => setEtapaForm({...etapaForm, ordem: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={etapaForm.ativo}
                    onCheckedChange={(checked) => setEtapaForm({...etapaForm, ativo: checked})}
                  />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateEtapa} disabled={!etapaForm.nome}>
                    Criar Etapa
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingEtapa(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreatingSubnivel} onOpenChange={setIsCreatingSubnivel}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {resetSubnivelForm(); setIsCreatingSubnivel(true);}}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Subnível
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Subnível</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="etapa">Etapa *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={subnivelForm.etapa_id}
                    onChange={(e) => setSubnivelForm({...subnivelForm, etapa_id: e.target.value})}
                  >
                    <option value="">Selecione uma etapa</option>
                    {etapas.map(etapa => (
                      <option key={etapa.id} value={etapa.id}>
                        {etapa.ordem}. {etapa.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="nome-subnivel">Nome *</Label>
                  <Input
                    id="nome-subnivel"
                    value={subnivelForm.nome}
                    onChange={(e) => setSubnivelForm({...subnivelForm, nome: e.target.value})}
                    placeholder="Nome do subnível"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao-subnivel">Descrição</Label>
                  <Textarea
                    id="descricao-subnivel"
                    value={subnivelForm.descricao}
                    onChange={(e) => setSubnivelForm({...subnivelForm, descricao: e.target.value})}
                    placeholder="Descrição do subnível"
                  />
                </div>
                <div>
                  <Label htmlFor="ordem-subnivel">Ordem</Label>
                  <Input
                    id="ordem-subnivel"
                    type="number"
                    value={subnivelForm.ordem}
                    onChange={(e) => setSubnivelForm({...subnivelForm, ordem: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo-subnivel"
                    checked={subnivelForm.ativo}
                    onCheckedChange={(checked) => setSubnivelForm({...subnivelForm, ativo: checked})}
                  />
                  <Label htmlFor="ativo-subnivel">Ativo</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSubnivel} disabled={!subnivelForm.nome || !subnivelForm.etapa_id}>
                    Criar Subnível
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingSubnivel(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Etapas */}
      <div className="space-y-4">
        {etapas.sort((a, b) => a.ordem - b.ordem).map((etapa) => (
          <Card key={etapa.id} className={`${!etapa.ativo ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: etapa.cor }}
                  />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {etapa.ordem}. {etapa.nome}
                      <Badge variant={etapa.ativo ? "default" : "secondary"}>
                        {etapa.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    {etapa.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{etapa.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEtapaStatus(etapa)}
                  >
                    {etapa.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderEtapa(etapa, 'up')}
                    disabled={etapa.ordem === 1}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderEtapa(etapa, 'down')}
                    disabled={etapa.ordem === etapas.length}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditEtapa(etapa)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEtapa(etapa.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Subníveis */}
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Subníveis</h4>
                {getSubniveisPorEtapa(etapa.id).map((subnivel) => (
                  <div
                    key={subnivel.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/30 rounded-lg gap-2 ${!subnivel.ativo ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      <span className="font-medium">{subnivel.nome}</span>
                      <Badge variant={subnivel.ativo ? "default" : "secondary"} className="text-xs">
                        {subnivel.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSubnivelStatus(subnivel)}
                      >
                        {subnivel.ativo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderSubnivel(subnivel, 'up')}
                        disabled={subnivel.ordem === 1}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorderSubnivel(subnivel, 'down')}
                        disabled={subnivel.ordem === getSubniveisPorEtapa(etapa.id).length}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSubnivel(subnivel)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubnivel(subnivel.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {getSubniveisPorEtapa(etapa.id).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Nenhum subnível cadastrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para editar etapa */}
      <Dialog open={!!editingEtapa} onOpenChange={(open) => !open && setEditingEtapa(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={etapaForm.nome}
                onChange={(e) => setEtapaForm({...etapaForm, nome: e.target.value})}
                placeholder="Nome da etapa"
              />
            </div>
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={etapaForm.descricao}
                onChange={(e) => setEtapaForm({...etapaForm, descricao: e.target.value})}
                placeholder="Descrição da etapa"
              />
            </div>
            <div>
              <Label htmlFor="edit-cor">Cor</Label>
              <Input
                id="edit-cor"
                type="color"
                value={etapaForm.cor}
                onChange={(e) => setEtapaForm({...etapaForm, cor: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-ordem">Ordem</Label>
              <Input
                id="edit-ordem"
                type="number"
                value={etapaForm.ordem}
                onChange={(e) => setEtapaForm({...etapaForm, ordem: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativo"
                checked={etapaForm.ativo}
                onCheckedChange={(checked) => setEtapaForm({...etapaForm, ativo: checked})}
              />
              <Label htmlFor="edit-ativo">Ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateEtapa} disabled={!etapaForm.nome}>
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditingEtapa(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar subnível */}
      <Dialog open={!!editingSubnivel} onOpenChange={(open) => !open && setEditingSubnivel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Subnível</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-etapa">Etapa *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={subnivelForm.etapa_id}
                onChange={(e) => setSubnivelForm({...subnivelForm, etapa_id: e.target.value})}
              >
                <option value="">Selecione uma etapa</option>
                {etapas.map(etapa => (
                  <option key={etapa.id} value={etapa.id}>
                    {etapa.ordem}. {etapa.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-nome-subnivel">Nome *</Label>
              <Input
                id="edit-nome-subnivel"
                value={subnivelForm.nome}
                onChange={(e) => setSubnivelForm({...subnivelForm, nome: e.target.value})}
                placeholder="Nome do subnível"
              />
            </div>
            <div>
              <Label htmlFor="edit-descricao-subnivel">Descrição</Label>
              <Textarea
                id="edit-descricao-subnivel"
                value={subnivelForm.descricao}
                onChange={(e) => setSubnivelForm({...subnivelForm, descricao: e.target.value})}
                placeholder="Descrição do subnível"
              />
            </div>
            <div>
              <Label htmlFor="edit-ordem-subnivel">Ordem</Label>
              <Input
                id="edit-ordem-subnivel"
                type="number"
                value={subnivelForm.ordem}
                onChange={(e) => setSubnivelForm({...subnivelForm, ordem: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativo-subnivel"
                checked={subnivelForm.ativo}
                onCheckedChange={(checked) => setSubnivelForm({...subnivelForm, ativo: checked})}
              />
              <Label htmlFor="edit-ativo-subnivel">Ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateSubnivel} disabled={!subnivelForm.nome || !subnivelForm.etapa_id}>
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditingSubnivel(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapaParceiroAdmin;
