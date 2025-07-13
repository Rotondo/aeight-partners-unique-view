
import * as React from "react";

// Ensure React is properly initialized
if (!React || typeof React.useState !== 'function') {
  console.error('[Logo] React is not properly initialized');
  throw new Error('React is not properly initialized - hooks are not available');
}

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "h-8 w-auto", 
  variant = "light" 
}) => {
  // Por enquanto, vou usar um placeholder até o upload das imagens
  // Você pode fazer upload das imagens do logo no bucket 'logos' do Supabase
  const logoUrl = variant === "light" 
    ? "https://amuadbftctnmckncgeua.supabase.co/storage/v1/object/public/logos/aeight-logo-light.png"
    : "https://amuadbftctnmckncgeua.supabase.co/storage/v1/object/public/logos/aeight-logo-dark.png";

  return (
    <div className="flex items-center">
      <img
        src={logoUrl}
        alt="A&eight"
        className={className}
        onError={(e) => {
          // Fallback para texto se a imagem não carregar
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.logo-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'logo-fallback text-xl font-bold text-primary';
            fallback.textContent = 'A&eight';
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
};
