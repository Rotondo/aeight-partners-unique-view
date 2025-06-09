
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, CheckCircle } from 'lucide-react';
import { getAtividadesPendentes } from '@/lib/dbFunctionsActivities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityIndicatorProps {
  oportunidadeId: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ 
  oportunidadeId 
}) => {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const activities = await getAtividadesPendentes(oportunidadeId);
        setAtividades(activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (oportunidadeId) {
      fetchActivities();
    }
  }, [oportunidadeId]);

  if (loading || atividades.length === 0) {
    return null;
  }

  // Find the most urgent activity (earliest date)
  const nextActivity = atividades.reduce((earliest, current) => {
    const currentDate = new Date(current.data_prevista);
    const earliestDate = new Date(earliest.data_prevista);
    return currentDate < earliestDate ? current : earliest;
  });

  const today = new Date();
  const activityDate = new Date(nextActivity.data_prevista);
  
  // Determine urgency level
  const isOverdue = isBefore(activityDate, today);
  const isDueToday = format(activityDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isDueSoon = isAfter(activityDate, today) && isBefore(activityDate, addDays(today, 3));

  const getIndicatorColor = () => {
    if (isOverdue) return 'bg-red-500 text-white';
    if (isDueToday) return 'bg-orange-500 text-white';
    if (isDueSoon) return 'bg-yellow-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getIcon = () => {
    if (isOverdue) return <Clock className="h-3 w-3" />;
    if (isDueToday) return <CalendarDays className="h-3 w-3" />;
    return <CalendarDays className="h-3 w-3" />;
  };

  const getTooltipText = () => {
    const dateText = format(activityDate, "dd 'de' MMMM", { locale: ptBR });
    if (isOverdue) return `Atividade em atraso: ${nextActivity.titulo} (${dateText})`;
    if (isDueToday) return `Atividade para hoje: ${nextActivity.titulo}`;
    if (isDueSoon) return `Atividade próxima: ${nextActivity.titulo} (${dateText})`;
    return `Próxima atividade: ${nextActivity.titulo} (${dateText})`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`flex items-center gap-1 cursor-help ${getIndicatorColor()}`}
          >
            {getIcon()}
            <span className="text-xs">{atividades.length}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{getTooltipText()}</p>
            {atividades.length > 1 && (
              <p className="text-sm text-muted-foreground">
                +{atividades.length - 1} outras atividades
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
