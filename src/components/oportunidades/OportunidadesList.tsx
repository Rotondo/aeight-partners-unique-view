import React from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusOportunidade } from "@/types";

interface OportunidadeDetailsProps {
  id: string;
}

export const OportunidadeDetails: React.FC<OportunidadeDetailsProps> = ({ id }) => {
  const { oportunidades, isLoading } = useOportunidades();
  const oportunidade = oportunidades.find((o) => o.id === id);

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

  const formatDate = (dateString: string) => {
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!oportunidade) {
    return <div className="text-center text-muted-foreground p-4">Oportunidade não encontrada.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{oportunidade.titulo || "Sem Título"}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Data de Indicação:</strong>
          <div>{formatDate(oportunidade.data_indicacao)}</div>
        </div>
        <div>
          <strong>Status:</strong>
          <div>{getStatusBadge(oportunidade.status)}</div>
        </div>
        <div>
          <strong>Origem:</strong>
          <div>{oportunidade.empresa_origem?.nome || "-"}</div>
        </div>
        <div>
          <strong>Destino:</strong>
          <div>{oportunidade.empresa_destino?.nome || "-"}</div>
        </div>
        <div>
          <strong>Contato:</strong>
          <div>{oportunidade.contato?.nome || "-"}</div>
        </div>
        <div>
          <strong>Valor:</strong>
          <div>{formatCurrency(oportunidade.valor)}</div>
        </div>
      </div>
      <div>
        <strong>Descrição:</strong>
        <div>{oportunidade.descricao || <span className="text-muted-foreground">Sem descrição informada.</span>}</div>
      </div>
    </div>
  );
};
