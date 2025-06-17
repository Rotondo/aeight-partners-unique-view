
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { EmpresaCliente } from "@/types";

interface ClientesStatsProps {
  empresasClientes: EmpresaCliente[];
}

const ClientesStats: React.FC<ClientesStatsProps> = ({ empresasClientes }) => {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-xs font-medium">
            Total de Clientes Vinculados
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold">
            {empresasClientes.length}
          </span>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-xs font-medium">
            Proprietários Únicos
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xl font-bold">
            {new Set(
              empresasClientes.map((c) => c.empresa_proprietaria_id)
            ).size}
          </span>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-xs font-medium">
            Relacionamentos Ativos
          </CardTitle>
          <Badge variant="outline" className="ml-2">
            Ativo
          </Badge>
          <span className="text-xl font-bold">
            {empresasClientes.filter((c) => c.status).length}
          </span>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ClientesStats;
