
import React from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';

interface PrivateDataProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'name' | 'email' | 'phone' | 'value' | 'company' | 'address' | 'document' | 'generic';
}

export const PrivateData: React.FC<PrivateDataProps> = ({ 
  children, 
  fallback,
  type = 'generic'
}) => {
  const { isDemoMode } = usePrivacy();

  if (!isDemoMode) {
    return <>{children}</>;
  }

  // Se tem fallback customizado, usar ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Fallbacks padrão baseados no tipo
  const defaultFallbacks = {
    name: 'João da Silva',
    email: 'exemplo@email.com',
    phone: '(11) 99999-9999',
    value: 'R$ 50.000',
    company: 'Empresa Demonstração Ltda',
    address: 'Rua Exemplo, 123 - São Paulo/SP',
    document: '***.***.***-**',
    generic: '[Dados ocultos - Modo Demonstração]'
  };

  return <span className="italic text-gray-500">{defaultFallbacks[type]}</span>;
};
