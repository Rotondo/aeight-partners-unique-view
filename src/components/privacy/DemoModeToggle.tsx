
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const DemoModeToggle: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = usePrivacy();
  const { user } = useAuth();

  // Só mostrar para admins
  if (user?.papel !== 'admin') {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isDemoMode ? "default" : "outline"}
            size="icon"
            onClick={toggleDemoMode}
            className={isDemoMode ? "bg-amber-500 hover:bg-amber-600" : ""}
          >
            {isDemoMode ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDemoMode ? "Sair do modo demonstração" : "Ativar modo demonstração"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
