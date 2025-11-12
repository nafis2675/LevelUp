// app/api/health/route.ts - Health Check Endpoint

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        hasWhopApiKey: !!process.env.WHOP_API_KEY,
        hasWhopAppId: !!process.env.NEXT_PUBLIC_WHOP_APP_ID,
        hasWhopCompanyId: !!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      },
      headers: {
        'x-forwarded-proto': undefined as string | undefined,
        'x-frame-options': 'allowed'
      }
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
