import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, TrendingUp } from "lucide-react";

interface FishboneNodeData {
  type: 'cliente' | 'etapa' | 'fornecedor';
  label: string;
  subtitle?: string;
  isParceiro?: boolean;
  score?: number;
  gaps?: number;
  logoUrl?: string;
  color?: string;
}

const FishboneNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = (data as unknown) as FishboneNodeData;
  const getNodeStyle = () => {
    switch (nodeData.type) {
      case 'cliente':
        return {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          minWidth: '200px'
        };
      case 'etapa':
        return {
          background: nodeData.color || 'hsl(var(--secondary))',
          color: 'hsl(var(--secondary-foreground))',
          minWidth: '160px'
        };
      case 'fornecedor':
        return {
          background: nodeData.isParceiro 
            ? 'hsl(var(--primary))' 
            : 'hsl(var(--destructive))',
          color: nodeData.isParceiro 
            ? 'hsl(var(--primary-foreground))' 
            : 'hsl(var(--destructive-foreground))',
          minWidth: '140px'
        };
      default:
        return {};
    }
  };

  const getIcon = () => {
    switch (nodeData.type) {
      case 'cliente':
        return <Building2 className="h-4 w-4" />;
      case 'etapa':
        return <Users className="h-4 w-4" />;
      case 'fornecedor':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="border-2 shadow-lg"
      style={getNodeStyle()}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {nodeData.logoUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={nodeData.logoUrl} alt={nodeData.label} />
              <AvatarFallback className="text-xs">
                {getInitials(nodeData.label)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20">
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {nodeData.label}
            </div>
            {nodeData.subtitle && (
              <div className="text-xs opacity-80 truncate">
                {nodeData.subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Badges adicionais */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {nodeData.type === 'fornecedor' && (
            <Badge 
              variant={nodeData.isParceiro ? "default" : "destructive"}
              className="text-xs"
            >
              {nodeData.isParceiro ? 'Parceiro' : 'Fornecedor'}
            </Badge>
          )}
          
          {nodeData.gaps !== undefined && nodeData.gaps > 0 && (
            <Badge variant="outline" className="text-xs">
              {nodeData.gaps} gaps
            </Badge>
          )}
          
          {nodeData.score !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Score: {nodeData.score}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Handles para conexões */}
      {nodeData.type === 'cliente' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-white border-2 border-primary"
        />
      )}
      
      {nodeData.type === 'etapa' && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-secondary"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-secondary"
          />
        </>
      )}
      
      {nodeData.type === 'fornecedor' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-white border-2"
          style={{
            borderColor: nodeData.isParceiro 
              ? 'hsl(var(--primary))' 
              : 'hsl(var(--destructive))'
          }}
        />
      )}
    </Card>
  );
};

export default memo(FishboneNode);