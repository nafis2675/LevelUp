// lib/logger.ts - Structured Logging with Pino

import pino from 'pino';

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    service: 'levelup'
  }
});

// Specific loggers for different components
export const xpLogger = logger.child({ component: 'xp-engine' });
export const badgeLogger = logger.child({ component: 'badge-engine' });
export const webhookLogger = logger.child({ component: 'webhook' });
export const leaderboardLogger = logger.child({ component: 'leaderboard' });

// Helper for timing operations
export async function timed<T>(
  operation: () => Promise<T>,
  logger: pino.Logger,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    logger.info({
      operation: operationName,
      duration,
      success: true
    }, `${operationName} completed in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error({
      operation: operationName,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, `${operationName} failed after ${duration}ms`);

    throw error;
  }
}
