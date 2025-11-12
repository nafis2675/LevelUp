// app/api/members/[id]/route.ts - Member Profile API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/xp';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        MemberBadge: {
          include: {
            Badge: true
          },
          orderBy: {
            earnedAt: 'desc'
          }
        },
        XPTransaction: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        RewardClaim: {
          include: {
            Reward: true
          },
          orderBy: {
            claimedAt: 'desc'
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate level info
    const levelInfo = calculateLevel(member.totalXP);

    return NextResponse.json({
      ...member,
      levelInfo
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { displayName, avatarUrl } = body;

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl })
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
