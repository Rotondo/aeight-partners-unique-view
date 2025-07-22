
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

// Opportunity types
export type StatusOportunidade =
  | "indicado"
  | "em_andamento" 
  | "fechado"
  | "perdido"
  | "cancelado";

export type TipoNatureza =
  | "prospeccao"
  | "renovacao"
  | "expansao"
  | "cross_sell"
  | "upsell";

// Company size types
export type TamanhoEmpresa = "PP" | "P" | "M" | "G" | "GG";
