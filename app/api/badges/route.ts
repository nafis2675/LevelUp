// app/api/badges/route.ts - Badges API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const memberId = searchParams.get('memberId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const badges = await prisma.badge.findMany({
      where: {
        companyId,
        ...(memberId ? {} : { isSecret: false })
      },
      include: {
        ...(memberId && {
          memberBadges: {
            where: { memberId },
            select: { earnedAt: true, progress: true }
          }
        })
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
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
      imageUrl,
      rarity,
      requirement,
      isSecret
    } = body;

    if (!companyId || !name || !description || !imageUrl || !requirement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const badge = await prisma.badge.create({
      data: {
        companyId,
        name,
        description,
        imageUrl,
        rarity: rarity || 'common',
        requirement,
        isSecret: isSecret || false
      }
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
