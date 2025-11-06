// app/api/xp/history/route.ts - XP Transaction History API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    const transactions = await prisma.xPTransaction.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.xPTransaction.count({
      where: { memberId }
    });

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching XP history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP history' },
      { status: 500 }
    );
  }
}
