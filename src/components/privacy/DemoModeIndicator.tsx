
import React from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Badge } from '@/components/ui/badge';
import { EyeOff } from 'lucide-react';

export const DemoModeIndicator: React.FC = () => {
  const { isDemoMode } = usePrivacy();

  if (!isDemoMode) {
    return null;
  }

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      <EyeOff className="h-3 w-3 mr-1" />
      Modo Demonstração
    </Badge>
  );
};
