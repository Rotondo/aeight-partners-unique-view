import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PrivateData } from '@/components/privacy/PrivateData';

interface IcsEvent {
  summary: string;
  description?: string;
  dtstart: string;
  dtend: string;
  location?: string;
  organizer?: string;
}

interface CalendarIcsParserProps {
  icsUrl: string;
  onEventsLoaded: (events: IcsEvent[]) => void;
}

export const CalendarIcsParser: React.FC<CalendarIcsParserProps> = ({ 
  icsUrl, 
  onEventsLoaded 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<IcsEvent[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const parseIcsDate = (dateString: string): string => {
    // Remove timezone info and parse
    const cleanDate = dateString.replace(/[TZ]/g, ' ').trim();
    const year = cleanDate.substring(0, 4);
    const month = cleanDate.substring(4, 6);
    const day = cleanDate.substring(6, 8);
    const hour = cleanDate.substring(9, 11) || '00';
    const minute = cleanDate.substring(11, 13) || '00';
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
  };

  const parseIcsContent = (icsContent: string): IcsEvent[] => {
    const events: IcsEvent[] = [];
    const lines = icsContent.split('\n').map(line => line.trim());
    
    let currentEvent: Partial<IcsEvent> = {};
    let inEvent = false;
    
    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
          events.push({
            summary: currentEvent.summary,
            description: currentEvent.description,
            dtstart: parseIcsDate(currentEvent.dtstart),
            dtend: parseIcsDate(currentEvent.dtend),
            location: currentEvent.location,
            organizer: currentEvent.organizer
          });
        }
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith('DTSTART')) {
          const value = line.split(':')[1];
          currentEvent.dtstart = value;
        } else if (line.startsWith('DTEND')) {
          const value = line.split(':')[1];
          currentEvent.dtend = value;
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        } else if (line.startsWith('ORGANIZER')) {
          currentEvent.organizer = line.split(':')[1];
        }
      }
    }
    
    return events;
  };

  const fetchCalendarEvents = async () => {
    if (!icsUrl) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, you would need a proxy or edge function
      // to fetch the ICS file due to CORS restrictions
      const response = await fetch(`/api/calendar-proxy?url=${encodeURIComponent(icsUrl)}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar calendário');
      }
      
      const icsContent = await response.text();
      const parsedEvents = parseIcsContent(icsContent);
      
      setEvents(parsedEvents);
      setLastFetch(new Date());
      onEventsLoaded(parsedEvents);
      
      toast({
        title: "Sucesso",
        description: `${parsedEvents.length} eventos carregados do calendário`
      });
    } catch (error) {
      console.error('Erro ao buscar eventos do calendário:', error);
      
      // Simular eventos para demonstração
      const mockEvents: IcsEvent[] = [
        {
          summary: "Reunião de equipe",
          description: "Reunião semanal da equipe",
          dtstart: new Date().toISOString(),
          dtend: new Date(Date.now() + 3600000).toISOString(),
          location: "Sala de reuniões"
        },
        {
          summary: "Call com cliente",
          description: "Apresentação do projeto",
          dtstart: new Date(Date.now() + 86400000).toISOString(),
          dtend: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          location: "Online"
        }
      ];
      
      setEvents(mockEvents);
      setLastFetch(new Date());
      onEventsLoaded(mockEvents);
      
      toast({
        title: "Modo Demonstração",
        description: "Usando eventos simulados (CORS limitado)",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Eventos do Calendário
        </CardTitle>
        <CardDescription>
          Eventos sincronizados do calendário externo
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <Button 
            onClick={fetchCalendarEvents}
            disabled={isLoading}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <Download className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Carregar Eventos
          </Button>
          
          {events.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {events.length} eventos encontrados
                </Badge>
                {lastFetch && (
                  <span className="text-xs text-muted-foreground">
                    {lastFetch.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {events.slice(0, 5).map((event, index) => (
                  <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                    <div className="font-medium">
                      <PrivateData type="generic">{event.summary}</PrivateData>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(event.dtstart).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(event.dtstart).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {event.location && (
                      <div className="text-muted-foreground">
                        📍 <PrivateData type="address">{event.location}</PrivateData>
                      </div>
                    )}
                  </div>
                ))}
                {events.length > 5 && (
                  <div className="text-xs text-center text-muted-foreground py-1">
                    +{events.length - 5} eventos adicionais
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
