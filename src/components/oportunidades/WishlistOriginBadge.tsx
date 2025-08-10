
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WishlistOriginBadgeProps {
  isFromWishlist?: boolean;
  wishlistItemId?: string;
  className?: string;
}

export const WishlistOriginBadge: React.FC<WishlistOriginBadgeProps> = ({
  isFromWishlist = false,
  wishlistItemId,
  className = ""
}) => {
  const navigate = useNavigate();

  if (!isFromWishlist) return null;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <GitBranch className="h-3 w-3 mr-1" />
              Origem: Wishlist
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Esta oportunidade foi criada automaticamente a partir de uma apresentação da wishlist</p>
          </TooltipContent>
        </Tooltip>
        
        {wishlistItemId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/wishlist/itens")}
            className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver Wishlist
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
