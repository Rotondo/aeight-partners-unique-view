import React from 'react';
import { UsuariosList } from '@/components/admin/UsuariosList';

const UsuariosAdminPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestão de Usuários</h1>
      <UsuariosList empresaId={null} />
    </div>
  );
};

export default UsuariosAdminPage; 