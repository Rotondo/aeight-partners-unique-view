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

export function maskSensitiveData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  if (data && typeof data === 'object') {
    const masked: any = {};
    for (const key in data) {
      // Nunca mascarar IDs e campos críticos
      if (FIELDS_TO_NEVER_MASK.includes(key.toLowerCase())) {
        masked[key] = data[key];
      } else if (
        typeof data[key] === 'string' &&
        ['name', 'nome', 'email', 'telefone', 'document', 'cpf', 'cnpj', 'address', 'endereco', 'company', 'empresa'].some(s =>
          key.toLowerCase().includes(s)
        )
      ) {
        masked[key] = '***';
      } else if (
        typeof data[key] === 'number' &&
        ['valor', 'value', 'quantidade', 'amount', 'total', 'count'].some(s =>
          key.toLowerCase().includes(s)
        )
      ) {
        masked[key] = 0;
      } else {
        masked[key] = maskSensitiveData(data[key]);
      }
    }
    return masked;
  }
  if (typeof data === 'string') return '***';
  if (typeof data === 'number') return 0;
  return data;
}

/**
 * Hook para aplicar a máscara apenas se o modo Demo estiver ativo
 */
export function useDemoMask<T = any>(data: T): T {
  const { isDemoMode } = usePrivacy();
  if (!isDemoMode) return data;
  return maskSensitiveData(data);
}
