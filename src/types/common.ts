

export type WishlistStatus =
  | "pendente"
  | "em_andamento"
  | "aprovado"
  | "rejeitado"
  | "convertido";

export type TipoApresentacao =
  | "email"
  | "telefone"
  | "reuniao"
  | "outro";

export type StatusApresentacao =
  | "pendente"
  | "agendada"
  | "realizada"
  | "cancelada";

export type PipelineFase = 
  | "aprovado"
  | "planejado" 
  | "apresentado"
  | "aguardando_feedback"
  | "convertido"
  | "rejeitado";

// Company types
export type EmpresaTipoString = "intragrupo" | "parceiro" | "cliente";
export type TipoEmpresa = EmpresaTipoString;

// Opportunity types - matching actual usage in codebase
export type StatusOportunidade =
  | "em_contato"
  | "negociando"
  | "proposta_enviada"
  | "aguardando_aprovacao"
  | "ganho"
  | "perdido"
  | "Contato"
  | "Apresentado"
  | "Sem contato"
  | "indicado"
  | "em_andamento"
  | "fechado"
  | "cancelado";

export type TipoNatureza =
  | "prospeccao"
  | "renovacao"
  | "expansao"
  | "cross_sell"
  | "upsell"
  | "intragrupo"
  | "extragrupo";

// Company size types
export type TamanhoEmpresa = "PP" | "P" | "M" | "G" | "GG";

