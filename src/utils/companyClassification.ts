/**
 * Utility functions for classifying companies according to business rules.
 * 
 * Business Rules:
 * 1. Clients are only "Aeight clients" if explicitly linked to an Aeight owner company
 * 2. No automatic Aeight linking should occur in any flow
 * 3. Companies of type 'intragrupo' are considered "Aeight companies"
 * 4. Companies of type 'parceiro' are external partners
 * 5. Companies of type 'cliente' are clients (but ownership depends on relationships)
 */

import { EmpresaTipoString } from '@/types/common';

/**
 * Checks if a company is an Aeight (internal group) company
 * @param companyType - The type of the company
 * @returns true if the company is part of Aeight (intragrupo)
 */
export const isAeightCompany = (companyType: EmpresaTipoString): boolean => {
  return companyType === 'intragrupo';
};

/**
 * Checks if a company is an external partner
 * @param companyType - The type of the company
 * @returns true if the company is an external partner
 */
export const isExternalPartner = (companyType: EmpresaTipoString): boolean => {
  return companyType === 'parceiro';
};

/**
 * Checks if a company is a client
 * @param companyType - The type of the company
 * @returns true if the company is classified as a client
 */
export const isClientCompany = (companyType: EmpresaTipoString): boolean => {
  return companyType === 'cliente';
};

/**
 * Determines if a client relationship should be created automatically
 * This should return false for Aeight companies to prevent automatic linking
 * @param ownerCompanyType - The type of the company that would own the relationship
 * @param selectedCompanyId - The ID of the company selected in the form
 * @returns true if automatic relationship creation is allowed
 */
export const shouldCreateAutomaticClientRelationship = (
  ownerCompanyType: EmpresaTipoString,
  selectedCompanyId: string
): boolean => {
  // Never create automatic relationships with Aeight companies
  if (isAeightCompany(ownerCompanyType)) {
    return false;
  }
  
  // Only create automatic relationships with external partners
  return isExternalPartner(ownerCompanyType);
};

/**
 * Filters companies to show all active external group partners
 * Used in Presentation Mode to show all partners, even without clients
 * @param companies - Array of companies to filter
 * @returns Filtered array of external partners
 */
export const getActiveExternalPartners = (companies: Array<{
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
  status: boolean;
}>) => {
  return companies.filter(company => 
    company.status && 
    (isExternalPartner(company.tipo) || company.tipo === 'intragrupo')
  );
};

/**
 * Filters companies to show only external partners (not intragrupo)
 * @param companies - Array of companies to filter
 * @returns Filtered array of external partners only
 */
export const getExternalPartnersOnly = (companies: Array<{
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
  status: boolean;
}>) => {
  return companies.filter(company => 
    company.status && isExternalPartner(company.tipo)
  );
};

/**
 * Gets the display name for a company type
 * @param companyType - The company type
 * @returns User-friendly display name
 */
export const getCompanyTypeDisplayName = (companyType: EmpresaTipoString): string => {
  switch (companyType) {
    case 'intragrupo':
      return 'Aeight (Intragrupo)';
    case 'parceiro':
      return 'Parceiro Externo';
    case 'cliente':
      return 'Cliente';
    default:
      return companyType;
  }
};

/**
 * Validates if a client relationship should be allowed
 * @param ownerCompanyType - Type of the owner company
 * @param clientCompanyType - Type of the client company
 * @returns true if the relationship is valid
 */
export const isValidClientRelationship = (
  ownerCompanyType: EmpresaTipoString,
  clientCompanyType: EmpresaTipoString
): boolean => {
  // Clients should not own other clients
  if (isClientCompany(ownerCompanyType)) {
    return false;
  }
  
  // Both Aeight and external partners can have clients
  return isAeightCompany(ownerCompanyType) || isExternalPartner(ownerCompanyType);
};