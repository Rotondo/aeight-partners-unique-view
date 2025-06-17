
// Common base types and enums

export type TamanhoEmpresa = "PP" | "P" | "M" | "G" | "GG";

export type StatusOportunidade = 
  | "em_contato" 
  | "negociando" 
  | "ganho" 
  | "perdido" 
  | "Contato" 
  | "Apresentado" 
  | "Sem contato";

export type TipoNatureza = "intragrupo" | "extragrupo";

export enum TipoEmpresa {
  INTRAGRUPO = "intragrupo",
  PARCEIRO = "parceiro",
  CLIENTE = "cliente"
}

export type EmpresaTipoString = "intragrupo" | "parceiro" | "cliente";

export type WishlistStatus = "pendente" | "em_andamento" | "aprovado" | "rejeitado" | "convertido";

export type TipoApresentacao = "email" | "reuniao" | "evento" | "digital" | "outro";

export type StatusApresentacao = "agendada" | "realizada" | "cancelada";
