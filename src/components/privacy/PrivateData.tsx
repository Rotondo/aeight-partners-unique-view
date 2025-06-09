
import React, { ReactNode } from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { cn } from '@/lib/utils';

interface PrivateDataProps {
  children: ReactNode;
  type?: 'blur' | 'asterisk' | 'placeholder' | 'hide';
  placeholder?: string;
  className?: string;
}

export const PrivateData: React.FC<PrivateDataProps> = ({
  children,
  type = 'blur',
  placeholder,
  className
}) => {
  const { isDemoMode } = usePrivacy();

  if (!isDemoMode) {
    return <>{children}</>;
  }

  const getDisplayContent = () => {
    switch (type) {
      case 'blur':
        return (
          <span 
            className={cn("select-none", className)}
            style={{ filter: 'blur(4px)' }}
          >
            {children}
          </span>
        );
      case 'asterisk':
        return <span className={className}>***</span>;
      case 'placeholder':
        return <span className={cn("text-muted-foreground", className)}>{placeholder || "Dados ocultos"}</span>;
      case 'hide':
        return <span className={className}>---</span>;
      default:
        return <>{children}</>;
    }
  };

  return getDisplayContent();
};
