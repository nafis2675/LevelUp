// lib/xp-engine.ts - XP Granting Engine

import { prisma } from './prisma';
import { calculateLevel } from './xp';
import { checkBadgeAchievements } from './badge-engine';
import { sendLevelUpNotification, sendBadgeNotification } from './notifications';
import { cacheDelPattern } from './redis';
import { GrantXPSchema } from './validation';
import { xpLogger, timed } from './logger';
import { z } from 'zod';

// Infer types from Prisma query results
type Member = NonNullable<Awaited<ReturnType<typeof prisma.member.findUnique>>>;
type Badge = NonNullable<Awaited<ReturnType<typeof prisma.badge.findUnique>>>;

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
  error?: string; // Add error field for better error reporting
}

/**
 * Grant XP to a member and handle level ups and badge achievements
 * FIXED: Uses atomic increment to prevent race conditions
 */
export async function grantXP(params: GrantXPParams): Promise<GrantXPResult> {
  return await timed(
    async () => {
      try {
        // Validate inputs with Zod
        const validated = GrantXPSchema.parse(params);

        xpLogger.info({
          memberId: validated.memberId,
          amount: validated.amount,
          eventType: validated.eventType
        }, 'Starting XP grant');

        const member = await prisma.member.findUnique({
          where: { id: validated.memberId }
        });

        if (!member) {
          throw new Error('Member not found');
        }

        const oldLevel = member.level;

        // Update member in a transaction with atomic operations
        const updated = await prisma.$transaction(async (tx: any) => {
          // Step 1: Atomic increment of XP (FIXES RACE CONDITION)
          const updatedMember = await tx.member.update({
            where: { id: validated.memberId },
            data: {
              totalXP: { increment: validated.amount }, // ← ATOMIC INCREMENT
              lastActivityAt: new Date()
            }
          });

          // Step 2: Calculate level from updated total
          const levelData = calculateLevel(updatedMember.totalXP);

          // Step 3: Update level if changed
          const finalMember = await tx.member.update({
            where: { id: validated.memberId },
            data: {
              level: levelData.level,
              currentLevelXP: levelData.currentLevelXP
            }
          });

          // Step 4: Create transaction record
          await tx.xPTransaction.create({
            data: {
              memberId: validated.memberId,
              amount: validated.amount,
              reason: validated.reason,
              eventType: validated.eventType,
              metadata: validated.metadata || {}
            }
          });

          return finalMember;
        });

        const leveledUp = updated.level > oldLevel;

        // Check for new badges (outside transaction for performance)
        const newBadges = await checkBadgeAchievements(member.id, updated);

        // Invalidate leaderboard caches
        await cacheDelPattern(`leaderboard:${member.companyId}:*`);

        // Send notifications if leveled up or earned badges
        if (leveledUp) {
          await sendLevelUpNotification(updated, updated.level);
        }

        if (newBadges.length > 0) {
          await sendBadgeNotification(updated, newBadges);
        }

        xpLogger.info({
          memberId: validated.memberId,
          amount: validated.amount,
          newLevel: updated.level,
          leveledUp,
          badgesEarned: newBadges.length
        }, 'XP granted successfully');

        return {
          success: true,
          newLevel: updated.level,
          leveledUp,
          badgesEarned: newBadges,
          member: updated
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodError = error as any;
          xpLogger.error({
            error: zodError.errors
          }, 'Validation error in XP grant');
          return {
            success: false,
            leveledUp: false,
            error: `Validation failed: ${zodError.errors.map((e: any) => e.message).join(', ')}`
          };
        }

        xpLogger.error({
          memberId: params.memberId,
          amount: params.amount,
          error: error instanceof Error ? error.message : String(error)
        }, 'Failed to grant XP');

        // Send to error tracking
        if (process.env.SENTRY_DSN) {
          // Sentry.captureException(error);
        }

        return {
          success: false,
          leveledUp: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    xpLogger,
    'grantXP'
  );
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
