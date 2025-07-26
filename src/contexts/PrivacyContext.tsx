import React from 'react';

// Fallback mais simples para evitar erros de inicialização
interface PrivacyContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const defaultPrivacyContext: PrivacyContextType = {
  isDemoMode: false,
  toggleDemoMode: () => {},
  setDemoMode: () => {}
};

const PrivacyContext = React.createContext<PrivacyContextType>(defaultPrivacyContext);

interface PrivacyProviderProps {
  children: React.ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  // Estado inicial simples
  const [isDemoMode, setIsDemoMode] = React.useState<boolean>(false);

  // Carregar estado do localStorage apenas depois do mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('aeight-demo-mode');
      if (saved) {
        setIsDemoMode(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao carregar localStorage:', error);
    }
  }, []);

  // Salvar no localStorage quando mudar
  React.useEffect(() => {
    try {
      localStorage.setItem('aeight-demo-mode', JSON.stringify(isDemoMode));
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao salvar no localStorage:', error);
    }
  }, [isDemoMode]);

  const toggleDemoMode = React.useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const setDemoMode = React.useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
  }, []);

  const value: PrivacyContextType = React.useMemo(() => ({
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
  const context = React.useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy deve ser usado dentro de um PrivacyProvider');
  }
  return context;
};