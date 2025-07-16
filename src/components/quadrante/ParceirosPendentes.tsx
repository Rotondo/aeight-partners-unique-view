import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, AlertCircle } from "lucide-react";
import { Empresa } from "@/types";

interface ParceirosPendentesProps {
  empresas: Empresa[];
  empresasComIndicadores: string[];
  onAvaliarParceiro: (empresa: Empresa) => void;
}

const ParceirosPendentes: React.FC<ParceirosPendentesProps> = ({
  empresas,
  empresasComIndicadores,
  onAvaliarParceiro,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar apenas parceiros sem indicadores
  const parceirosPendentes = empresas
    .filter(empresa => 
      empresa.tipo === "parceiro" && 
      !empresasComIndicadores.includes(empresa.id)
    )
    .filter(empresa => 
      empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div className="space-y-4">
      {/* Cabeçalho com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Parceiros Pendentes</h3>
          <Badge variant="secondary">
            {parceirosPendentes.length} restante{parceirosPendentes.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar parceiros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de parceiros pendentes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {parceirosPendentes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                {searchTerm ? (
                  <p>Nenhum parceiro pendente encontrado com "{searchTerm}"</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">
                      🎉 Todos os parceiros já foram avaliados!
                    </p>
                    <p className="text-sm">
                      Todos os parceiros cadastrados já possuem indicadores no quadrante.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          parceirosPendentes.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{empresa.nome}</h4>
                    {empresa.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {empresa.descricao}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {empresa.tipo}
                      </Badge>
                      <Badge 
                        variant={empresa.status ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {empresa.status ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => onAvaliarParceiro(empresa)}
                    className="ml-4"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Avaliar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações adicionais */}
      {parceirosPendentes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-800">
              💡 Dica
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-amber-700">
              Clique em "Avaliar" para abrir o formulário de indicadores já preenchido com o parceiro selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParceirosPendentes;