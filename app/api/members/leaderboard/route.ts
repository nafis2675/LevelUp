// app/api/members/leaderboard/route.ts - Leaderboard API

import { NextResponse } from 'next/server';
import { generateLeaderboard, getMemberRank } from '@/lib/leaderboard';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type') as 'total_xp' | 'weekly_xp' | 'level' | 'badges_earned';
    const timeframe = searchParams.get('timeframe') as 'all_time' | 'weekly' | 'monthly';
    const limit = parseInt(searchParams.get('limit') || '50');
    const memberId = searchParams.get('memberId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const leaderboard = await generateLeaderboard({
      companyId,
      type: type || 'total_xp',
      timeframe: timeframe || 'all_time',
      limit
    });

    let memberRank;
    if (memberId) {
      memberRank = await getMemberRank(memberId, type || 'total_xp');
    }

    return NextResponse.json({
      leaderboard,
      memberRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
