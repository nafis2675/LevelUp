// app/api/xp/grant/route.ts - Manual XP Grant API

import { NextResponse } from 'next/server';
import { grantXP } from '@/lib/xp-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, amount, reason } = body;

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

    const result = await grantXP({
      memberId,
      amount,
      reason,
      eventType: 'manual.grant',
      metadata: { grantedBy: 'admin' }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error granting XP:', error);
    return NextResponse.json(
      { error: 'Failed to grant XP' },
      { status: 500 }
    );
  }
}
