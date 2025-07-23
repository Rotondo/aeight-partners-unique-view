
import React from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';

interface PrivateDataProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'name' | 'email' | 'phone' | 'value' | 'company' | 'address' | 'document' | 'generic' | 'currency' | 'blur' | 'asterisk' | 'percentage';
  blurLevel?: 'light' | 'medium' | 'heavy';
}

export const PrivateData: React.FC<PrivateDataProps> = ({ 
  children, 
  fallback,
  type = 'generic',
  blurLevel = 'medium'
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
    currency: 'R$ ***.**',
    blur: children, // Para blur, mantemos o conteúdo mas aplicamos filtro
    asterisk: '***',
    percentage: '**%',
    generic: '[Dados ocultos - Modo Demonstração]'
  };

  // Se for tipo blur, aplicamos filtro CSS
  if (type === 'blur') {
    const blurLevels = {
      light: 'blur-sm',
      medium: 'blur-md', 
      heavy: 'blur-lg'
    };
    
    return (
      <span className={`inline-block ${blurLevels[blurLevel]} select-none`}>
        {children}
      </span>
    );
  }

  // Se for asterisk, aplicamos estilo específico
  if (type === 'asterisk') {
    return (
      <span className="font-mono text-gray-400 select-none">
        {defaultFallbacks[type]}
      </span>
    );
  }

  return (
    <span className="italic text-gray-500 bg-gray-100 px-1 rounded">
      {defaultFallbacks[type]}
    </span>
  );
};
