// app/api/rewards/claim/route.ts - Reward Claiming API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assignRole, createDiscountCode, extendMembership } from '@/lib/whop';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, rewardId } = body;

    if (!memberId || !rewardId) {
      return NextResponse.json(
        { error: 'memberId and rewardId are required' },
        { status: 400 }
      );
    }

    // Get member and reward
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!member || !reward) {
      return NextResponse.json(
        { error: 'Member or reward not found' },
        { status: 404 }
      );
    }

    // Check if member meets requirements
    if (reward.requiredLevel && member.level < reward.requiredLevel) {
      return NextResponse.json(
        { error: 'Level requirement not met' },
        { status: 400 }
      );
    }

    if (reward.requiredXP && member.totalXP < reward.requiredXP) {
      return NextResponse.json(
        { error: 'XP requirement not met' },
        { status: 400 }
      );
    }

    if (reward.requiredBadges) {
      const requiredBadgeIds = reward.requiredBadges as string[];
      const memberBadges = await prisma.memberBadge.findMany({
        where: {
          memberId,
          badgeId: { in: requiredBadgeIds }
        }
      });

      if (memberBadges.length < requiredBadgeIds.length) {
        return NextResponse.json(
          { error: 'Badge requirements not met' },
          { status: 400 }
        );
      }
    }

    // Check if already claimed (for non-repeatable rewards)
    if (!reward.isRepeatable) {
      const existingClaim = await prisma.rewardClaim.findFirst({
        where: {
          memberId,
          rewardId,
          status: 'completed'
        }
      });

      if (existingClaim) {
        return NextResponse.json(
          { error: 'Reward already claimed' },
          { status: 400 }
        );
      }
    }

    // Check cooldown
    if (reward.cooldownDays > 0) {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() - reward.cooldownDays);

      const recentClaim = await prisma.rewardClaim.findFirst({
        where: {
          memberId,
          rewardId,
          claimedAt: { gte: cooldownDate }
        }
      });

      if (recentClaim) {
        return NextResponse.json(
          { error: 'Reward is on cooldown' },
          { status: 400 }
        );
      }
    }

    // Create claim record
    const claim = await prisma.rewardClaim.create({
      data: {
        memberId,
        rewardId,
        status: 'pending'
      }
    });

    // Process reward based on type
    let success = false;
    const config = reward.config as any;

    try {
      switch (reward.type) {
        case 'role':
          await assignRole({
            membershipId: member.whopMembershipId,
            roleId: config.roleId
          });
          success = true;
          break;

        case 'free_days':
          await extendMembership({
            membershipId: member.whopMembershipId,
            days: config.days
          });
          success = true;
          break;

        case 'discount_code':
          await createDiscountCode({
            companyId: member.companyId,
            code: config.code,
            discountPercent: config.discountPercent,
            usageLimit: 1
          });
          success = true;
          break;

        case 'custom':
          // Custom reward handling
          success = true;
          break;

        default:
          throw new Error(`Unknown reward type: ${reward.type}`);
      }

      // Update claim status
      await prisma.rewardClaim.update({
        where: { id: claim.id },
        data: { status: success ? 'completed' : 'failed' }
      });

      return NextResponse.json({
        success,
        claim
      });
    } catch (error) {
      console.error('Error processing reward:', error);

      await prisma.rewardClaim.update({
        where: { id: claim.id },
        data: { status: 'failed' }
      });

      return NextResponse.json(
        { error: 'Failed to process reward' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
}
