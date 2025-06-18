
/**
 * Sistema de logging estruturado para debug e monitoramento
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  module: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, module, message } = entry;
    return `[${timestamp}] ${level.toUpperCase()} [${module}] ${message}`;
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
      data,
      error
    };
  }

  debug(module: string, message: string, data?: any) {
    if (!this.isDevelopment) return;
    
    const entry = this.createLogEntry('debug', module, message, data);
    console.debug(this.formatLog(entry), data);
  }

  info(module: string, message: string, data?: any) {
    const entry = this.createLogEntry('info', module, message, data);
    console.info(this.formatLog(entry), data);
  }

  warn(module: string, message: string, data?: any) {
    const entry = this.createLogEntry('warn', module, message, data);
    console.warn(this.formatLog(entry), data);
  }

  error(module: string, message: string, error?: Error, data?: any) {
    const entry = this.createLogEntry('error', module, message, data, error);
    console.error(this.formatLog(entry), error, data);
  }

  // Log específico para eventos
  eventLog(action: string, eventId?: string, data?: any) {
    this.info('EVENTOS', `${action}${eventId ? ` - Event: ${eventId}` : ''}`, data);
  }

  // Log específico para contatos
  contactLog(action: string, contactId?: string, data?: any) {
    this.info('CONTATOS', `${action}${contactId ? ` - Contact: ${contactId}` : ''}`, data);
  }

  // Log específico para auth
  authLog(action: string, userId?: string, data?: any) {
    this.info('AUTH', `${action}${userId ? ` - User: ${userId}` : ''}`, data);
  }
}

export const logger = new Logger();
