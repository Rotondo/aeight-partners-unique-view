
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('demoMode');
    if (savedDemoMode) {
      setIsDemoMode(JSON.parse(savedDemoMode));
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('demoMode', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  return (
    <PrivacyContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      setDemoMode
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
