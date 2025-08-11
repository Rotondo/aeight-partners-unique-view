
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Building2, Target, Clock, CheckCircle, XCircle } from "lucide-react";
import { WishlistItem } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useWishlistMutations } from "@/hooks/useWishlistMutations";
import { useWishlist } from "@/contexts/WishlistContext";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface WishlistOportunidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItem: WishlistItem | null;
}

export const WishlistOportunidadeModal: React.FC<WishlistOportunidadeModalProps> = ({
  isOpen,
  onClose,
  wishlistItem,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [existingOppId, setExistingOppId] = useState<string | null>(null);
  const { fetchWishlistItems, fetchApresentacoes } = useWishlist();
  const { convertToOportunidade } = useWishlistMutations(fetchWishlistItems, fetchWishlistItems, fetchApresentacoes);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingOpportunity = async () => {
      if (!wishlistItem) return;
      // Busca a apresentação mais recente ligada ao item e verifica se tem oportunidade vinculada
      const { data: ap, error } = await supabase
        .from("wishlist_apresentacoes")
        .select("id, oportunidade_id")
        .eq("wishlist_item_id", wishlistItem.id)
        .order("created_at", { ascending: false })
        .maybeSingle();
      if (!error && ap?.oportunidade_id) {
        setExistingOppId(ap.oportunidade_id);
      } else {
        setExistingOppId(null);
      }
    };
    checkExistingOpportunity();
  }, [wishlistItem]);

  if (!wishlistItem) return null;

  // Correct field mapping based on user feedback
  const nomeOportunidade = wishlistItem.empresa_desejada?.nome || "Cliente não identificado";
  const empresaOrigem = wishlistItem.empresa_proprietaria?.nome || "Origem não identificada";
  const empresaDestino = wishlistItem.empresa_interessada?.nome || "Destino não identificado";
  const dataHoje = format(new Date(), "dd/MM/yyyy");
  const status = "Em contato";
  
  // Determine tipo based on company types - both proprietaria and interessada
  const tipoProprietariaIntra = wishlistItem.empresa_proprietaria?.tipo === "intragrupo";
  const tipoInteressadaIntra = wishlistItem.empresa_interessada?.tipo === "intragrupo";
  const tipo = (tipoProprietariaIntra && tipoInteressadaIntra) ? "INTRAGRUPO" : "EXTRAGRUPO";

  const handleAprovar = async () => {
    if (!wishlistItem) return;
    
    setIsCreating(true);
    try {
      const oportunidadeData = {
        empresa_origem_id: wishlistItem.empresa_proprietaria_id,
        empresa_destino_id: wishlistItem.empresa_interessada_id,
        nome_lead: nomeOportunidade,
        status: "em_contato",
        data_indicacao: new Date().toISOString(),
        observacoes: `Oportunidade criada a partir da wishlist. Item ID: ${wishlistItem.id}`,
      };

      await convertToOportunidade(wishlistItem.id, oportunidadeData);
      
      toast({
        title: "✅ Oportunidade criada",
        description: `A oportunidade "${nomeOportunidade}" foi criada com sucesso.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Erro ao criar oportunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a oportunidade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleIrParaOportunidade = () => {
    if (existingOppId) {
      // Navega para a listagem de oportunidades e aplica seleção/ancora por ID (se houver rota de detalhe, ajustar aqui)
      navigate(`/oportunidades`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Visualizar Oportunidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Nome da Oportunidade */}
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome da Oportunidade</label>
                    <p className="text-lg font-semibold text-gray-900">{nomeOportunidade}</p>
                  </div>
                </div>

                {/* Origem e Destino */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Origem</label>
                      <p className="font-medium text-gray-900">{empresaOrigem}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Destino</label>
                      <p className="font-medium text-gray-900">{empresaDestino}</p>
                    </div>
                  </div>
                </div>

                {/* Data e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data</label>
                      <p className="font-medium text-gray-900">{dataHoje}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Tipo */}
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo</label>
                    <Badge 
                      variant="outline" 
                      className={tipo === "INTRAGRUPO" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-orange-50 text-orange-700 border-orange-200"
                      }
                    >
                      {tipo}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </Button>
            {existingOppId ? (
              <Button
                onClick={handleIrParaOportunidade}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4" />
                Ver Oportunidade
              </Button>
            ) : (
              <Button
                onClick={handleAprovar}
                disabled={isCreating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                {isCreating ? "Criando..." : "Aprovar e Criar"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
