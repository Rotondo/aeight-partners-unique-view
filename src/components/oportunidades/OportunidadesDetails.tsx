import React, { useState, useEffect } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { StatusOportunidade } from "@/types";

interface OportunidadeDetailsProps {
  id: string;
}

export const OportunidadeDetails: React.FC<OportunidadeDetailsProps> = ({ id }) => {
  const { getOportunidade } = useOportunidades();
  const [historico, setHistorico] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const oportunidade = getOportunidade(id);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('historico_oportunidade')
          .select(`
            *,
            usuario:usuarios(nome)
          `)
          .eq('oportunidade_id', id)
          .order('data_alteracao', { ascending: false });

        if (error) throw error;
        setHistorico(data || []);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorico();
  }, [id]);

  if (!oportunidade) {
    return <div className="p-6">Oportunidade não encontrada</div>;
  }

  const getStatusBadge = (status: StatusOportunidade) => {
    switch (status) {
      case "em_contato":
        return <Badge className="bg-blue-500">Em Contato</Badge>;
      case "negociando":
        return <Badge className="bg-yellow-500">Negociando</Badge>;
      case "ganho":
        return <Badge className="bg-green-500">Ganho</Badge>;
      case "perdido":
        return <Badge className="bg-red-500">Perdido</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatFieldName = (fieldName: string) => {
    const fieldMap: Record<string, string> = {
      status: "Status",
      valor: "Valor",
      data_indicacao: "Data de Indicação",
      data_fechamento: "Data de Fechamento",
      motivo_perda: "Motivo da Perda",
      observacoes: "Observações",
      empresa_origem_id: "Empresa de Origem",
      empresa_destino_id: "Empresa de Destino",
      contato_id: "Contato",
      usuario_envio_id: "Usuário de Envio",
      usuario_recebe_id: "Usuário de Recebimento"
    };
    return fieldMap[fieldName] || fieldName;
  };

  const formatValue = (field: string, value: string | null) => {
    if (value === null) return "-";
    
    if (field === "status") {
      switch (value) {
        case "em_contato": return "Em Contato";
        case "negociando": return "Negociando";
        case "ganho": return "Ganho";
        case "perdido": return "Perdido";
        default: return value;
      }
    }
    
    if (field === "valor") {
      try {
        return formatCurrency(parseFloat(value));
      } catch {
        return value;
      }
    }
    
    if (field === "data_indicacao" || field === "data_fechamento") {
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    }
    
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Empresa de Origem</h3>
          <p className="text-lg">{oportunidade.empresa_origem?.nome || "-"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Empresa de Destino</h3>
          <p className="text-lg">{oportunidade.empresa_destino?.nome || "-"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
          <p className="text-lg">{oportunidade.contato?.nome || "-"}</p>
          {oportunidade.contato && (
            <p className="text-sm text-muted-foreground">
              {oportunidade.contato.email} | {oportunidade.contato.telefone}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Valor</h3>
          <p className="text-lg">{formatCurrency(oportunidade.valor)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <div>{getStatusBadge(oportunidade.status)}</div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data de Indicação</h3>
          <p className="text-lg">{formatDate(oportunidade.data_indicacao)}</p>
        </div>
        {oportunidade.data_fechamento && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Data de Fechamento</h3>
            <p className="text-lg">{formatDate(oportunidade.data_fechamento)}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Responsável Origem</h3>
          <p className="text-lg">{oportunidade.usuario_envio?.nome || "-"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Responsável Destino</h3>
          <p className="text-lg">{oportunidade.usuario_recebe?.nome || "-"}</p>
        </div>
      </div>
      
      {oportunidade.motivo_perda && (
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-red-700">Motivo da Perda</h3>
          <p className="text-red-800">{oportunidade.motivo_perda}</p>
        </div>
      )}
      
      {oportunidade.observacoes && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium">Observações</h3>
          <p className="whitespace-pre-line">{oportunidade.observacoes}</p>
        </div>
      )}
      
      <div>
        <h3 className="font-medium mb-2">Histórico de Alterações</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : historico.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum histórico de alteração disponível.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Para</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(item.data_alteracao)}
                  </TableCell>
                  <TableCell>{formatFieldName(item.campo_alterado)}</TableCell>
                  <TableCell>{formatValue(item.campo_alterado, item.valor_antigo)}</TableCell>
                  <TableCell>{formatValue(item.campo_alterado, item.valor_novo)}</TableCell>
                  <TableCell>{item.usuario?.nome || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
