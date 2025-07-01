
/**
 * Sistema de logging estruturado aprimorado para debug e monitoramento
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  module: string;
  timestamp: string;
  data?: any;
  error?: Error;
  sessionId?: string;
  userId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId: string;
  private maxLogEntries = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Inicializar sistema de logs se necessário
    this.initializeLogging();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogging() {
    // Capturar erros globais
    window.addEventListener('error', (event) => {
      this.error('GLOBAL', 'Erro JavaScript não capturado', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('GLOBAL', 'Promise rejeitada não tratada', event.reason);
    });

    // Log de performance
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 1000) { // Log apenas operações lentas
              this.warn('PERFORMANCE', `Operação lenta detectada: ${entry.name}`, {
                duration: Math.round(entry.duration),
                type: entry.entryType
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (e) {
        // Ignorar se não suportado
      }
    }
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, module, message, sessionId } = entry;
    return `[${timestamp}] ${level.toUpperCase()} [${module}] [${sessionId}] ${message}`;
  }

  private createLogEntry(
    level: LogLevel,
    module: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      module,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data,
      error
    };
  }

  private persistLog(entry: LogEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      existingLogs.push(entry);
      
      // Manter apenas os logs mais recentes
      const recentLogs = existingLogs.slice(-this.maxLogEntries);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (e) {
      // Ignorar se não conseguir salvar
    }
  }

  debug(module: string, message: string, data?: any) {
    if (!this.isDevelopment) return;
    
    const entry = this.createLogEntry('debug', module, message, data);
    console.debug(this.formatLog(entry), data);
    this.persistLog(entry);
  }

  info(module: string, message: string, data?: any) {
    const entry = this.createLogEntry('info', module, message, data);
    console.info(this.formatLog(entry), data);
    this.persistLog(entry);
  }

  warn(module: string, message: string, data?: any) {
    const entry = this.createLogEntry('warn', module, message, data);
    console.warn(this.formatLog(entry), data);
    this.persistLog(entry);
  }

  error(module: string, message: string, error?: Error, data?: any) {
    const entry = this.createLogEntry('error', module, message, data, error);
    console.error(this.formatLog(entry), error, data);
    this.persistLog(entry);
  }

  // Métodos específicos para diferentes módulos
  authLog(action: string, userId?: string, data?: any) {
    this.info('AUTH', `${action}${userId ? ` - User: ${userId}` : ''}`, data);
  }

  routeLog(route: string, data?: any) {
    this.debug('ROUTER', `Navegando para: ${route}`, data);
  }

  apiLog(method: string, url: string, status?: number, data?: any) {
    const level = status && status >= 400 ? 'error' : 'info';
    this[level]('API', `${method} ${url} - Status: ${status}`, data);
  }

  performanceLog(metric: string, value: number, data?: any) {
    this.info('PERFORMANCE', `${metric}: ${value}ms`, data);
  }

  // Métodos específicos para eventos
  eventLog(action: string, eventId?: string, data?: any) {
    this.info('EVENTOS', `${action}${eventId ? ` - Event: ${eventId}` : ''}`, data);
  }

  contactLog(action: string, contactId?: string, data?: any) {
    this.info('CONTATOS', `${action}${contactId ? ` - Contact: ${contactId}` : ''}`, data);
  }

  // Métodos utilitários
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem('app_logs');
    this.info('LOGGER', 'Logs limpos');
  }

  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  // Análise de logs para debugging
  getErrorSummary(): { [key: string]: number } {
    const logs = this.getLogs();
    const errors = logs.filter(log => log.level === 'error');
    
    const summary: { [key: string]: number } = {};
    errors.forEach(error => {
      const key = `${error.module}: ${error.message}`;
      summary[key] = (summary[key] || 0) + 1;
    });
    
    return summary;
  }
}

export const logger = new Logger();

// Hook para usar logger em componentes React
export const useLogger = (module: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(module, message, data),
    info: (message: string, data?: any) => logger.info(module, message, data),
    warn: (message: string, data?: any) => logger.warn(module, message, data),
    error: (message: string, error?: Error, data?: any) => logger.error(module, message, error, data),
  };
};
