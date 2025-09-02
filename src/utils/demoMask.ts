import { usePrivacy } from '@/contexts/PrivacyContext';

/**
 * Máscara recursiva para dados sensíveis.
 * - Strings viram "***"
 * - Números viram 0
 * - Objetos e arrays são processados recursivamente
 * - Campos com nome sugestivo (ex: name, email, valor) são mascarados
 * - Nunca mascara o campo "id" ou campos-chave críticos
 */
const FIELDS_TO_NEVER_MASK = ['id', 'key', 'uuid', 'codigo', 'slug'];

// TODO: Improve typing - this function needs complex type transformations
export function maskSensitiveData<T = unknown>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData) as T;
  }
  if (data && typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    const dataRecord = data as Record<string, unknown>;
    for (const key in dataRecord) {
      // Nunca mascarar IDs e campos críticos
      if (FIELDS_TO_NEVER_MASK.includes(key.toLowerCase())) {
        masked[key] = dataRecord[key];
      } else if (
        typeof dataRecord[key] === 'string' &&
        ['name', 'nome', 'email', 'telefone', 'document', 'cpf', 'cnpj', 'address', 'endereco', 'company', 'empresa'].some(s =>
          key.toLowerCase().includes(s)
        )
      ) {
        masked[key] = '***';
      } else if (
        typeof dataRecord[key] === 'number' &&
        ['valor', 'value', 'quantidade', 'amount', 'total', 'count'].some(s =>
          key.toLowerCase().includes(s)
        )
      ) {
        masked[key] = 0;
      } else {
        masked[key] = maskSensitiveData(dataRecord[key]);
      }
    }
    return masked as T;
  }
  if (typeof data === 'string') return '***' as T;
  if (typeof data === 'number') return 0 as T;
  return data;
}

/**
 * Hook para aplicar a máscara apenas se o modo Demo estiver ativo
 */
export function useDemoMask<T = unknown>(data: T): T {
  const { isDemoMode } = usePrivacy();
  if (!isDemoMode) return data;
  return maskSensitiveData(data);
}
