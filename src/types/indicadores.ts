
import { TamanhoEmpresa } from './common';

// Indicadores types

export interface IndicadoresParceiro {
  id?: string;
  empresa_id: string;
  potencial_leads: number;
  base_clientes?: number;
  engajamento: number;
  alinhamento: number;
  potencial_investimento: number;
  tamanho: TamanhoEmpresa;
  score_x?: number;
  score_y?: number;
  data_avaliacao: string;
}

export interface QuadrantPoint {
  id: string;
  nome: string;
  x: number;
  y: number;
  tamanho: TamanhoEmpresa;
  engajamento: number;
  color: string;
  empresaId: string;
}
