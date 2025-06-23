
import { useMemo } from 'react';
import { Oportunidade } from '@/types';

export interface ValidationResult {
  field: string;
  expected: any;
  actual: any;
  isValid: boolean;
  message: string;
}

export interface DataValidationSummary {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  results: ValidationResult[];
  isAllValid: boolean;
}

export const useDataValidation = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    const results: ValidationResult[] = [];

    // Validação 1: Todos os registros têm ID válido
    const invalidIds = oportunidades.filter(op => !op.id || op.id.length === 0);
    results.push({
      field: 'IDs válidos',
      expected: 0,
      actual: invalidIds.length,
      isValid: invalidIds.length === 0,
      message: invalidIds.length > 0 ? `${invalidIds.length} oportunidades sem ID válido` : 'Todos os IDs são válidos'
    });

    // Validação 2: Datas de indicação válidas
    const invalidDates = oportunidades.filter(op => !op.data_indicacao || isNaN(new Date(op.data_indicacao).getTime()));
    results.push({
      field: 'Datas de indicação',
      expected: 0,
      actual: invalidDates.length,
      isValid: invalidDates.length === 0,
      message: invalidDates.length > 0 ? `${invalidDates.length} oportunidades com data inválida` : 'Todas as datas são válidas'
    });

    // Validação 3: Status válidos
    const validStatuses = ['em_contato', 'negociando', 'proposta_enviada', 'aguardando_aprovacao', 'ganho', 'perdido'];
    const invalidStatuses = oportunidades.filter(op => !validStatuses.includes(op.status));
    results.push({
      field: 'Status válidos',
      expected: 0,
      actual: invalidStatuses.length,
      isValid: invalidStatuses.length === 0,
      message: invalidStatuses.length > 0 ? `${invalidStatuses.length} oportunidades com status inválido` : 'Todos os status são válidos'
    });

    // Validação 4: Valores monetários consistentes
    const negativeValues = oportunidades.filter(op => op.valor !== null && op.valor !== undefined && op.valor < 0);
    results.push({
      field: 'Valores monetários',
      expected: 0,
      actual: negativeValues.length,
      isValid: negativeValues.length === 0,
      message: negativeValues.length > 0 ? `${negativeValues.length} oportunidades com valor negativo` : 'Todos os valores são válidos'
    });

    // Validação 5: Empresas origem e destino existem
    const missingCompanies = oportunidades.filter(op => !op.empresa_origem || !op.empresa_destino);
    results.push({
      field: 'Empresas vinculadas',
      expected: 0,
      actual: missingCompanies.length,
      isValid: missingCompanies.length === 0,
      message: missingCompanies.length > 0 ? `${missingCompanies.length} oportunidades sem empresa origem/destino` : 'Todas têm empresas vinculadas'
    });

    // Validação 6: Consistency check - oportunidades fechadas devem ter data de fechamento
    const closedWithoutDate = oportunidades.filter(op => 
      (op.status === 'ganho' || op.status === 'perdido') && !op.data_fechamento
    );
    results.push({
      field: 'Datas de fechamento',
      expected: 0,
      actual: closedWithoutDate.length,
      isValid: closedWithoutDate.length === 0,
      message: closedWithoutDate.length > 0 ? `${closedWithoutDate.length} oportunidades fechadas sem data` : 'Consistência de datas OK'
    });

    const passedValidations = results.filter(r => r.isValid).length;
    const failedValidations = results.length - passedValidations;

    const summary: DataValidationSummary = {
      totalValidations: results.length,
      passedValidations,
      failedValidations,
      results,
      isAllValid: failedValidations === 0
    };

    // Log summary
    console.log('[Data Validation Summary]', summary);
    if (failedValidations > 0) {
      console.warn(`${failedValidations} validações falharam:`, results.filter(r => !r.isValid));
    }

    return summary;
  }, [oportunidades]);
};
