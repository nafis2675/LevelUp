// app/api/rewards/route.ts - Rewards API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const rewards = await prisma.reward.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      name,
      description,
      type,
      config,
      requiredLevel,
      requiredXP,
      requiredBadges,
      isRepeatable,
      cooldownDays
    } = body;

    if (!companyId || !name || !description || !type || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        companyId,
        name,
        description,
        type,
        config,
        requiredLevel: requiredLevel || null,
        requiredXP: requiredXP || null,
        requiredBadges: requiredBadges || null,
        isRepeatable: isRepeatable || false,
        cooldownDays: cooldownDays || 0
      }
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}
