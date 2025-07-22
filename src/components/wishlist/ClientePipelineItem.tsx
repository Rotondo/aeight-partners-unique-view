
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WishlistApresentacao, PipelineFase } from "@/types";
import { useWishlistMutations } from "@/hooks/useWishlistMutations";
import { PrivateData } from "@/components/privacy/PrivateData";

interface ClientePipelineItemProps {
  apresentacao: WishlistApresentacao;
  onUpdate: () => void;
}

const ClientePipelineItem: React.FC<ClientePipelineItemProps> = ({
  apresentacao,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fase_pipeline: apresentacao.fase_pipeline,
    executivo_responsavel_id: apresentacao.executivo_responsavel_id || "",
    data_planejada: apresentacao.data_planejada ? format(new Date(apresentacao.data_planejada), "yyyy-MM-dd") : "",
    feedback: apresentacao.feedback || "",
  });

  const { updateApresentacao } = useWishlistMutations(
    async () => {},
    async () => {},
    async () => {}
  );

  const faseLabels: Record<PipelineFase, string> = {
    aprovado: "Aprovado",
    planejado: "Planejado",
    apresentado: "Apresentado",
    aguardando_feedback: "Aguardando Feedback",
    convertido: "Convertido",
    rejeitado: "Rejeitado",
  };

  const handleSave = async () => {
    if (!updateApresentacao) return;

    const updatePayload: any = {
      fase_pipeline: editData.fase_pipeline,
      feedback: editData.feedback,
    };

    if (editData.executivo_responsavel_id) {
      updatePayload.executivo_responsavel_id = editData.executivo_responsavel_id;
    }

    if (editData.data_planejada) {
      updatePayload.data_planejada = new Date(editData.data_planejada).toISOString();
    }

    await updateApresentacao(apresentacao.id, updatePayload);
    setIsEditing(false);
    onUpdate();
  };

  const handleCancel = () => {
    setEditData({
      fase_pipeline: apresentacao.fase_pipeline,
      executivo_responsavel_id: apresentacao.executivo_responsavel_id || "",
      data_planejada: apresentacao.data_planejada ? format(new Date(apresentacao.data_planejada), "yyyy-MM-dd") : "",
      feedback: apresentacao.feedback || "",
    });
    setIsEditing(false);
  };

  const clienteNome = apresentacao.wishlist_item?.empresa_desejada?.nome || "Cliente não identificado";

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                <PrivateData type="company">{clienteNome}</PrivateData>
              </h4>
              {apresentacao.executivo_responsavel && (
                <p className="text-xs text-muted-foreground">
                  Executivo: <PrivateData type="generic">{apresentacao.executivo_responsavel.nome}</PrivateData>
                </p>
              )}
              {apresentacao.data_planejada && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(apresentacao.data_planejada), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>

          {isEditing && (
            <div className="space-y-2 pt-2 border-t">
              <Select
                value={editData.fase_pipeline}
                onValueChange={(value) => setEditData({ ...editData, fase_pipeline: value as PipelineFase })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(faseLabels).map(([fase, label]) => (
                    <SelectItem key={fase} value={fase}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={editData.data_planejada}
                onChange={(e) => setEditData({ ...editData, data_planejada: e.target.value })}
                className="h-8 text-xs"
                placeholder="Data planejada"
              />

              <Textarea
                value={editData.feedback}
                onChange={(e) => setEditData({ ...editData, feedback: e.target.value })}
                placeholder="Observações..."
                className="text-xs resize-none"
                rows={2}
              />

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="h-6 px-2 text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {apresentacao.feedback && !isEditing && (
            <p className="text-xs text-muted-foreground border-t pt-1">
              <PrivateData type="generic">{apresentacao.feedback}</PrivateData>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientePipelineItem;
