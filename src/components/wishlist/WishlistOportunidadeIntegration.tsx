
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight, CheckCircle, Clock, Target } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WishlistOportunidadeIntegrationProps {
  showDetailedFlow?: boolean;
  className?: string;
}

export const WishlistOportunidadeIntegration: React.FC<WishlistOportunidadeIntegrationProps> = ({
  showDetailedFlow = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Como funciona a integração</CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Automático
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-blue-800">
            A wishlist e as oportunidades estão totalmente integradas. Quando uma apresentação 
            atinge a fase <strong>"Apresentado"</strong>, uma oportunidade é criada automaticamente.
          </p>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Wishlist Item</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Apresentação</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Oportunidade</span>
            </div>
          </div>

          {showDetailedFlow && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-700 hover:text-blue-800">
                  {isOpen ? "Ver menos" : "Ver fluxo detalhado"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div className="border-l-2 border-blue-200 pl-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">1. Item Aprovado na Wishlist</p>
                      <p className="text-xs text-gray-600">Automaticamente cria uma apresentação pendente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">2. Apresentação Realizada</p>
                      <p className="text-xs text-gray-600">Status muda para "apresentado" no pipeline</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">3. Oportunidade Criada</p>
                      <p className="text-xs text-gray-600">Automaticamente vinculada e visível em Oportunidades</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Dica:</strong> Mudanças no status da oportunidade também são sincronizadas 
                    de volta para o pipeline da wishlist, mantendo tudo atualizado.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
