// app/api/rules/route.ts - XP Rules API

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

    const rules = await prisma.xPRule.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
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
      eventType,
      xpAmount,
      cooldown,
      maxPerDay,
      conditions
    } = body;

    if (!companyId || !name || !eventType || !xpAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (xpAmount <= 0) {
      return NextResponse.json(
        { error: 'xpAmount must be positive' },
        { status: 400 }
      );
    }

    // Validate that the company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: `Company with id '${companyId}' does not exist` },
        { status: 404 }
      );
    }

    const rule = await prisma.xPRule.create({
      data: {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId,
        name,
        eventType,
        xpAmount,
        cooldown: cooldown || 0,
        maxPerDay: maxPerDay || 0,
        conditions: conditions || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}
