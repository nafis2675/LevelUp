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

/**
 * Create a new XP rule for a company.
 *
 * Validates required fields, ensures `xpAmount` is greater than zero, and verifies the specified company exists before creating and returning the new XP rule.
 *
 * @returns The created XP rule object on success. On failure returns a JSON error object with an appropriate HTTP status (400 for validation errors, 404 if company not found, 500 on server error).
 */
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
        companyId,
        name,
        eventType,
        xpAmount,
        cooldown: cooldown || 0,
        maxPerDay: maxPerDay || 0,
        conditions: conditions || null
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