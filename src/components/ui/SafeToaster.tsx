
import React from 'react';
import { Toaster } from './sonner';

interface SafeToasterProps {
  children?: React.ReactNode;
}

const SafeToaster: React.FC<SafeToasterProps> = () => {
  // Check if React is properly initialized before rendering Toaster
  const [isReactReady, setIsReactReady] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure React context is fully established
    const timer = setTimeout(() => {
      setIsReactReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Don't render Toaster until React is confirmed to be ready
  if (!isReactReady) {
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
