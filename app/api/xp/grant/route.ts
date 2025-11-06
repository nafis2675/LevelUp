// app/api/xp/grant/route.ts - Manual XP Grant API

import { NextResponse } from 'next/server';
import { grantXP } from '@/lib/xp-engine';
import { apiRateLimiter, xpGrantRateLimiter } from '@/lib/rate-limit';
import { xpLogger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, amount, reason } = body;

    // Rate limit by user/member
    const identifier = memberId || req.headers.get('x-user-id') || 'anonymous';

    // Check API rate limit
    if (apiRateLimiter) {
      const apiLimit = await apiRateLimiter.limit(identifier);
      if (!apiLimit.success) {
        xpLogger.warn({ identifier }, 'API rate limit exceeded');
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            limit: apiLimit.limit,
            remaining: 0,
            reset: apiLimit.reset
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': apiLimit.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': apiLimit.reset.toString()
            }
          }
        );
      }
    }

    // Check XP grant specific rate limit
    if (xpGrantRateLimiter && memberId) {
      const xpLimit = await xpGrantRateLimiter.limit(memberId);
      if (!xpLimit.success) {
        xpLogger.warn({ memberId }, 'XP grant rate limit exceeded');
        return NextResponse.json(
          {
            error: 'Too many XP grants. Please slow down.',
            limit: xpLimit.limit,
            remaining: 0,
            reset: xpLimit.reset
          },
          { status: 429 }
        );
      }
    }

    // Validate required fields
    if (!memberId || !amount || !reason) {
      return NextResponse.json(
        { error: 'memberId, amount, and reason are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be positive' },
        { status: 400 }
      );
    }

    // Process XP grant
    const result = await grantXP({
      memberId,
      amount,
      reason,
      eventType: 'manual.grant',
      metadata: { grantedBy: 'admin' }
    });

    // Add rate limit headers to response
    const headers: Record<string, string> = {};
    if (apiRateLimiter) {
      const apiLimit = await apiRateLimiter.limit(identifier);
      headers['X-RateLimit-Limit'] = apiLimit.limit.toString();
      headers['X-RateLimit-Remaining'] = apiLimit.remaining.toString();
      headers['X-RateLimit-Reset'] = apiLimit.reset.toString();
    }

    return NextResponse.json(result, { headers });
  } catch (error) {
    xpLogger.error({
      error: error instanceof Error ? error.message : String(error)
    }, 'Error in XP grant endpoint');

    return NextResponse.json(
      { error: 'Failed to grant XP' },
      { status: 500 }
    );
  }
}

