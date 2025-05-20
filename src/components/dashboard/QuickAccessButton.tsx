
import React from 'react';

interface QuickAccessButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ 
  href, 
  icon, 
  label, 
  description 
}) => (
  <a 
    href={href} 
    className="flex flex-col items-center p-3 rounded-lg border border-border hover:bg-accent transition-colors text-center"
  >
    <div className="bg-primary/10 p-2 rounded-full mb-2">
      {icon}
    </div>
    <h3 className="font-medium">{label}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </a>
);
