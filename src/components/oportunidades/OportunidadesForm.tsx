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

const STATUS_OPTIONS: { value: StatusOportunidade; label: string }[] = [
  { value: "em_contato", label: "Em Contato" },
  { value: "negociando", label: "Negociando" },
  { value: "ganho", label: "Ganho" },
  { value: "perdido", label: "Perdido" },
];

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
    tipo_natureza: undefined,
    data_indicacao: new Date().toISOString(),
    contato: { nome: "", email: "", telefone: "" },
    usuario_recebe_nome: "",
    status: "em_contato"
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && oportunidadeId) {
      const oportunidade = getOportunidade(oportunidadeId);
      if (oportunidade) {
        setFormData({
          ...oportunidade,
          contato: oportunidade.contato || { nome: "", email: "", telefone: "" },
          status: oportunidade.status || "em_contato"
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
            tipo: empresa.tipo,
          }));
          setEmpresas(typedEmpresas);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar empresas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmpresas();
    // eslint-disable-next-line
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      data_indicacao: date ? date.toISOString() : undefined,
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.nome_lead) errors.nome_lead = "Nome do lead é obrigatório";
    if (!formData.empresa_origem_id) errors.empresa_origem_id = "Empresa de origem é obrigatória";
    if (!formData.empresa_destino_id) errors.empresa_destino_id = "Empresa de destino é obrigatória";
    if (!formData.status) errors.status = "Status é obrigatório";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (isEditing && oportunidadeId) {
        const ok = await updateOportunidade(oportunidadeId, formData);
        if (ok) {
          toast({
            title: "Sucesso",
            description: "Oportunidade atualizada com sucesso!",
          });
          onClose();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a oportunidade.",
            variant: "destructive",
          });
        }
      } else {
        const newId = await createOportunidade(formData);
        if (newId) {
          toast({
            title: "Sucesso",
            description: "Oportunidade criada com sucesso!",
          });
          onClose();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível criar a oportunidade.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? "Editar Oportunidade" : "Nova Oportunidade"}</h2>
      
      <div>
        <Label htmlFor="nome_lead">Nome do Lead</Label>
        <Input
          id="nome_lead"
          value={formData.nome_lead || ""}
          onChange={(e) => handleChange("nome_lead", e.target.value)}
          required
        />
        {formErrors.nome_lead && <span className="text-red-500 text-xs">{formErrors.nome_lead}</span>}
      </div>

      <div>
        <Label htmlFor="empresa_origem_id">Empresa de Origem</Label>
        <Select
          value={formData.empresa_origem_id || ""}
          onValueChange={(value) => handleChange("empresa_origem_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa de origem" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.empresa_origem_id && <span className="text-red-500 text-xs">{formErrors.empresa_origem_id}</span>}
      </div>

      <div>
        <Label htmlFor="empresa_destino_id">Empresa de Destino</Label>
        <Select
          value={formData.empresa_destino_id || ""}
          onValueChange={(value) => handleChange("empresa_destino_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa de destino" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.empresa_destino_id && <span className="text-red-500 text-xs">{formErrors.empresa_destino_id}</span>}
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status || "em_contato"}
          onValueChange={(value: StatusOportunidade) => handleChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status da oportunidade" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.status && <span className="text-red-500 text-xs">{formErrors.status}</span>}
      </div>

      <div>
        <Label htmlFor="data_indicacao">Data de Indicação</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.data_indicacao && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.data_indicacao
                ? format(new Date(formData.data_indicacao), "dd/MM/yyyy", { locale: ptBR })
                : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.data_indicacao ? new Date(formData.data_indicacao) : undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Outros campos do formulário (contato, valor, etc) podem ser adicionados aqui */}

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
