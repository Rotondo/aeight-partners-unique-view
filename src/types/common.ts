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
