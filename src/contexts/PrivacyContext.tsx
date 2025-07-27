
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
  // Verificar se React e hooks estão disponíveis
  if (!React || typeof React.useState !== 'function') {
    console.error('[PrivacyProvider] React hooks are not available');
    return (
      <PrivacyContext.Provider value={defaultPrivacyContext}>
        {children}
      </PrivacyContext.Provider>
    );
  }

  try {
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

  } catch (error) {
    console.error('[PrivacyProvider] Error using React hooks:', error);
    return (
      <PrivacyContext.Provider value={defaultPrivacyContext}>
        {children}
      </PrivacyContext.Provider>
    );
  }
};

export const usePrivacy = () => {
  const context = React.useContext(PrivacyContext);
  if (context === undefined) {
    console.warn('[usePrivacy] Context not found, returning default values');
    return defaultPrivacyContext;
  }
  return context;
};
