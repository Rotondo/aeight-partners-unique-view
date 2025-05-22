import React, { useEffect, useState, useMemo } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Oportunidade, Empresa } from "@/types";
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
  return "-";
}

export const OportunidadesForm: React.FC<OportunidadesFormProps> = ({ oportunidadeId, onClose }) => {
  const { getOportunidade, createOportunidade, updateOportunidade } = useOportunidades();
  const { toast } = useToast();
  const isEditing = !!oportunidadeId;
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Oportunidade>>({
    nome_lead: "",
    empresa_origem_id: "",
    empresa_destino_id: "",
    data_indicacao: new Date().toISOString(),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Carrega oportunidade para edição
  useEffect(() => {
    if (isEditing && oportunidadeId) {
      const oportunidade = getOportunidade(oportunidadeId);
      if (oportunidade) {
        setFormData({
          nome_lead: oportunidade.nome_lead,
          empresa_origem_id: oportunidade.empresa_origem_id,
          empresa_destino_id: oportunidade.empresa_destino_id,
          data_indicacao: oportunidade.data_indicacao,
          status: oportunidade.status,
          valor: oportunidade.valor,
          contato_id: oportunidade.contato_id,
          data_fechamento: oportunidade.data_fechamento,
          motivo_perda: oportunidade.motivo_perda,
          observacoes: oportunidade.observacoes,
          usuario_recebe_id: oportunidade.usuario_recebe_id
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

  // Carrega empresas
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
            tipo: empresa.tipo as "intragrupo" | "parceiro" | "cliente",
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

  const handleChange = (field: keyof Oportunidade, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calcular os tipos das empresas selecionadas
  const empresaOrigemTipo = useMemo(() => {
    return empresas.find(e => e.id === formData.empresa_origem_id)?.tipo;
  }, [formData.empresa_origem_id, empresas]);
  const empresaDestinoTipo = useMemo(() => {
    return empresas.find(e => e.id === formData.empresa_destino_id)?.tipo;
  }, [formData.empresa_destino_id, empresas]);

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
      errors.empresa_destino_id = "Destino é obrigatório";
    }
    if (!formData.data_indicacao) {
      errors.data_indicacao = "Data é obrigatória";
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
      toast({
        title: "Erro",
        description: "Falha ao salvar oportunidade.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  // Indicador de natureza (intra/extragrupo)
  const natureza = getGrupoStatus(empresaOrigemTipo, empresaDestinoTipo);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">{isEditing ? "Editar Oportunidade" : "Nova Oportunidade"}</h2>
      {/* Indicador de natureza */}
      <div className="mb-4">
        <span className="font-medium">Natureza: </span>
        {natureza === "intragrupo" ? (
          <span className="px-2 py-1 rounded text-green-700 bg-green-100">INTRAGRUPO</span>
        ) : natureza === "extragrupo" ? (
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
