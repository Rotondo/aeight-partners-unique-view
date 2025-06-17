
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Link, ExternalLink } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { toast } from '@/hooks/use-toast';

export const AgendaSyncGoogle: React.FC = () => {
  const { syncGoogleCalendar } = useAgenda();
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const validateGoogleCalendarUrl = (url: string) => {
    const googleCalendarPatterns = [
      /calendar\.google\.com\/calendar\/embed\?src=/,
      /calendar\.google\.com\/calendar\/ical\//,
      /calendar\.google\.com\/calendar\/u\/0\/embed\?src=/
    ];
    return googleCalendarPatterns.some(pattern => pattern.test(url));
  };

  const convertToIcsUrl = (url: string) => {
    if (url.includes('/embed?')) {
      const srcMatch = url.match(/src=([^&]+)/);
      if (srcMatch) {
        const calendarId = decodeURIComponent(srcMatch[1]);
        return `https://calendar.google.com/calendar/ical/${calendarId}/public/basic.ics`;
      }
    }
    if (url.includes('/ical/')) {
      return url.replace('/ical/', '/ical/').replace('/public/basic.ics', '/public/basic.ics');
    }
    return url;
  };

  const handleConnect = async () => {
    if (!calendarUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira um link do calendário",
        variant: "destructive"
      });
      return;
    }

    if (!validateGoogleCalendarUrl(calendarUrl)) {
      toast({
        title: "URL Inválida",
        description: "Por favor, insira um link válido do Google Calendar (público)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      const icsUrl = convertToIcsUrl(calendarUrl);
      
      // Simular verificação da URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      setLastSync(new Date());
      setShowPreview(true);
      
      toast({
        title: "Sucesso",
        description: "Calendário Google conectado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao conectar com Google Calendar:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o calendário",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncGoogleCalendar();
      setLastSync(new Date());
      toast({
        title: "Sucesso",
        description: "Calendário sincronizado com sucesso!"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCalendarUrl('');
    setShowPreview(false);
    setLastSync(null);
    toast({
      title: "Desconectado",
      description: "Calendário Google desconectado"
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Google Calendar</CardTitle>
            <CardDescription>Conecte usando um link público do seu calendário</CardDescription>
          </div>
          
          {isConnected ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline">
              <AlertCircle className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {!isConnected ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Link Público do Calendário
                </label>
                <Input
                  placeholder="https://calendar.google.com/calendar/embed?src=..."
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link público/compartilhável do seu Google Calendar
                </p>
              </div>
              
              <Button 
                onClick={handleConnect} 
                disabled={isSyncing || !calendarUrl}
                className="w-full"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link className="h-4 w-4 mr-2" />
                )}
                Conectar Calendário
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Como obter o link:</strong></p>
                <p>1. Abra seu Google Calendar</p>
                <p>2. Clique em "Configurações" no calendário desejado</p>
                <p>3. Role até "Integrar calendário"</p>
                <p>4. Copie o "Endereço público em formato iCal"</p>
              </div>
            </>
          ) : (
            <>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="w-full"
                variant="outline"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sincronizar Agora
              </Button>
              
              {showPreview && (
                <div className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preview do Calendário</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(calendarUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <iframe
                    src={calendarUrl}
                    style={{ border: 0 }}
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleDisconnect}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Desconectar
              </Button>
              
              {lastSync && (
                <p className="text-xs text-muted-foreground text-center">
                  Última sincronização: {lastSync.toLocaleString('pt-BR')}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
