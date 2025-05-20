import React, { useEffect, useState } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Oportunidade, Empresa, Contato, Usuario, StatusOportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OportunidadesFormProps {
  oportunidadeId?: string | null;
  onClose: () => void;
}

export const OportunidadesForm: React.FC<OportunidadesFormProps> = ({ oportunidadeId, onClose }) => {
  const { getOportunidade, createOportunidade, updateOportunidade } = useOportunidades();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!oportunidadeId;
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Oportunidade>>({
    empresa_origem_id: "",
    empresa_destino_id: "",
    contato_id: undefined,
    valor: undefined,
    status: "em_contato",
    data_indicacao: new Date().toISOString(),
    observacoes: "",
    usuario_envio_id: user?.id || "",
    usuario_recebe_id: undefined,
    motivo_perda: undefined,
    data_fechamento: undefined
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filteredContatos, setFilteredContatos] = useState<Contato[]>([]);
  
  // Load oportunidade data if editing
  useEffect(() => {
    if (isEditing && oportunidadeId) {
      const oportunidade = getOportunidade(oportunidadeId);
      if (oportunidade) {
        setFormData({
          ...oportunidade,
          valor: oportunidade.valor !== undefined && oportunidade.valor !== null
            ? Number(oportunidade.valor)
            : undefined
        });
      } else {
        toast({
          title: "Erro",
          description: "Oportunidade não encontrada.",
          variant: "destructive"
        });
        onClose();
      }
    }
    // eslint-disable-next-line
  }, [oportunidadeId, isEditing]);

  // Filter contacts based on selected company
  useEffect(() => {
    if (formData.empresa_origem_id) {
      const filtered = contatos.filter(contato => 
        contato.empresa_id === formData.empresa_origem_id
      );
      setFilteredContatos(filtered);

      // Reset contact if it doesn't belong to the selected company
      if (formData.contato_id && !filtered.some(c => c.id === formData.contato_id)) {
        setFormData(prev => ({ ...prev, contato_id: undefined }));
      }
    } else {
      setFilteredContatos([]);
      setFormData(prev => ({ ...prev, contato_id: undefined }));
    }
    // eslint-disable-next-line
  }, [formData.empresa_origem_id, contatos]);

  // Load dependent data
  useEffect(() => {
    const fetchFormData = async () => {
      setIsLoading(true);
      try {
        // Load empresas
        const { data: empresasData, error: empresasError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (empresasError) throw empresasError;
        setEmpresas(empresasData || []);

        // Load contatos
        const { data: contatosData, error: contatosError } = await supabase
          .from('contatos')
          .select('*')
          .order('nome');

        if (contatosError) throw contatosError;
        setContatos(contatosData || []);

        // Load usuarios
        const { data: usuariosData, error: usuariosError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('ativo', true)
          .order('nome');

        if (usuariosError) throw usuariosError;
        setUsuarios(usuariosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados do formulário:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (field: keyof Oportunidade, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when value changes
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // If status changes to "perdido", ensure motivo_perda is required
    if (field === 'status' && value === 'perdido') {
      setFormErrors(prev => ({
        ...prev,
        motivo_perda: formData.motivo_perda ? '' : 'Informe o motivo da perda'
      }));
    }
    
    // If status changes from "perdido", clear motivo_perda requirement
    if (field === 'status' && value !== 'perdido' && formErrors.motivo_perda) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.motivo_perda;
        return newErrors;
      });
    }
    
    // If status is "ganho", set the data_fechamento to today if not already set
    if (field === 'status' && value === 'ganho' && !formData.data_fechamento) {
      setFormData(prev => ({ ...prev, data_fechamento: new Date().toISOString() }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.empresa_origem_id) {
      errors.empresa_origem_id = 'Empresa de origem é obrigatória';
    }
    
    if (!formData.empresa_destino_id) {
      errors.empresa_destino_id = 'Empresa de destino é obrigatória';
    }
    
    if (!formData.data_indicacao) {
      errors.data_indicacao = 'Data de indicação é obrigatória';
    }
    
    if (formData.status === 'perdido' && !formData.motivo_perda) {
      errors.motivo_perda = 'Motivo da perda é obrigatório para status "Perdido"';
    }
    
    if (formData.status === 'ganho' && !formData.data_fechamento) {
      errors.data_fechamento = 'Data de fechamento é obrigatória para status "Ganho"';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Corrija os erros no formulário para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (isEditing && oportunidadeId) {
        await updateOportunidade(oportunidadeId, formData);
      } else {
        await createOportunidade(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar oportunidade:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">{isEditing ? "Editar Oportunidade" : "Nova Oportunidade"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data de Indicação */}
        <div className="space-y-2">
          <Label htmlFor="data_indicacao">
            Data de Indicação <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="data_indicacao"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  formErrors.data_indicacao && "border-red-500",
                  !formData.data_indicacao && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.data_indicacao ? (
                  format(new Date(formData.data_indicacao), "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.data_indicacao ? new Date(formData.data_indicacao) : undefined}
                onSelect={(date) => date && handleChange("data_indicacao", date.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formErrors.data_indicacao && (
            <p className="text-sm text-red-500">{formErrors.data_indicacao}</p>
          )}
        </div>
      
        {/* Empresa Origem */}
        <div className="space-y-2">
          <Label htmlFor="empresa_origem_id">
            Empresa de Origem <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.empresa_origem_id || "none"}
            onValueChange={value => handleChange("empresa_origem_id", value === "none" ? undefined : value)}
          >
            <SelectTrigger id="empresa_origem_id" className={cn(formErrors.empresa_origem_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.empresa_origem_id && (
            <p className="text-sm text-red-500">{formErrors.empresa_origem_id}</p>
          )}
        </div>
      
        {/* Contato */}
        <div className="space-y-2">
          <Label htmlFor="contato_id">Contato</Label>
          <Select
            value={formData.contato_id || "none"}
            onValueChange={value => handleChange("contato_id", value === "none" ? undefined : value)}
            disabled={!formData.empresa_origem_id || filteredContatos.length === 0}
          >
            <SelectTrigger id="contato_id">
              <SelectValue placeholder={
                !formData.empresa_origem_id 
                  ? "Selecione uma empresa primeiro"
                  : filteredContatos.length === 0
                    ? "Nenhum contato disponível"
                    : "Selecione um contato"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {filteredContatos.map(contato => (
                <SelectItem key={contato.id} value={contato.id}>
                  {contato.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      
        {/* Empresa Destino */}
        <div className="space-y-2">
          <Label htmlFor="empresa_destino_id">
            Empresa de Destino <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.empresa_destino_id || "none"}
            onValueChange={value => handleChange("empresa_destino_id", value === "none" ? undefined : value)}
          >
            <SelectTrigger id="empresa_destino_id" className={cn(formErrors.empresa_destino_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.empresa_destino_id && (
            <p className="text-sm text-red-500">{formErrors.empresa_destino_id}</p>
          )}
        </div>
      
        {/* Responsável de Destino */}
        <div className="space-y-2">
          <Label htmlFor="usuario_recebe_id">Responsável no Destino</Label>
          <Select
            value={formData.usuario_recebe_id || "none"}
            onValueChange={value => handleChange("usuario_recebe_id", value === "none" ? undefined : value)}
            disabled={!formData.empresa_destino_id}
          >
            <SelectTrigger id="usuario_recebe_id">
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {usuarios
                .filter(u => u.empresa_id === formData.empresa_destino_id)
                .map(usuario => (
                  <SelectItem key={usuario.id} value={usuario.id}>{usuario.nome}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      
        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="valor">Valor Estimado (R$)</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor || ""}
            onChange={(e) => handleChange("valor", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0,00"
          />
        </div>
      
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="negociando">Negociando</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
        {/* Data de Fechamento (só aparece se status for "ganho") */}
        {formData.status === "ganho" && (
          <div className="space-y-2">
            <Label htmlFor="data_fechamento">
              Data de Fechamento <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="data_fechamento"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    formErrors.data_fechamento && "border-red-500",
                    !formData.data_fechamento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.data_fechamento ? (
                    format(new Date(formData.data_fechamento), "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.data_fechamento ? new Date(formData.data_fechamento) : undefined}
                  onSelect={(date) => date && handleChange("data_fechamento", date.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formErrors.data_fechamento && (
              <p className="text-sm text-red-500">{formErrors.data_fechamento}</p>
            )}
          </div>
        )}
      
        {/* Motivo da Perda (só aparece se status for "perdido") */}
        {formData.status === "perdido" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="motivo_perda">
              Motivo da Perda <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivo_perda"
              value={formData.motivo_perda || ""}
              onChange={(e) => handleChange("motivo_perda", e.target.value)}
              className={cn(formErrors.motivo_perda && "border-red-500")}
              placeholder="Informe o motivo da perda da oportunidade"
            />
            {formErrors.motivo_perda && (
              <p className="text-sm text-red-500">{formErrors.motivo_perda}</p>
            )}
          </div>
        )}
      
        {/* Observações */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ""}
            onChange={(e) => handleChange("observacoes", e.target.value)}
            placeholder="Informações adicionais sobre a oportunidade"
            rows={4}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
