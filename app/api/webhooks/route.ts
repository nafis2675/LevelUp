// app/api/webhooks/route.ts - Webhook Handler

import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/whop';
import { handleEvent } from '@/lib/event-handler';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get request body as text for signature verification
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('x-whop-signature');

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(body);
    console.log('Received webhook:', event.action);

    // Process event asynchronously (don't block webhook response)
    // Whop expects a quick response, so we process in background
    handleEvent(event).catch((error) => {
      console.error('Error processing webhook:', error);
    });

    // Return success immediately
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
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
    timestamp: new Date().toISOString()
  });
}
