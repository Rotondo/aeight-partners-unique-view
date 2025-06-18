
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, MessageSquare, Phone, Mail, Users, Video } from 'lucide-react';
import { CrmAcao, MetodoComunicacao, StatusAcaoCrm } from '@/types/diario';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CrmActionDetailProps {
  action: CrmAcao;
  onClose: () => void;
}

export const CrmActionDetail: React.FC<CrmActionDetailProps> = ({ action }) => {
  const getStatusColor = (status: StatusAcaoCrm) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: StatusAcaoCrm) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getComunicacaoIcon = (metodo: MetodoComunicacao) => {
    switch (metodo) {
      case 'whatsapp': return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'ligacao': return <Phone className="h-5 w-5 text-blue-600" />;
      case 'email': return <Mail className="h-5 w-5 text-red-600" />;
      case 'encontro': return <Users className="h-5 w-5 text-purple-600" />;
      case 'reuniao_meet': return <Video className="h-5 w-5 text-orange-600" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getComunicacaoLabel = (metodo: MetodoComunicacao) => {
    switch (metodo) {
      case 'whatsapp': return 'WhatsApp';
      case 'ligacao': return 'Ligação';
      case 'email': return 'E-mail';
      case 'encontro': return 'Encontro Presencial';
      case 'reuniao_meet': return 'Reunião Meet/Online';
      default: return metodo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getComunicacaoIcon(action.communication_method)}
            <h3 className="text-xl font-semibold">{action.description}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(action.status)}>
              {getStatusLabel(action.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              via {getComunicacaoLabel(action.communication_method)}
            </span>
          </div>
        </div>
      </div>

      {/* Informações básicas */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data:</span>
              <span>{format(new Date(action.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Horário:</span>
              <span>{format(new Date(action.created_at), 'HH:mm')}</span>
            </div>
            
            {action.parceiro && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Parceiro:</span>
                <span>{action.parceiro.nome}</span>
              </div>
            )}
            
            {action.usuario && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Responsável:</span>
                <span>{action.usuario.nome}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Descrição/Conteúdo:</h4>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="whitespace-pre-wrap leading-relaxed">{action.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Próximos passos */}
      {action.next_steps && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Próximos Passos:</h4>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="whitespace-pre-wrap leading-relaxed mb-2">{action.next_steps}</p>
              {action.next_step_date && (
                <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                  <Calendar className="h-4 w-4" />
                  Agendado para: {format(new Date(action.next_step_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadados */}
      {action.metadata && Object.keys(action.metadata).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Informações Adicionais:</h4>
            <div className="bg-muted/30 p-4 rounded-lg">
              <pre className="text-sm text-muted-foreground">
                {JSON.stringify(action.metadata, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
