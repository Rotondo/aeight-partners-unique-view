
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Button } from '@/components/ui/button';

export const DemoModeIndicator: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = usePrivacy();

  if (!isDemoMode) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-amber-800">
          <strong>Modo Demonstração Ativo:</strong> Dados sensíveis estão ocultos para proteção da privacidade.
        </span>
        <Button
          variant="outline" 
          size="sm"
          onClick={toggleDemoMode}
          className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <EyeOff className="h-4 w-4 mr-2" />
          Desativar
        </Button>
      </AlertDescription>
    </Alert>
  );
};
