
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, AlertTriangle, Calendar, List } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useCrm } from '@/contexts/CrmContext';
import { AgendaService } from '@/services/AgendaService';
import type { AgendaEvento } from '@/types/diario';

export const CrmNextSteps: React.FC = () => {
  const { crmAcoes, updateAcaoCrm } = useCrm();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [overdueEvents, setOverdueEvents] = useState<AgendaEvento[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AgendaEvento[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // Filtrar ações com próximos passos pendentes
  const acoesComProximosPassos = crmAcoes.filter(acao => 
    acao.next_steps && 
    acao.status !== 'concluida' && 
    acao.status !== 'cancelada'
  );

  // Separar por status temporal
  const now = new Date();
  const acoesAtrasadas = acoesComProximosPassos.filter(acao => {
    if (!acao.next_step_date) return false;
    return new Date(acao.next_step_date) < now;
  });

  const acoesProximas = acoesComProximosPassos.filter(acao => {
    if (!acao.next_step_date) return true;
    return new Date(acao.next_step_date) >= now;
  });

  // Carregar eventos da agenda
  useEffect(() => {
    loadAgendaEvents();
  }, []);

  const loadAgendaEvents = async () => {
    try {
      const [overdue, upcoming] = await Promise.all([
        AgendaService.getOverdueEvents(),
        AgendaService.getUpcomingEvents()
      ]);
      setOverdueEvents(overdue);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Erro ao carregar eventos da agenda:', error);
    }
  };

  const marcarComoConcluida = async (acaoId: string) => {
    try {
      await updateAcaoCrm(acaoId, {
        status: 'concluida'
      });
      // Recarregar eventos da agenda após atualização
      await loadAgendaEvents();
    } catch (error) {
      console.error('Erro ao marcar como concluída:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return upcomingEvents.filter(event => 
      new Date(event.start).toDateString() === dateStr
    );
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const isOverdueDate = (date: Date) => {
    const dateStr = date.toDateString();
    return overdueEvents.some(event => 
      new Date(event.start).toDateString() === dateStr
    );
  };

  const getDateClassName = (date: Date) => {
    if (isOverdueDate(date)) return 'bg-red-100 text-red-900 hover:bg-red-200';
    if (hasEventsOnDate(date)) return 'bg-blue-100 text-blue-900 hover:bg-blue-200';
    return '';
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Próximos Passos com Calendário
              </CardTitle>
              <CardDescription>
                Ações pendentes integradas ao calendário - tarefas atrasadas destacadas em vermelho
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendário
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Atrasadas</p>
                    <div className="text-2xl font-bold text-red-700">{acoesAtrasadas.length}</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Próximas</p>
                    <div className="text-2xl font-bold text-blue-700">{acoesProximas.length}</div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Concluídas Hoje</p>
                    <div className="text-2xl font-bold text-green-700">
                      {crmAcoes.filter(a => 
                        a.status === 'concluida' && 
                        new Date(a.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {viewMode === 'calendar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendário */}
              <div>
                <h3 className="font-semibold mb-3">Calendário de Próximos Passos</h3>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-200"
                  classNames={{
                    day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  }}
                  modifiers={{
                    overdue: (date) => isOverdueDate(date),
                    hasEvents: (date) => hasEventsOnDate(date),
                  }}
                  modifiersClassNames={{
                    overdue: "bg-red-100 text-red-900 hover:bg-red-200",
                    hasEvents: "bg-blue-100 text-blue-900 hover:bg-blue-200",
                  }}
                />
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>Tarefas atrasadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Próximos passos agendados</span>
                  </div>
                </div>
              </div>

              {/* Eventos do dia selecionado */}
              <div>
                <h3 className="font-semibold mb-3">
                  Eventos de {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'hoje'}
                </h3>
                {selectedDate && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(event.start).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Badge>
                          {event.related_crm_action_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => marcarComoConcluida(event.related_crm_action_id!)}
                              className="text-xs"
                            >
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {getEventsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum evento nesta data</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tarefas Atrasadas */}
              {acoesAtrasadas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Tarefas Atrasadas ({acoesAtrasadas.length})
                  </h3>
                  <div className="space-y-3">
                    {acoesAtrasadas.map((acao) => (
                      <div key={acao.id} className="border rounded-lg p-3 bg-red-50 border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-red-900">{acao.description}</h4>
                          <Badge variant="destructive" className="text-xs">
                            Atrasada
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-red-700 mb-3">
                          {acao.next_steps}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <Clock className="h-3 w-3" />
                            Prevista: {acao.next_step_date ? 
                              new Date(acao.next_step_date).toLocaleDateString('pt-BR') : 
                              'Sem data'
                            }
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => marcarComoConcluida(acao.id)}
                            className="text-xs bg-red-600 hover:bg-red-700"
                          >
                            Concluir Agora
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Próximas Tarefas */}
              <div>
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Próximas Tarefas ({acoesProximas.length})
                </h3>
                {acoesProximas.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Todas as tarefas estão em dia!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acoesProximas.slice(0, 5).map((acao) => (
                      <div key={acao.id} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-blue-900">{acao.description}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {acao.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-blue-700 mb-3">
                          {acao.next_steps}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <Clock className="h-3 w-3" />
                            {acao.next_step_date ? 
                              new Date(acao.next_step_date).toLocaleDateString('pt-BR') : 
                              'Sem data definida'
                            }
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoConcluida(acao.id)}
                            className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            Concluir
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {acoesProximas.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        E mais {acoesProximas.length - 5} tarefas próximas...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
