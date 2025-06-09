
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, Search, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EmpresasClientesPage: React.FC = () => {
  const { empresasClientes, loading } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientes = empresasClientes.filter(cliente =>
    cliente.empresa_cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa_proprietaria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie a base de clientes de cada parceiro
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresasClientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proprietários Únicos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(empresasClientes.map(c => c.empresa_proprietaria_id)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relacionamentos Ativos</CardTitle>
            <Badge variant="outline">Ativo</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {empresasClientes.filter(c => c.status).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {cliente.empresa_cliente?.nome}
                  </CardTitle>
                  <CardDescription>
                    Proprietário: {cliente.empresa_proprietaria?.nome}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cliente.status ? "default" : "secondary"}>
                    {cliente.status ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">
                    {cliente.empresa_cliente?.tipo}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Relacionamento desde {" "}
                  {format(new Date(cliente.data_relacionamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                {cliente.observacoes && (
                  <p className="text-sm text-muted-foreground">
                    {cliente.observacoes}
                  </p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Solicitar Apresentação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClientes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Adicione o primeiro cliente à base"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmpresasClientesPage;
