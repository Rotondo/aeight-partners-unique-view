
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

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
  console.log('[PrivacyProvider] Initializing...');

  // Initialize state with a safe default
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Verificação segura do localStorage
    try {
      const saved = localStorage.getItem('aeight-demo-mode');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn('[PrivacyContext] Erro ao acessar localStorage:', error);
      return false;
    }
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    // Check if we're in browser environment
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

  console.log('[PrivacyProvider] Rendering with isDemoMode:', isDemoMode);

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
