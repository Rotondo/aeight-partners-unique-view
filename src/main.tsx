
import React from 'react';
import * as ReactDOM from 'react-dom/client';

// Expose React and ReactDOM globally for the initializer
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

// Declare global type for TypeScript
declare global {
  interface Window {
    appInitializer?: any;
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
  }
}

// Import the vanilla JS initializer after exposing React
import('./lib/appInitializer.js').then(() => {
  // Start the initialization process
  window.appInitializer?.initialize();
});
