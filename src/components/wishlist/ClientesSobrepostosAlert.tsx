
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientesSobrepostosAlertProps {
  totalSobrepostos: number;
  novosSobrepostos?: string[];
}

const ClientesSobrepostosAlert: React.FC<ClientesSobrepostosAlertProps> = ({
  totalSobrepostos,
  novosSobrepostos = []
}) => {
  const navigate = useNavigate();

  if (totalSobrepostos === 0) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        Oportunidades de Networking Detectadas
      </AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-2">
          <p>
            Encontramos <Badge variant="secondary" className="mx-1">{totalSobrepostos}</Badge> 
            clientes compartilhados entre diferentes parceiros.
          </p>
          
          {novosSobrepostos.length > 0 && (
            <div>
              <p className="font-medium mb-1">Novos clientes detectados:</p>
              <div className="flex flex-wrap gap-1">
                {novosSobrepostos.slice(0, 3).map((cliente, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cliente}
                  </Badge>
                ))}
                {novosSobrepostos.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{novosSobrepostos.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={() => navigate('/wishlist/sobrepostos')}
              className="text-xs"
            >
              <Users className="mr-1 h-3 w-3" />
              Ver Dashboard
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ClientesSobrepostosAlert;
