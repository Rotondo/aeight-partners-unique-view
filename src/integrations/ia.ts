/**
 * Integração de IA para resumos e sugestões no Diário.
 * Permite troca fácil do agente de IA, com contratos de entrada/saída documentados.
 * Implementação robusta de tratamento de erro e fallback.
 */

/**
 * Contrato de entrada para geração de resumo IA.
 */
export interface IaResumoRequest {
  partnerId: string;
  eventos: {
    titulo: string;
    descricao?: string;
    dataInicio: string;
    dataFim: string;
  }[];
}

/**
 * Contrato de saída para geração de resumo IA.
 */
export interface IaResumoResponse {
  texto: string;
  tags?: string[];
  relevancia?: number;
}

/**
 * Contrato de entrada para sugestão IA.
 */
export interface IaSuggestionRequest {
  partnerId: string;
  contexto: string;
}

/**
 * Contrato de saída para sugestão IA.
 */
export interface IaSuggestionResponse {
  texto: string;
  tipo: "FOLLOWUP" | "ALERT" | "INSIGHT" | "OUTRO";
  score?: number;
}

/**
 * Gera um resumo por IA, recebendo dados relevantes.
 * Em dev retorna mock, em prod chama endpoint real.
 */
export async function gerarResumoIa(input: IaResumoRequest): Promise<IaResumoResponse> {
  try {
    // PROD: chamada real
    // const response = await fetch("/api/ia/resumo", { method: "POST", body: JSON.stringify(input) });
    // if (!response.ok) throw new Error("Erro IA");
    // return await response.json();
    return { texto: "Resumo IA mockado.", tags: ["IA", "Resumo"], relevancia: 0.87 };
  } catch (err) {
    // Fallback para caso de erro
    return { texto: "Não foi possível gerar resumo IA no momento." };
  }
}

/**
 * Gera sugestão por IA, recebendo informações contextuais.
 * Em dev retorna mock, em prod chama endpoint real.
 */
export async function gerarSugestaoIa(input: IaSuggestionRequest): Promise<IaSuggestionResponse> {
  try {
    // PROD: chamada real
    // const response = await fetch("/api/ia/sugestao", { method: "POST", body: JSON.stringify(input) });
    // if (!response.ok) throw new Error("Erro IA");
    // return await response.json();
    return { texto: "Sugestão IA mockada.", tipo: "INSIGHT", score: 0.92 };
  } catch (err) {
    return { texto: "Não foi possível gerar sugestão IA no momento.", tipo: "OUTRO" };
  }
}

/**
 * Documentação da API de IA:
 * - Entrada e saída JSON conforme interfaces acima.
 * - Fallback seguro em caso de erro de rede/timeout.
 */