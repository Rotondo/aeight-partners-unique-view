import React, { useEffect, useState, useMemo } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Oportunidade, Empresa, StatusOportunidade } from "@/types";
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

function getGrupoStatus(origemTipo?: string, destinoTipo?: string) {
  if (origemTipo === "intragrupo" && destinoTipo === "intragrupo") return "intragrupo";
  if (origemTipo && destinoTipo) return "extragrupo";
  return undefined;
}

const statusOptions: StatusOportunidade[] = [
  "em_contato",
  "negociando",
  "ganho",
  "perdido",
  "Contato"
];

export const OportunidadesForm: React.FC<OportunidadesFormProps> = ({ oportunidadeId, onClose }) => {
  const { getOportunidade, createOportunidade, updateOportunidade } = useOportunidades();
  const { toast } = useToast();
  const isEditing = !!oportunidadeId;
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Oportunidade> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Carrega dados da oportunidade selecionada para edição
  useEffect(() => {
    if (isEditing && oportunidadeId) {
      const oportunidade = getOportunidade(oportunidadeId);
      if (oportunidade) {
        // Remover campo contato do formData (caso já tenha vindo de algum lugar)
        const { contato, ...rest } = oportunidade as any;
        setFormData({
          ...rest
        });
      } else {
        toast({
          title: "Erro",
          description: "Oportunidade não encontrada.",
          variant: "destructive"
        });
        onClose();
      }
    } else {
      // Reset formData para criação
      setFormData({
        nome_lead: "",
        empresa_origem_id: "",
        empresa_destino_id: "",
        tipo_natureza: undefined,
        data_indicacao: new Date().toISOString(),
        usuario_recebe_nome: "",
        status: "em_contato"
      });
    }
    // eslint-disable-next-line
  }, [oportunidadeId, isEditing, getOportunidade]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      setIsLoading(true);
      try {
        const { data: empresasData, error: empresasError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
        if (empresasError) throw empresasError;
        if (empresasData) {
          const typedEmpresas = empresasData.map(empresa => ({
            id: empresa.id,
            nome: empresa.nome,
            tipo: empresa.tipo as Empresa["tipo"],
            status: empresa.status,
            descricao: empresa.descricao,
            created_at: empresa.created_at
          }));
          setEmpresas(typedEmpresas);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  // Sync empresa origem/destino para calcular tipo_natureza
  useEffect(() => {
    if (!formData) return;
    const empresaOrigemTipo = empresas.find(e => e.id === formData.empresa_origem_id)?.tipo;
    const empresaDestinoTipo = empresas.find(e => e.id === formData.empresa_destino_id)?.tipo;
    const tipo = getGrupoStatus(empresaOrigemTipo, empresaDestinoTipo);
    setFormData(prev => prev ? { ...prev, tipo_natureza: tipo } : prev);
    // eslint-disable-next-line
  }, [formData?.empresa_origem_id, formData?.empresa_destino_id, empresas]);

  if (!formData) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const handleChange = (field: keyof Oportunidade, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validação simplificada apenas para os campos mandatórios
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nome_lead || !formData.nome_lead.trim()) {
      errors.nome_lead = "Nome da oportunidade é obrigatório";
    }
    if (!formData.empresa_origem_id) {
      errors.empresa_origem_id = "Origem é obrigatória";
    }
    if (!formData.empresa_destino_id) {
      errors.empresa_destino_id = "Destino é obrigatória";
    }
    if (!formData.data_indicacao) {
      errors.data_indicacao = "Data é obrigatória";
    }
    if (!formData.usuario_recebe_nome || !formData.usuario_recebe_nome.trim()) {
      errors.usuario_recebe_nome = "Nome do executivo interno é obrigatório";
    }
    if (!formData.status) {
      errors.status = "Status é obrigatório";
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
      // Remove o campo contato antes de enviar ao backend
      const { contato, ...dataToSave } = formData;
      if (isEditing && oportunidadeId) {
        await updateOportunidade(oportunidadeId, dataToSave);
      } else {
        await createOportunidade(dataToSave);
      }
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar oportunidade.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">{isEditing ? "Editar Oportunidade" : "Nova Oportunidade"}</h2>
      {/* Indicador de natureza */}
      <div className="mb-4">
        <span className="font-medium">Tipo: </span>
        {formData.tipo_natureza === "intragrupo" ? (
          <span className="px-2 py-1 rounded text-green-700 bg-green-100">INTRAGRUPO</span>
        ) : formData.tipo_natureza === "extragrupo" ? (
          <span className="px-2 py-1 rounded text-blue-700 bg-blue-100">EXTRAGRUPO</span>
        ) : (
          <span className="px-2 py-1 rounded text-gray-700 bg-gray-100">-</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome_lead">
            Nome da Oportunidade <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nome_lead"
            value={formData.nome_lead || ""}
            onChange={e => handleChange("nome_lead", e.target.value)}
            required
            className={cn(formErrors.nome_lead && "border-red-500")}
          />
          {formErrors.nome_lead && (
            <p className="text-sm text-red-500">{formErrors.nome_lead}</p>
          )}
        </div>
        {/* Origem */}
        <div className="space-y-2">
          <Label htmlFor="empresa_origem_id">
            Origem <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.empresa_origem_id || "none"}
            onValueChange={value => handleChange("empresa_origem_id", value === "none" ? undefined : value)}
          >
            <SelectTrigger id="empresa_origem_id" className={cn(formErrors.empresa_origem_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa de origem" />
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
        {/* Destino */}
        <div className="space-y-2">
          <Label htmlFor="empresa_destino_id">
            Destino <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.empresa_destino_id || "none"}
            onValueChange={value => handleChange("empresa_destino_id", value === "none" ? undefined : value)}
          >
            <SelectTrigger id="empresa_destino_id" className={cn(formErrors.empresa_destino_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa de destino" />
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
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status || "em_contato"}
            onValueChange={value => handleChange("status", value as StatusOportunidade)}
          >
            <SelectTrigger id="status" className={cn(formErrors.status && "border-red-500")}>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ").replace(/^./, s => s.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.status && (
            <p className="text-sm text-red-500">{formErrors.status}</p>
          )}
        </div>
        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="data_indicacao">
            Data <span className="text-red-500">*</span>
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
        {/* Executivo interno responsável */}
        <div className="space-y-2">
          <Label htmlFor="usuario_recebe_nome">
            Executivo Interno Responsável <span className="text-red-500">*</span>
          </Label>
          <Input
            id="usuario_recebe_nome"
            value={formData.usuario_recebe_nome || ""}
            onChange={e => handleChange("usuario_recebe_nome", e.target.value)}
            required
            className={cn(formErrors.usuario_recebe_nome && "border-red-500")}
          />
          {formErrors.usuario_recebe_nome && (
            <p className="text-sm text-red-500">{formErrors.usuario_recebe_nome}</p>
          )}
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
