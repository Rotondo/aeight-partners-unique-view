
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Building, 
  User, 
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import { Oportunidade, StatusOportunidade } from "@/types";
import { useOportunidades } from "./OportunidadesContext";
import { ActivityIndicator } from "./ActivityIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";

interface OportunidadesListProps {
  onEdit: (oportunidade: Oportunidade) => void;
  onView: (oportunidade: Oportunidade) => void;
}

export const OportunidadesList: React.FC<OportunidadesListProps> = ({
  onEdit,
  onView,
}) => {
  const { filteredOportunidades, isLoading, deleteOportunidade } = useOportunidades();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    oportunidade: Oportunidade | null;
  }>({ isOpen: false, oportunidade: null });

  const getStatusColor = (status: StatusOportunidade) => {
    const colors = {
      "em_contato": "bg-blue-100 text-blue-800",
      "negociando": "bg-yellow-100 text-yellow-800", 
      "ganho": "bg-green-100 text-green-800",
      "perdido": "bg-red-100 text-red-800",
      "Contato": "bg-blue-100 text-blue-800",
      "Apresentado": "bg-purple-100 text-purple-800",
      "Sem contato": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: StatusOportunidade) => {
    const labels = {
      "em_contato": "Em Contato",
      "negociando": "Negociando",
      "ganho": "Ganho", 
      "perdido": "Perdido",
      "Contato": "Contato",
      "Apresentado": "Apresentado",
      "Sem contato": "Sem Contato",
    };
    return labels[status] || status;
  };

  const handleDeleteClick = (oportunidade: Oportunidade) => {
    setDeleteConfirm({ isOpen: true, oportunidade });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.oportunidade) {
      await deleteOportunidade(deleteConfirm.oportunidade.id);
      setDeleteConfirm({ isOpen: false, oportunidade: null });
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredOportunidades.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma oportunidade encontrada
          </h3>
          <p className="text-gray-500 text-center">
            Não há oportunidades que correspondam aos filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOportunidades.map((oportunidade) => (
          <Card key={oportunidade.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    <PrivateData type="name">
                      {oportunidade.nome_lead}
                    </PrivateData>
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(oportunidade.status)}>
                      {getStatusLabel(oportunidade.status)}
                    </Badge>
                    <ActivityIndicator oportunidadeId={oportunidade.id} />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">De:</span>
                  <span className="font-medium">
                    <PrivateData type="name">
                      {oportunidade.empresa_origem?.nome || "N/A"}
                    </PrivateData>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Para:</span>
                  <span className="font-medium">
                    <PrivateData type="name">
                      {oportunidade.empresa_destino?.nome || "N/A"}
                    </PrivateData>
                  </span>
                </div>

                {oportunidade.usuario_envio && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Enviado por:</span>
                    <span className="font-medium">
                      <PrivateData type="name">
                        {oportunidade.usuario_envio.nome}
                      </PrivateData>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">
                    <PrivateData type="currency">
                      {formatCurrency(oportunidade.valor)}
                    </PrivateData>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {format(new Date(oportunidade.data_indicacao), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(oportunidade)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(oportunidade)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(oportunidade)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, oportunidade: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Oportunidade"
        description={`Tem certeza que deseja excluir a oportunidade "${deleteConfirm.oportunidade?.nome_lead}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </>
  );
};
