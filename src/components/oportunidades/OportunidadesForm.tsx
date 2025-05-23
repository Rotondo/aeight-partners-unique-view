import React, { useEffect, useState } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Oportunidade, Empresa, StatusOportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

/**
 * OportunidadesForm
 * Este componente permite criar e editar oportunidades, conectando corretamente
 * com as funções do contexto, validando os campos e suportando todos os fluxos esperados
 * para as páginas de listagem, detalhes e edição.
 */

interface OportunidadesFormProps {
  oportunidadeId?: string | null;
  onClose: () => void;
}

// Se usar textarea custom, ajuste para seu projeto
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => (
  <textarea
    {...props}
    className={cn(
      "block w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      props.className
    )}
  />
);

type Usuario = {
  id: string;
  nome: string;
  ativo: boolean;
  papel: string;
};

function getGrupoStatus(origemTipo?: string, destinoTipo?: string) {
  if (origemTipo === "intragrupo" && destinoTipo === "intragrupo")
    return "intragrupo";
  if (origemTipo && destinoTipo) return "extragrupo";
  return undefined;
}

const statusOptions: StatusOportunidade[] = [
  "em_contato",
  "negociando",
  "ganho",
  "perdido",
  "Contato",
];

// Lista de campos válidos para payload (evitar envio de campos extras à API)
const allowedPayloadFields: (keyof Oportunidade)[] = [
  "nome_lead",
  "empresa_origem_id",
  "empresa_destino_id",
  "data_indicacao",
  "usuario_recebe_id",
  "status",
  "valor",
  "data_fechamento",
  "observacoes",
  "motivo_perda",
  "contato_id",
];

function filterPayloadOportunidade(data: Partial<Oportunidade>) {
  const result: any = {};
  allowedPayloadFields.forEach((k) => {
    if (data[k] !== undefined) result[k] = data[k];
  });
  return result;
}

export const OportunidadesForm: React.FC<OportunidadesFormProps> = ({
  oportunidadeId,
  onClose,
}) => {
  const { getOportunidade, createOportunidade, updateOportunidade } =
    useOportunidades();
  const { toast } = useToast();
  const isEditing = !!oportunidadeId;

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Oportunidade> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Carrega dados da oportunidade selecionada para edição
  useEffect(() => {
    if (isEditing && oportunidadeId) {
      const oportunidade = getOportunidade(oportunidadeId);
      if (oportunidade) {
        // Remover campos de join do formData (caso já tenha vindo de algum lugar)
        const {
          contato,
          empresa_origem,
          empresa_destino,
          usuario_envio,
          usuario_recebe,
          ...rest
        } = oportunidade as any;
        setFormData({
          ...rest,
        });
      } else {
        toast({
          title: "Erro",
          description: "Oportunidade não encontrada.",
          variant: "destructive",
        });
        onClose();
      }
    } else {
      setFormData({
        nome_lead: "",
        empresa_origem_id: undefined,
        empresa_destino_id: undefined,
        data_indicacao: new Date().toISOString(),
        usuario_recebe_id: undefined,
        status: "em_contato",
        valor: undefined,
        data_fechamento: undefined,
        observacoes: "",
        motivo_perda: "",
        contato_id: undefined,
      });
    }
    // eslint-disable-next-line
  }, [oportunidadeId, isEditing, getOportunidade]);

  // Buscar empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      setIsLoading(true);
      try {
        const { data: empresasData, error: empresasError } = await supabase
          .from("empresas")
          .select("*")
          .order("nome");
        if (empresasError) throw empresasError;
        if (empresasData) {
          setEmpresas(empresasData);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  // Buscar usuários ativos para "Executivo Interno Responsável"
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nome, ativo, papel")
          .eq("ativo", true)
          .order("nome");
        if (error) throw error;
        setUsuarios(data || []);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os executivos.",
          variant: "destructive",
        });
      }
    };
    fetchUsuarios();
  }, []);

  // Atualiza campo tipo_natureza apenas para uso visual
  useEffect(() => {
    if (!formData) return;
    const empresaOrigemTipo = empresas.find(
      (e) => e.id === formData.empresa_origem_id
    )?.tipo;
    const empresaDestinoTipo = empresas.find(
      (e) => e.id === formData.empresa_destino_id
    )?.tipo;
    const tipo = getGrupoStatus(empresaOrigemTipo, empresaDestinoTipo);
    if (formData.tipo_natureza !== tipo) {
      setFormData((prev) =>
        prev ? { ...prev, tipo_natureza: tipo } : prev
      );
    }
    // eslint-disable-next-line
  }, [formData?.empresa_origem_id, formData?.empresa_destino_id, empresas]);

  if (!formData) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const handleChange = (field: keyof Oportunidade | string, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validação dos campos obrigatórios
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nome_lead || !formData.nome_lead.trim()) {
      errors.nome_lead = "Nome da oportunidade é obrigatório";
    }
    if (!formData.empresa_origem_id || formData.empresa_origem_id === "none") {
      errors.empresa_origem_id = "Origem é obrigatória";
    }
    if (!formData.empresa_destino_id || formData.empresa_destino_id === "none") {
      errors.empresa_destino_id = "Destino é obrigatória";
    }
    if (!formData.data_indicacao) {
      errors.data_indicacao = "Data é obrigatória";
    }
    if (!formData.status) {
      errors.status = "Status é obrigatório";
    }
    if (
      formData.status === "perdido" &&
      (!formData.motivo_perda || !formData.motivo_perda.trim())
    ) {
      errors.motivo_perda = "Motivo da perda é obrigatório";
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
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      // Só envia campos válidos para o backend
      const dataToSave = filterPayloadOportunidade(formData);

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
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">
        {isEditing ? "Editar Oportunidade" : "Nova Oportunidade"}
      </h2>
      {/* Indicador de natureza */}
      <div className="mb-4">
        <span className="font-medium">Tipo: </span>
        {formData.tipo_natureza === "intragrupo" ? (
          <span className="px-2 py-1 rounded text-green-700 bg-green-100">
            INTRAGRUPO
          </span>
        ) : formData.tipo_natureza === "extragrupo" ? (
          <span className="px-2 py-1 rounded text-blue-700 bg-blue-100">
            EXTRAGRUPO
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-gray-700 bg-gray-100">
            -
          </span>
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
            onChange={(e) => handleChange("nome_lead", e.target.value)}
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
            onValueChange={(value) =>
              handleChange(
                "empresa_origem_id",
                value === "none" ? undefined : value
              )
            }
          >
            <SelectTrigger
              id="empresa_origem_id"
              className={cn(formErrors.empresa_origem_id && "border-red-500")}
            >
              <SelectValue placeholder="Selecione a empresa de origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.empresa_origem_id && (
            <p className="text-sm text-red-500">
              {formErrors.empresa_origem_id}
            </p>
          )}
        </div>
        {/* Destino */}
        <div className="space-y-2">
          <Label htmlFor="empresa_destino_id">
            Destino <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.empresa_destino_id || "none"}
            onValueChange={(value) =>
              handleChange(
                "empresa_destino_id",
                value === "none" ? undefined : value
              )
            }
          >
            <SelectTrigger
              id="empresa_destino_id"
              className={cn(formErrors.empresa_destino_id && "border-red-500")}
            >
              <SelectValue placeholder="Selecione a empresa de destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.empresa_destino_id && (
            <p className="text-sm text-red-500">
              {formErrors.empresa_destino_id}
            </p>
          )}
        </div>
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status || "em_contato"}
            onValueChange={(value) =>
              handleChange("status", value as StatusOportunidade)
            }
          >
            <SelectTrigger
              id="status"
              className={cn(formErrors.status && "border-red-500")}
            >
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status
                    .replace("_", " ")
                    .replace(/^./, (s) => s.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.status && (
            <p className="text-sm text-red-500">{formErrors.status}</p>
          )}
        </div>
        {/* Data indicação */}
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
                  format(new Date(formData.data_indicacao), "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.data_indicacao
                    ? new Date(formData.data_indicacao)
                    : undefined
                }
                onSelect={(date) =>
                  date && handleChange("data_indicacao", date.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formErrors.data_indicacao && (
            <p className="text-sm text-red-500">{formErrors.data_indicacao}</p>
          )}
        </div>
        {/* Executivo interno responsável (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="usuario_recebe_id">
            Executivo Interno Responsável
          </Label>
          <Select
            value={formData.usuario_recebe_id || "none"}
            onValueChange={(value) =>
              handleChange(
                "usuario_recebe_id",
                value === "none" ? undefined : value
              )
            }
          >
            <SelectTrigger
              id="usuario_recebe_id"
              className={cn(formErrors.usuario_recebe_id && "border-red-500")}
            >
              <SelectValue placeholder="Selecione o executivo interno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Valor (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            type="number"
            value={formData.valor ?? ""}
            onChange={(e) =>
              handleChange(
                "valor",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            min={0}
          />
        </div>
        {/* Data de fechamento (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="data_fechamento">Data de Fechamento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="data_fechamento"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.data_fechamento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.data_fechamento ? (
                  format(new Date(formData.data_fechamento), "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.data_fechamento
                    ? new Date(formData.data_fechamento)
                    : undefined
                }
                onSelect={(date) =>
                  date && handleChange("data_fechamento", date.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Observações (opcional) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ""}
            onChange={(e) => handleChange("observacoes", e.target.value)}
            rows={3}
          />
        </div>
        {/* Motivo da perda (obrigatório se perdido) */}
        {formData.status === "perdido" && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="motivo_perda">
              Motivo da perda <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivo_perda"
              value={formData.motivo_perda || ""}
              onChange={(e) => handleChange("motivo_perda", e.target.value)}
              rows={2}
              className={cn(formErrors.motivo_perda && "border-red-500")}
            />
            {formErrors.motivo_perda && (
              <p className="text-sm text-red-500">{formErrors.motivo_perda}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Salvando..."
            : isEditing
            ? "Atualizar"
            : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
