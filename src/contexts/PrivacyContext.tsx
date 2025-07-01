
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PrivacyContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

interface PrivacyProviderProps {
  children: ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Verificação segura do localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('aeight-demo-mode');
        return saved ? JSON.parse(saved) : false;
      }
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao acessar localStorage:', error);
    }
    return false;
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('aeight-demo-mode', JSON.stringify(isDemoMode));
      }
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao salvar no localStorage:', error);
    }
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  const value: PrivacyContextType = {
    isDemoMode,
    toggleDemoMode,
    setDemoMode
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy deve ser usado dentro de um PrivacyProvider');
  }
  return context;
};
