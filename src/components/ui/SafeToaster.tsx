
import React from 'react';
import { Toaster } from './sonner';

interface SafeToasterProps {
  children?: React.ReactNode;
}

const SafeToaster: React.FC<SafeToasterProps> = () => {
  // Simple check to ensure component is mounting in proper React context
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Mark as mounted after React has fully rendered
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  try {
    return <Toaster />;
  } catch (error) {
    console.error('[SafeToaster] Error rendering Toaster:', error);
    return null;
  }
};

export default SafeToaster;
