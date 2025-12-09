/**
 * Logger estruturado para o frontend.
 * Centraliza logs com níveis, contexto e formatação consistente.
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Configuração baseada no ambiente
const isDev = import.meta.env.DEV;
const currentLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

const formatMessage = (level, message, context, metadata) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
  return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
};

const shouldLog = (level) => level >= currentLevel;

export const logger = {
  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (message, context = '', metadata = null) => {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug(formatMessage('DEBUG', message, context, metadata));
    }
  },

  /**
   * Log informativo
   */
  info: (message, context = '', metadata = null) => {
    if (shouldLog(LogLevel.INFO)) {
      console.info(formatMessage('INFO', message, context, metadata));
    }
  },

  /**
   * Log de aviso
   */
  warn: (message, context = '', metadata = null) => {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage('WARN', message, context, metadata));
    }
  },

  /**
   * Log de erro
   */
  error: (message, error = null, context = '') => {
    if (shouldLog(LogLevel.ERROR)) {
      const errorInfo = error ? {
        name: error.name,
        message: error.message,
        stack: isDev ? error.stack : undefined,
      } : null;
      console.error(formatMessage('ERROR', message, context, errorInfo));
    }
  },

  /**
   * Log de requisição API
   */
  api: (method, url, status, duration) => {
    if (shouldLog(LogLevel.DEBUG)) {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.debug(`${statusEmoji} ${method} ${url} - ${status} (${duration}ms)`);
    }
  },

  /**
   * Log de cache
   */
  cache: (action, key, hit = null) => {
    if (shouldLog(LogLevel.DEBUG)) {
      const hitStr = hit !== null ? (hit ? 'HIT' : 'MISS') : '';
      console.debug(`📦 CACHE ${action} ${key} ${hitStr}`);
    }
  },
};

export default logger;
