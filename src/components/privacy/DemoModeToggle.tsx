
import * as React from 'react';
import { Button } from '@/components/ui/button';

// Ensure React is properly initialized
if (!React || typeof React.useState !== 'function') {
  console.error('[DemoModeToggle] React is not properly initialized');
  throw new Error('React is not properly initialized - hooks are not available');
}
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';

interface DemoModeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({ 
  variant = 'outline',
  size = 'sm',
  showLabel = true
}) => {
  const { isDemoMode, toggleDemoMode } = usePrivacy();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDemoMode}
      className={isDemoMode ? 'bg-amber-100 border-amber-300 text-amber-700' : ''}
    >
      {isDemoMode ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isDemoMode ? 'Dados Ocultos' : 'Modo Demo'}
        </span>
      )}
    </Button>
  );
};
