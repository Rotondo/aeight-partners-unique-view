
import React from 'react';
import { Categoria } from '@/types';
import OnePagerForm from './OnePagerForm';

interface OnePagerUploadProps {
  categorias: Categoria[];
  onSuccess?: () => void;
}

const OnePagerUpload: React.FC<OnePagerUploadProps> = ({
  categorias,
  onSuccess,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <OnePagerForm 
        categorias={categorias}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default OnePagerUpload;
