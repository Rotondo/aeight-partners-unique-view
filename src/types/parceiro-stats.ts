
export interface ParceiroStats {
  id: string;
  nome: string;
  oportunidadesRecebidas: number;
  oportunidadesEnviadas: number;
  diferenca: number;
  diasUltimaOportunidade: number | null;
  mediaOportunidadesPorDia: number | null;
  mediaValor: number | null;
  somaValor: number | null;
  dataCadastro: Date;
}
