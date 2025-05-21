import React from "react";

const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center">
      <svg
        className="animate-spin h-10 w-10 text-primary mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <span className="text-lg text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

export default LoadingScreen;
