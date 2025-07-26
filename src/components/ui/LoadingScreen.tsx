
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Carregando...</h2>
          <p className="text-gray-600">Aguarde enquanto conectamos você ao sistema</p>
        </div>
      </div>
    </div>
  );
};
