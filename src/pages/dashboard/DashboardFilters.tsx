import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Empresa } from "@/types";

interface DashboardFiltersProps {
  tipoFiltro: string;
  setTipoFiltro: (value: string) => void;
  statusFiltro: string;
  setStatusFiltro: (value: string) => void;
  periodo: string;
  setPeriodo: (value: string) => void;
  empresaFiltroType: string;
  setEmpresaFiltroType: (value: string) => void;
  empresaFiltro: string;
  setEmpresaFiltro: (value: string) => void;
  empresas: Empresa[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  tipoFiltro,
  setTipoFiltro,
  statusFiltro,
  setStatusFiltro,
  periodo,
  setPeriodo,
  empresaFiltroType,
  setEmpresaFiltroType,
  empresaFiltro,
  setEmpresaFiltro,
  empresas,
  searchTerm,
  setSearchTerm,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Filtros do Gráfico</CardTitle>
      <CardDescription>Refine os dados exibidos no gráfico</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col md:flex-row gap-4">
      <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="intra">Intra Grupo</SelectItem>
          <SelectItem value="extra">Extra Grupo</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFiltro} onValueChange={setStatusFiltro}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="ganho">Ganho</SelectItem>
          <SelectItem value="perdido">Perdido</SelectItem>
          <SelectItem value="andamento">Em Andamento</SelectItem>
        </SelectContent>
      </Select>
      <Select value={periodo} onValueChange={setPeriodo}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mes">Mensal</SelectItem>
          <SelectItem value="quarter">Quarter (trimestre)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={empresaFiltroType} onValueChange={setEmpresaFiltroType}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Tipo de Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="remetente">Origem</SelectItem>
          <SelectItem value="destinatario">Destino</SelectItem>
        </SelectContent>
      </Select>
      <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {empresas.map((e) => (
            <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Buscar empresa..."
        value={searchTerm}
        className="w-[200px]"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </CardContent>
  </Card>
);
