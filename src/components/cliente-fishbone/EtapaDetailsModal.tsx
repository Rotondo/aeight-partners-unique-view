import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Building, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EtapaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  etapa: {
    id: string;
    nome: string;
    descricao?: string;
    cor?: string;
    gaps: number;
    fornecedores: {
      id: string;
      nome: string;
      is_parceiro: boolean;
      performance_score?: number;
    }[];
    subniveis: {
      id: string;
      nome: string;
      fornecedores: {
        id: string;
        nome: string;
        is_parceiro: boolean;
        performance_score?: number;
      }[];
    }[];
  };
  onAddFornecedor: (etapaId: string, subnivelId?: string) => void;
  onEditFornecedor: (fornecedorId: string) => void;
}

const EtapaDetailsModal: React.FC<EtapaDetailsModalProps> = ({
  isOpen,
  onClose,
  etapa,
  onAddFornecedor,
  onEditFornecedor
}) => {
  const { toast } = useToast();

  const totalFornecedores = etapa.fornecedores.length + 
    etapa.subniveis.reduce((acc, sub) => acc + sub.fornecedores.length, 0);
  
  const totalParceiros = etapa.fornecedores.filter(f => f.is_parceiro).length +
    etapa.subniveis.reduce((acc, sub) => acc + sub.fornecedores.filter(f => f.is_parceiro).length, 0);

  const getStatusColor = () => {
    if (totalParceiros > 0) return 'hsl(var(--fishbone-partner))';
    if (totalFornecedores > 0) return 'hsl(var(--fishbone-supplier))';
    return 'hsl(var(--fishbone-gap-critical))';
  };

  const getStatusIcon = () => {
    if (totalParceiros > 0) return <Users className="h-4 w-4" />;
    if (totalFornecedores > 0) return <Building className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (totalParceiros > 0) return `${totalParceiros} Parceiro(s) ativo(s)`;
    if (totalFornecedores > 0) return `${totalFornecedores} Fornecedor(es) sem parcerias`;
    return 'Gap crítico - Sem fornecedores';
  };

  const FornecedorCard = ({ fornecedor, onEdit }: { 
    fornecedor: { id: string; nome: string; is_parceiro: boolean; performance_score?: number }; 
    onEdit: () => void;
  }) => (
    <div 
      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
      onClick={onEdit}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: fornecedor.is_parceiro ? 'hsl(var(--fishbone-partner))' : 'hsl(var(--fishbone-supplier))' }}
        />
        <div>
          <div className="font-medium text-sm">{fornecedor.nome}</div>
          <div className="text-xs text-muted-foreground">
            {fornecedor.is_parceiro ? 'Parceiro Ativo' : 'Fornecedor'}
            {fornecedor.performance_score && ` • Score: ${fornecedor.performance_score}`}
          </div>
        </div>
      </div>
      <Badge variant={fornecedor.is_parceiro ? "default" : "secondary"}>
        {fornecedor.is_parceiro ? 'Parceiro' : 'Fornecedor'}
      </Badge>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
            {etapa.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
            <div style={{ color: getStatusColor() }}>
              {getStatusIcon()}
            </div>
            <div>
              <div className="font-medium">{getStatusText()}</div>
              <div className="text-sm text-muted-foreground">
                {totalFornecedores} fornecedor(es) total • {etapa.subniveis.length} subnível(is)
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onAddFornecedor(etapa.id);
                toast({
                  title: "Adicionar Fornecedor",
                  description: "Abrindo seleção de empresas para esta etapa"
                });
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </div>

          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {/* Fornecedores diretos */}
              {etapa.fornecedores.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Fornecedores Diretos ({etapa.fornecedores.length})
                  </h4>
                  <div className="space-y-2">
                    {etapa.fornecedores.map(fornecedor => (
                      <FornecedorCard
                        key={fornecedor.id}
                        fornecedor={fornecedor}
                        onEdit={() => onEditFornecedor(fornecedor.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Subníveis */}
              {etapa.subniveis.map(subnivel => (
                <div key={subnivel.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {subnivel.nome} ({subnivel.fornecedores.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onAddFornecedor(etapa.id, subnivel.id);
                        toast({
                          title: "Adicionar ao Subnível",
                          description: `Adicionando fornecedor ao subnível ${subnivel.nome}`
                        });
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {subnivel.fornecedores.length > 0 ? (
                    <div className="space-y-2 ml-4">
                      {subnivel.fornecedores.map(fornecedor => (
                        <FornecedorCard
                          key={fornecedor.id}
                          fornecedor={fornecedor}
                          onEdit={() => onEditFornecedor(fornecedor.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="ml-4 p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-sm">Nenhum fornecedor neste subnível</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty state */}
              {totalFornecedores === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Esta etapa não possui fornecedores cadastrados
                  </div>
                  <Button
                    className="mt-3"
                    onClick={() => onAddFornecedor(etapa.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Fornecedor
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EtapaDetailsModal;