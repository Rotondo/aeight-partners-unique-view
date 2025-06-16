import React from 'react';
import { AdminPage } from '@/components/admin/AdminPage';
import DiarioConfigPage from '@/components/admin/DiarioConfigPage';

// Exemplo de renderização condicional para abas/configurações (ajuste conforme sua lógica de navegação/admin)
const Admin: React.FC = () => {
  // Exemplo: se quiser rotas internas tipo /admin/diario-config use react-router-dom useLocation, etc.
  // Aqui, demonstração direta:
  const [aba, setAba] = React.useState<"principal"|"diario">("principal");

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <button className={`btn ${aba==="principal"?"btn-primary":"btn-secondary"}`} onClick={()=>setAba("principal")}>Administração Geral</button>
        <button className={`btn ${aba==="diario"?"btn-primary":"btn-secondary"}`} onClick={()=>setAba("diario")}>Configurações do Diário</button>
      </div>
      {aba==="diario" ? <DiarioConfigPage /> : <AdminPage />}
    </div>
  );
};

export default Admin;