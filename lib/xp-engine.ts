// lib/xp-engine.ts - XP Granting Engine

import { prisma } from './prisma';
import { calculateLevel } from './xp';
import { checkBadgeAchievements } from './badge-engine';
import { sendLevelUpNotification, sendBadgeNotification } from './notifications';
import { cacheDelPattern } from './redis';
import type { Member, Badge } from '@prisma/client';

export interface GrantXPParams {
  memberId: string;
  amount: number;
  reason: string;
  eventType: string;
  metadata?: any;
}

export interface GrantXPResult {
  success: boolean;
  newLevel?: number;
  leveledUp: boolean;
  badgesEarned?: Badge[];
  member?: Member;
}

/**
 * Grant XP to a member and handle level ups and badge achievements
 */
export async function grantXP(params: GrantXPParams): Promise<GrantXPResult> {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.memberId }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const oldLevel = member.level;
    const newTotalXP = member.totalXP + params.amount;
    const levelData = calculateLevel(newTotalXP);

    // Update member in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update member stats
      const updatedMember = await tx.member.update({
        where: { id: params.memberId },
        data: {
          totalXP: newTotalXP,
          level: levelData.level,
          currentLevelXP: levelData.currentLevelXP,
          lastActivityAt: new Date()
        }
      });

      // Create transaction record
      await tx.xPTransaction.create({
        data: {
          memberId: params.memberId,
          amount: params.amount,
          reason: params.reason,
          eventType: params.eventType,
          metadata: params.metadata || {}
        }
      });

      return updatedMember;
    });

    const leveledUp = levelData.level > oldLevel;

    // Check for new badges
    const newBadges = await checkBadgeAchievements(member.id, updated);

    // Invalidate leaderboard caches
    await cacheDelPattern(`leaderboard:${member.companyId}:*`);

    // Send notifications if leveled up or earned badges
    if (leveledUp) {
      await sendLevelUpNotification(updated, levelData.level);
    }

    if (newBadges.length > 0) {
      await sendBadgeNotification(updated, newBadges);
    }

    return {
      success: true,
      newLevel: levelData.level,
      leveledUp,
      badgesEarned: newBadges,
      member: updated
    };
  } catch (error) {
    console.error('Error granting XP:', error);
    return {
      success: false,
      leveledUp: false
    };
  }
}

/**
 * Get last XP grant for a specific event type
 */
export async function getLastXPGrant(memberId: string, eventType: string) {
  return await prisma.xPTransaction.findFirst({
    where: {
      memberId,
      eventType
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Get XP grants count for today
 */
export async function getXPGrantsToday(memberId: string, eventType: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.xPTransaction.count({
    where: {
      memberId,
      eventType,
      createdAt: {
        gte: startOfDay
      }
    }
  });

  return count;
}

/**
 * Get or create a member
 */
export async function getOrCreateMember(
  whopUserId: string,
  companyId: string,
  data?: {
    displayName: string;
    avatarUrl?: string;
    whopMembershipId: string;
  }
): Promise<Member> {
  let member = await prisma.member.findUnique({
    where: {
      whopUserId_companyId: {
        whopUserId,
        companyId
      }
    }
  });

  if (!member && data) {
    member = await prisma.member.create({
      data: {
        whopUserId,
        companyId,
        whopMembershipId: data.whopMembershipId,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl
      }
    });
  }

  if (!member) {
    throw new Error('Member not found and no data provided to create');
  }

  return member;
}

/**
 * Bulk grant XP to multiple members
 */
export async function bulkGrantXP(
  params: GrantXPParams[]
): Promise<GrantXPResult[]> {
  const results: GrantXPResult[] = [];

  for (const param of params) {
    const result = await grantXP(param);
    results.push(result);
  }

  return results;
}
