// app/api/webhooks/route.ts - Webhook Handler

import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/whop';
import { handleEvent } from '@/lib/event-handler';
import { webhookRateLimiter } from '@/lib/rate-limit';
import { webhookLogger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Rate limit webhooks by IP or company
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (webhookRateLimiter) {
      const rateLimit = await webhookRateLimiter.limit(ip);

      if (!rateLimit.success) {
        webhookLogger.warn({ ip }, 'Webhook rate limit exceeded');
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    // Get request body as text for signature verification
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('x-whop-signature');

    // Verify webhook signature with timing-safe comparison
    if (!verifyWebhookSignature(body, signature)) {
      webhookLogger.error({ ip }, 'Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(body);
    webhookLogger.info({
      action: event.action,
      timestamp: new Date().toISOString()
    }, 'Received webhook');

    // Validate event structure
    if (!event.action || !event.data) {
      webhookLogger.error({ event }, 'Invalid webhook payload structure');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Process event asynchronously (don't block webhook response)
    // Whop expects a quick response (<3s), so we process in background
    handleEvent(event).catch((error) => {
      webhookLogger.error({
        action: event.action,
        error: error instanceof Error ? error.message : String(error)
      }, 'Error processing webhook');

      // Send to error tracking
      if (process.env.SENTRY_DSN) {
        // Sentry.captureException(error);
      }
    });

    // Return success immediately
    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    webhookLogger.error({
      error: error instanceof Error ? error.message : String(error)
    }, 'Webhook error');

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'LevelUp Webhooks',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

