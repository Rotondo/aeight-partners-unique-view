
import React from 'react';
import { Toaster } from './sonner';

interface SafeToasterProps {
  children?: React.ReactNode;
}

const SafeToaster: React.FC<SafeToasterProps> = () => {
  // Check if React is properly initialized before rendering Toaster
  const [isReactReady, setIsReactReady] = React.useState(false);

  React.useEffect(() => {
    // Verify React context is fully established and we're not in initialization phase
    const checkReactReady = () => {
      try {
        // Ensure React hooks are working properly
        if (React && 
            typeof React.useState === 'function' && 
            typeof React.useEffect === 'function' &&
            !document.getElementById('root')?.hasAttribute('data-initializing')) {
          setIsReactReady(true);
        }
      } catch (error) {
        console.warn('[SafeToaster] React not fully ready yet:', error);
      }
    };

    // Small delay to ensure React context is fully established
    const timer = setTimeout(checkReactReady, 150);
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
