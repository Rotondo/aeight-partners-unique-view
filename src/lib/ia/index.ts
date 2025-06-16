/**
 * Biblioteca de funções auxiliares para integração de IA no Diário.
 * Permite abstrair o agente de IA, facilitando substituição ou múltiplos endpoints.
 * Todas as funções retornam mocks por padrão para desenvolvimento offline.
 * Adicione aqui funções comuns para manipular resultados de IA, fallback, logging, etc.
 */

import {
  IaResumoRequest,
  IaResumoResponse,
  IaSuggestionRequest,
  IaSuggestionResponse,
  gerarResumoIa,
  gerarSugestaoIa,
} from "@/integrations/ia";

/**
 * Função central para gerar resumo via IA para o Diário.
 * Recebe dados do parceiro e eventos, retorna resposta formatada.
 * Sempre retorna formato consistente, mesmo em caso de fallback.
 */
export async function gerarResumoDiarioIA(req: IaResumoRequest): Promise<IaResumoResponse> {
  try {
    return await gerarResumoIa(req);
  } catch (err) {
    return { texto: "Falha ao gerar resumo IA (lib fallback)." };
  }
}

/**
 * Função central para gerar sugestão via IA para o Diário.
 * Recebe contexto do parceiro, retorna resposta formatada.
 * Sempre retorna formato consistente, mesmo em caso de fallback.
 */
export async function gerarSugestaoDiarioIA(req: IaSuggestionRequest): Promise<IaSuggestionResponse> {
  try {
    return await gerarSugestaoIa(req);
  } catch (err) {
    return { texto: "Falha ao gerar sugestão IA (lib fallback).", tipo: "OUTRO" };
  }
}

/**
 * Utilitário para sanitizar respostas de IA (remove tags suspeitas, normaliza texto etc).
 */
export function sanitizeIaText(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}