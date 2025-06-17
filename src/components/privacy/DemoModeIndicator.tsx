
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Button } from '@/components/ui/button';

export const DemoModeIndicator: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = usePrivacy();

  if (!isDemoMode) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-amber-800 font-medium">
            Modo Demonstração Ativo
          </span>
          <span className="text-amber-700 text-sm">
            • Dados sensíveis estão ocultos para proteção da privacidade
          </span>
        </div>
        <Button
          variant="outline" 
          size="sm"
          onClick={toggleDemoMode}
          className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0"
        >
          <EyeOff className="h-4 w-4 mr-2" />
          Desativar
        </Button>
      </AlertDescription>
    </Alert>
  );
};
