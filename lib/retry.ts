// lib/retry.ts - Retry Logic with Exponential Backoff

import { RETRY_CONFIG } from './constants';
import { logger } from './logger';

/**
 * Retry an operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxAttempts: number = RETRY_CONFIG.MAX_ATTEMPTS
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        logger.error({
          operation: operationName,
          attempts: maxAttempts,
          error: lastError.message
        }, `${operationName} failed after ${maxAttempts} attempts`);
        throw lastError;
      }

      const delay = Math.min(
        RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1),
        RETRY_CONFIG.MAX_DELAY
      );

      logger.warn({
        operation: operationName,
        attempt,
        maxAttempts,
        delay,
        error: lastError.message
      }, `${operationName} failed, retrying in ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
