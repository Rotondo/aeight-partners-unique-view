import { PipelineFase, StatusOportunidade } from "@/types/common";

export function mapPipelineToOpportunityStatus(
  fase: PipelineFase
): StatusOportunidade {
  switch (fase) {
    case "apresentado":
      return "Apresentado"; // Prefer status "Apresentado" for presented phase
    case "aguardando_feedback":
      return "negociando"; // Em negociação/aguardando retorno
    case "convertido":
      return "ganho"; // Caso wishlist marque convertido como ganho (não usado na criação inicial)
    case "planejado":
      return "em_contato";
    case "aprovado":
      return "em_contato";
    case "rejeitado":
      return "perdido";
    default:
      return "em_contato";
  }
}

export function mapOpportunityToPipeline(
  status: StatusOportunidade
): PipelineFase {
  switch (status) {
    case "ganho":
      return "convertido";
    case "perdido":
    case "cancelado":
      return "rejeitado";
    case "proposta_enviada":
    case "aguardando_aprovacao":
    case "negociando":
      return "aguardando_feedback";
    case "Apresentado": // compat com enum legado
      return "apresentado";
    case "em_contato":
    case "Contato": // compat com enum legado
    case "indicado":
    default:
      return "planejado";
  }
}

export function shouldAutoCreateOpp(args: {
  fase_pipeline?: PipelineFase | null;
  oportunidade_id?: string | null;
  created_at?: string | null;
  start_at?: string | null;
  createOnPresented?: boolean;
}): boolean {
  const {
    fase_pipeline,
    oportunidade_id,
    created_at,
    start_at,
    createOnPresented = true,
  } = args;

  // Já vinculada a uma oportunidade
  if (oportunidade_id) return false;

  // Respeita a regra de só criar quando "apresentado" (se habilitado)
  if (createOnPresented && fase_pipeline !== "apresentado") return false;

  // Recorte temporal (se fornecido)
  if (start_at && created_at) {
    try {
      const created = new Date(created_at).getTime();
      const start = new Date(start_at).getTime();
      if (!isNaN(created) && !isNaN(start) && created < start) return false;
    } catch (_) {
      // Em caso de parsing inválido, não bloquear por data
    }
  }

  return true;
}

export function deriveOrigemEDestino(wishlistItem: {
  empresa_interessada_id: string;
  empresa_desejada_id: string;
}): { origemId: string; destinoId: string } {
  // Por padrão: quem deseja (interessada) origina a oportunidade para a desejada
  return {
    origemId: wishlistItem.empresa_interessada_id,
    destinoId: wishlistItem.empresa_desejada_id,
  };
}

export type DatabaseOpportunityStatus =
  | "em_contato"
  | "negociando"
  | "proposta_enviada"
  | "aguardando_aprovacao"
  | "ganho"
  | "perdido"
  | "Contato"
  | "Apresentado"
  | "Sem contato";

export function toDatabaseStatus(status: StatusOportunidade): DatabaseOpportunityStatus {
  switch (status) {
    case "Apresentado":
    case "indicado":
      return "Apresentado";
    case "Contato":
    case "em_contato":
      return "em_contato";
    case "negociando":
      return "negociando";
    case "proposta_enviada":
      return "proposta_enviada";
    case "aguardando_aprovacao":
      return "aguardando_aprovacao";
    case "ganho":
    case "fechado":
      return "ganho";
    case "cancelado":
    case "perdido":
      return "perdido";
    case "Sem contato":
      return "Sem contato";
    default:
      return "em_contato";
  }
}