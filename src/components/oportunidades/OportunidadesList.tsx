
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOportunidades } from "./OportunidadesContext";
import { OportunidadesFilter } from "./OportunidadesFilter";
import { OportunidadesExport } from "./OportunidadesExport";
import { CreateClienteFromOportunidade } from "./CreateClienteFromOportunidade";
import { SugestoesParceirosIA } from "./SugestoesParceirosIA";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Eye, Trash2, Users, Brain } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OportunidadesListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export const OportunidadesList: React.FC<OportunidadesListProps> = ({
  onEdit,
  onView,
}) => {
  const { filteredOportunidades, deleteOportunidade, fetchOportunidades } = useOportunidades();
  const [selectedOportunidades, setSelectedOportunidades] = useState<string[]>([]);
  const [showIASuggestions, setShowIASuggestions] = useState(false);
  const [selectedOportunidadeForIA, setSelectedOportunidadeForIA] = useState<string | null>(null);

  const handleSelectOportunidade = (id: string) => {
    setSelectedOportunidades(prev => 
      prev.includes(id) 
        ? prev.filter(opId => opId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOportunidades.length === filteredOportunidades.length) {
      setSelectedOportunidades([]);
    } else {
      setSelectedOportunidades(filteredOportunidades.map(op => op.id));
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteOportunidade(id);
    if (success) {
      setSelectedOportunidades(prev => prev.filter(opId => opId !== id));
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "em_contato": "bg-blue-100 text-blue-800",
      "negociando": "bg-yellow-100 text-yellow-800", 
      "ganho": "bg-green-100 text-green-800",
      "perdido": "bg-red-100 text-red-800",
      "Contato": "bg-blue-100 text-blue-800",
      "Apresentado": "bg-purple-100 text-purple-800",
      "Sem contato": "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleIASuggestions = (oportunidadeId: string) => {
    setSelectedOportunidadeForIA(oportunidadeId);
    setShowIASuggestions(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Oportunidades</h2>
          <Badge variant="outline">
            {filteredOportunidades.length} oportunidade{filteredOportunidades.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedOportunidades.length === filteredOportunidades.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </Button>
          <CreateClienteFromOportunidade
            oportunidades={filteredOportunidades.filter(op => selectedOportunidades.includes(op.id))}
            onSuccess={() => {
              setSelectedOportunidades([]);
              fetchOportunidades();
            }}
          />
          <OportunidadesExport oportunidades={filteredOportunidades} />
        </div>
      </div>

      <OportunidadesFilter />

      <div className="grid gap-4">
        {filteredOportunidades.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Nenhuma oportunidade encontrada
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Ajuste os filtros ou crie uma nova oportunidade
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOportunidades.map((oportunidade) => (
            <Card key={oportunidade.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOportunidades.includes(oportunidade.id)}
                      onChange={() => handleSelectOportunidade(oportunidade.id)}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <CardTitle className="text-lg">{oportunidade.nome_lead}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        {oportunidade.empresa_origem?.nome} → {oportunidade.empresa_destino?.nome}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(oportunidade.status)}>
                      {oportunidade.status}
                    </Badge>
                    {oportunidade.valor && (
                      <Badge variant="outline">
                        {formatCurrency(oportunidade.valor)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Data de Indicação
                    </label>
                    <p className="text-sm">
                      {format(new Date(oportunidade.data_indicacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  {oportunidade.data_fechamento && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Data de Fechamento
                      </label>
                      <p className="text-sm">
                        {format(new Date(oportunidade.data_fechamento), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Responsável
                    </label>
                    <p className="text-sm">
                      {oportunidade.usuario_recebe?.nome || "Não definido"}
                    </p>
                  </div>
                </div>

                {oportunidade.observacoes && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground">
                      Observações
                    </label>
                    <p className="text-sm mt-1 bg-muted/50 p-2 rounded text-muted-foreground">
                      {oportunidade.observacoes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIASuggestions(oportunidade.id)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    IA Sugestões
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(oportunidade.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(oportunidade.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(oportunidade.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showIASuggestions && selectedOportunidadeForIA && (
        <SugestoesParceirosIA
          oportunidadeId={selectedOportunidadeForIA}
          onClose={() => {
            setShowIASuggestions(false);
            setSelectedOportunidadeForIA(null);
          }}
        />
      )}
    </div>
  );
};
