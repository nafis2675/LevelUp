// lib/rate-limit.ts - Rate Limiting with Upstash

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis instance - fallback to local Redis if Upstash not configured
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null;

// Rate limiter for API endpoints (100 requests per minute per user)
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api'
    })
  : null;

// Rate limiter for XP grants (to prevent spam)
export const xpGrantRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // Max 60 XP grants per minute per member
      analytics: true,
      prefix: 'ratelimit:xp'
    })
  : null;

// Rate limiter for webhook processing
export const webhookRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 m'), // Max 1000 webhooks per minute
      analytics: true,
      prefix: 'ratelimit:webhook'
    })
  : null;

// Helper to check rate limit
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If no rate limiter configured, always allow
  if (!limiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now()
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset
  };
}
