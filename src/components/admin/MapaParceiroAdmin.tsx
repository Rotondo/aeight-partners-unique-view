import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import { EtapaJornada, SubnivelEtapa } from '@/types/mapa-parceiros';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EtapaForm from './MapaParceiroAdmin/EtapaForm';
import SubnivelForm from './MapaParceiroAdmin/SubnivelForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MapaParceiroAdmin: React.FC = () => {
  const { etapas, subniveis, carregarDados } = useMapaParceiros();
  const [isCreatingEtapa, setIsCreatingEtapa] = useState(false);
  const [isCreatingSubnivel, setIsCreatingSubnivel] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<EtapaJornada | null>(null);
  const [editingSubnivel, setEditingSubnivel] = useState<SubnivelEtapa | null>(null);

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
      etapa_id: ''
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
          </Dialog>

          <Dialog open={isCreatingSubnivel} onOpenChange={setIsCreatingSubnivel}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {resetSubnivelForm(); setIsCreatingSubnivel(true);}}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Subnível
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Forms */}
      <EtapaForm
        isOpen={isCreatingEtapa}
        onClose={() => setIsCreatingEtapa(false)}
        onSubmit={handleCreateEtapa}
        formData={etapaForm}
        setFormData={setEtapaForm}
        isEditing={false}
        title="Criar Nova Etapa"
      />

      <EtapaForm
        isOpen={!!editingEtapa}
        onClose={() => setEditingEtapa(null)}
        onSubmit={handleUpdateEtapa}
        formData={etapaForm}
        setFormData={setEtapaForm}
        isEditing={true}
        title="Editar Etapa"
      />

      <SubnivelForm
        isOpen={isCreatingSubnivel}
        onClose={() => setIsCreatingSubnivel(false)}
        onSubmit={handleCreateSubnivel}
        formData={subnivelForm}
        setFormData={setSubnivelForm}
        etapas={etapas}
        isEditing={false}
        title="Criar Novo Subnível"
      />

      <SubnivelForm
        isOpen={!!editingSubnivel}
        onClose={() => setEditingSubnivel(null)}
        onSubmit={handleUpdateSubnivel}
        formData={subnivelForm}
        setFormData={setSubnivelForm}
        etapas={etapas}
        isEditing={true}
        title="Editar Subnível"
      />

      {/* Etapas List - simplified version */}
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
    </div>
  );
};

export default MapaParceiroAdmin;
