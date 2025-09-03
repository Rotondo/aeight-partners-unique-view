// Validation utilities for cliente-fishbone components and data

import { ClienteFishboneView, MapeamentoFornecedor, ClienteOption } from './cliente-fishbone';
import { ClienteFishboneFilters, FishboneZoomLevel } from './cliente-fishbone-filters';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate ClienteOption data
export const validateClienteOption = (cliente: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cliente) {
    errors.push('Cliente object is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (!cliente.id || typeof cliente.id !== 'string') {
    errors.push('Cliente ID is required and must be a string');
  }

  if (!cliente.nome || typeof cliente.nome !== 'string') {
    errors.push('Cliente nome is required and must be a string');
  }

  if (cliente.tipo && !['cliente', 'parceiro', 'intragrupo'].includes(cliente.tipo)) {
    warnings.push(`Unknown cliente tipo: ${cliente.tipo}`);
  }

  if (cliente.empresa_proprietaria) {
    if (!cliente.empresa_proprietaria.id || typeof cliente.empresa_proprietaria.id !== 'string') {
      errors.push('Empresa proprietaria ID is required and must be a string');
    }
    if (!cliente.empresa_proprietaria.nome || typeof cliente.empresa_proprietaria.nome !== 'string') {
      errors.push('Empresa proprietaria nome is required and must be a string');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Validate MapeamentoFornecedor data
export const validateMapeamentoFornecedor = (mapeamento: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!mapeamento) {
    errors.push('Mapeamento object is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (!mapeamento.id || typeof mapeamento.id !== 'string') {
    errors.push('Mapeamento ID is required and must be a string');
  }

  if (!mapeamento.cliente_id || typeof mapeamento.cliente_id !== 'string') {
    errors.push('Cliente ID is required and must be a string');
  }

  if (!mapeamento.etapa_id || typeof mapeamento.etapa_id !== 'string') {
    errors.push('Etapa ID is required and must be a string');
  }

  if (!mapeamento.empresa_fornecedora_id || typeof mapeamento.empresa_fornecedora_id !== 'string') {
    errors.push('Empresa fornecedora ID is required and must be a string');
  }

  if (typeof mapeamento.ativo !== 'boolean') {
    errors.push('Ativo field must be a boolean');
  }

  if (mapeamento.empresa_fornecedora && !mapeamento.empresa_fornecedora.nome) {
    warnings.push('Empresa fornecedora missing nome field');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Validate FishboneView data structure
export const validateFishboneView = (view: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!view) {
    errors.push('FishboneView object is null or undefined');
    return { isValid: false, errors, warnings };
  }

  // Validate cliente
  if (!view.cliente) {
    errors.push('Cliente is required in FishboneView');
  } else {
    if (!view.cliente.id || typeof view.cliente.id !== 'string') {
      errors.push('Cliente ID is required and must be a string');
    }
    if (!view.cliente.nome || typeof view.cliente.nome !== 'string') {
      errors.push('Cliente nome is required and must be a string');
    }
  }

  // Validate etapas
  if (!Array.isArray(view.etapas)) {
    errors.push('Etapas must be an array');
  } else {
    view.etapas.forEach((etapa: any, index: number) => {
      if (!etapa.id || typeof etapa.id !== 'string') {
        errors.push(`Etapa ${index}: ID is required and must be a string`);
      }
      if (!etapa.nome || typeof etapa.nome !== 'string') {
        errors.push(`Etapa ${index}: nome is required and must be a string`);
      }
      if (!Array.isArray(etapa.fornecedores)) {
        errors.push(`Etapa ${index}: fornecedores must be an array`);
      }
      if (!Array.isArray(etapa.subniveis)) {
        errors.push(`Etapa ${index}: subniveis must be an array`);
      } else {
        etapa.subniveis.forEach((subnivel: any, subIndex: number) => {
          if (!subnivel.id || typeof subnivel.id !== 'string') {
            errors.push(`Etapa ${index}, Subnivel ${subIndex}: ID is required and must be a string`);
          }
          if (!Array.isArray(subnivel.fornecedores)) {
            errors.push(`Etapa ${index}, Subnivel ${subIndex}: fornecedores must be an array`);
          }
        });
      }
    });
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Validate array of cliente options
export const validateClienteOptionArray = (clientes: any[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(clientes)) {
    errors.push('Clientes must be an array');
    return { isValid: false, errors, warnings };
  }

  const clienteIds = new Set<string>();
  clientes.forEach((cliente, index) => {
    const validation = validateClienteOption(cliente);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(error => `Cliente ${index}: ${error}`));
    }
    warnings.push(...validation.warnings.map(warning => `Cliente ${index}: ${warning}`));

    // Check for duplicate IDs
    if (cliente?.id) {
      if (clienteIds.has(cliente.id)) {
        errors.push(`Duplicate cliente ID found: ${cliente.id} at index ${index}`);
      } else {
        clienteIds.add(cliente.id);
      }
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
};

// Comprehensive validation function for the fishbone hook data
export const validateFishboneHookData = (data: {
  fishboneData: any[];
  clientes: any[];
  cliente: any;
  etapas: any[];
  mapeamentos: any[];
}): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate fishboneData
  if (!Array.isArray(data.fishboneData)) {
    errors.push('FishboneData must be an array');
  } else {
    data.fishboneData.forEach((view, index) => {
      const validation = validateFishboneView(view);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(error => `FishboneView ${index}: ${error}`));
      }
      warnings.push(...validation.warnings.map(warning => `FishboneView ${index}: ${warning}`));
    });
  }

  // Validate clientes
  const clientesValidation = validateClienteOptionArray(data.clientes);
  if (!clientesValidation.isValid) {
    errors.push(...clientesValidation.errors);
  }
  warnings.push(...clientesValidation.warnings);

  // Validate current cliente
  if (data.cliente) {
    if (!data.cliente.id || typeof data.cliente.id !== 'string') {
      errors.push('Current cliente ID is required and must be a string');
    }
    if (!data.cliente.nome || typeof data.cliente.nome !== 'string') {
      errors.push('Current cliente nome is required and must be a string');
    }
  }

  // Validate etapas
  if (!Array.isArray(data.etapas)) {
    errors.push('Etapas must be an array');
  } else if (data.etapas.length === 0) {
    warnings.push('No etapas found - fishbone cannot be rendered');
  }

  // Validate mapeamentos
  if (!Array.isArray(data.mapeamentos)) {
    errors.push('Mapeamentos must be an array');
  } else {
    data.mapeamentos.forEach((mapeamento, index) => {
      const validation = validateMapeamentoFornecedor(mapeamento);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(error => `Mapeamento ${index}: ${error}`));
      }
      warnings.push(...validation.warnings.map(warning => `Mapeamento ${index}: ${warning}`));
    });
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Log validation results
export const logValidationResults = (componentName: string, validation: ValidationResult): void => {
  if (process.env.NODE_ENV === 'development') {
    if (!validation.isValid) {
      console.error(`[${componentName}] Validation failed:`, validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn(`[${componentName}] Validation warnings:`, validation.warnings);
    }
    if (validation.isValid && validation.warnings.length === 0) {
      console.log(`[${componentName}] Validation passed successfully`);
    }
  }
};