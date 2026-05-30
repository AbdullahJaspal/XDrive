import pino, { type Logger, type LoggerOptions } from 'pino';

export type LogContext = Record<string, unknown>;

export interface CreateLoggerOptions {
  name: string;
  level?: string;
  pretty?: boolean;
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const isDev = process.env.NODE_ENV !== 'production';
  const pretty = options.pretty ?? isDev;

  const pinoOptions: LoggerOptions = {
    name: options.name,
    level: options.level ?? process.env.LOG_LEVEL ?? 'info',
    redact: {
      paths: [
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'authorization',
        'req.headers.authorization',
        'req.headers.cookie',
      ],
      censor: '[REDACTED]',
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (pretty && process.env.LOG_FORMAT !== 'json') {
    return pino({
      ...pinoOptions,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    });
  }

  return pino(pinoOptions);
}

export type { Logger };
