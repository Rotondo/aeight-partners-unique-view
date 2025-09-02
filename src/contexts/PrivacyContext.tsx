import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

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
  // Inicializa o estado lendo do localStorage de forma segura
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Esta verificação garante que o código não quebre fora do navegador
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      const saved = localStorage.getItem('aeight-demo-mode');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao aceder ao localStorage:', error);
      return false;
    }
  });

  // Efeito para salvar o estado no localStorage sempre que ele mudar
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem('aeight-demo-mode', JSON.stringify(isDemoMode));
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao salvar no localStorage:', error);
    }
  }, [isDemoMode]);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const setDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
  }, []);

  const value: PrivacyContextType = useMemo(() => ({
    isDemoMode,
    toggleDemoMode,
    setDemoMode
  }), [isDemoMode, toggleDemoMode, setDemoMode]);

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
