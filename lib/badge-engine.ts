// lib/badge-engine.ts - Badge Achievement System

import { prisma } from './prisma';
import { badgeLogger, timed } from './logger';
import { Prisma } from '@prisma/client';
import type { Member, Badge } from '@prisma/client';

// Type for badge requirements
type BadgeRequirement =
  | { type: 'xp_total'; value: number }
  | { type: 'level'; value: number }
  | { type: 'streak'; days: number }
  | { type: 'badge_count'; value: number }
  | { type: 'message_count'; value: number }
  | { type: 'purchase_count'; value: number }
  | { type: 'custom'; rules: any[] };

/**
 * Check if member has earned any new badges
 * IMPROVED: Better error handling and logging
 */
export async function checkBadgeAchievements(
  memberId: string,
  member: Member
): Promise<Badge[]> {
  return await timed(
    async () => {
      try {
        badgeLogger.info({
          memberId,
          companyId: member.companyId
        }, 'Checking badge achievements');

        // Get all active badges for this company
        const badges = await prisma.badge.findMany({
          where: {
            companyId: member.companyId,
            isActive: true
          }
        });

        // Get badges member already has
        const existingBadges = await prisma.memberBadge.findMany({
          where: { memberId },
          select: { badgeId: true }
        });

        const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));
        const newlyEarned: Badge[] = [];

        for (const badge of badges) {
          if (existingBadgeIds.has(badge.id)) continue;

          try {
            const requirement = badge.requirement as BadgeRequirement;
            let earned = false;

            switch (requirement.type) {
              case 'xp_total':
                earned = member.totalXP >= requirement.value;
                break;

              case 'level':
                earned = member.level >= requirement.value;
                break;

              case 'streak':
                earned = await checkStreak(memberId, requirement.days);
                break;

              case 'badge_count':
                earned = existingBadges.length >= requirement.value;
                break;

              case 'message_count':
                earned = await checkMessageCount(memberId, requirement.value);
                break;

              case 'purchase_count':
                earned = await checkPurchaseCount(memberId, requirement.value);
                break;

              case 'custom':
                earned = await evaluateCustomRule(memberId, requirement.rules);
                break;

              default:
                badgeLogger.warn({
                  badgeId: badge.id,
                  requirementType: (requirement as any).type
                }, 'Unknown badge requirement type');
            }

            if (earned) {
              // Use upsert to avoid duplicate key errors
              await prisma.memberBadge.upsert({
                where: {
                  memberId_badgeId: {
                    memberId,
                    badgeId: badge.id
                  }
                },
                create: {
                  memberId,
                  badgeId: badge.id,
                  earnedAt: new Date()
                },
                update: {
                  earnedAt: new Date()
                }
              });

              newlyEarned.push(badge);

              badgeLogger.info({
                memberId,
                badgeId: badge.id,
                badgeName: badge.name
              }, 'Badge earned');
            }
          } catch (badgeError) {
            // Log individual badge errors but continue processing others
            badgeLogger.error({
              badgeId: badge.id,
              badgeName: badge.name,
              memberId,
              error: badgeError instanceof Error ? badgeError.message : String(badgeError)
            }, 'Error checking individual badge');

            // Send to error tracking
            if (process.env.SENTRY_DSN) {
              // Sentry.captureException(badgeError, {
              //   tags: { badgeId: badge.id, memberId }
              // });
            }

            // Continue to next badge
            continue;
          }
        }

        badgeLogger.info({
          memberId,
          newBadgesCount: newlyEarned.length
        }, 'Badge check completed');

        return newlyEarned;
      } catch (error) {
        badgeLogger.error({
          memberId,
          companyId: member.companyId,
          error: error instanceof Error ? error.message : String(error)
        }, 'Critical error in checkBadgeAchievements');

        // Send to error tracking
        if (process.env.SENTRY_DSN) {
          // Sentry.captureException(error, {
          //   tags: { memberId, companyId: member.companyId }
          // });
        }

        // For database errors, re-throw to alert caller
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new Error(`Database error checking badges: ${error.message}`);
        }

        // For other errors, return empty array but log
        return [];
      }
    },
    badgeLogger,
    'checkBadgeAchievements'
  );
}

/**
 * Check if member has maintained a streak
 */
async function checkStreak(memberId: string, requiredDays: number): Promise<boolean> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - requiredDays);

    // Check if there's activity for each day
    let consecutiveDays = 0;
    for (let i = 0; i < requiredDays; i++) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const activityCount = await prisma.xPTransaction.count({
        where: {
          memberId,
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      if (activityCount > 0) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays >= requiredDays;
  } catch (error) {
    console.error('Error checking streak:', error);
    return false;
  }
}

/**
 * Check message count
 */
async function checkMessageCount(memberId: string, requiredCount: number): Promise<boolean> {
  try {
    const count = await prisma.xPTransaction.count({
      where: {
        memberId,
        eventType: 'message.created'
      }
    });

    return count >= requiredCount;
  } catch (error) {
    console.error('Error checking message count:', error);
    return false;
  }
}

/**
 * Check purchase count
 */
async function checkPurchaseCount(memberId: string, requiredCount: number): Promise<boolean> {
  try {
    const count = await prisma.xPTransaction.count({
      where: {
        memberId,
        eventType: 'purchase.completed'
      }
    });

    return count >= requiredCount;
  } catch (error) {
    console.error('Error checking purchase count:', error);
    return false;
  }
}

/**
 * Evaluate custom badge rules
 */
async function evaluateCustomRule(memberId: string, rules: any[]): Promise<boolean> {
  try {
    // Custom rule evaluation logic
    // This can be extended based on specific requirements
    for (const rule of rules) {
      // Example rule structure: { type: 'xp_in_timeframe', value: 1000, days: 7 }
      if (rule.type === 'xp_in_timeframe') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - rule.days);

        const transactions = await prisma.xPTransaction.findMany({
          where: {
            memberId,
            createdAt: {
              gte: startDate
            }
          }
        });

        const totalXP = transactions.reduce((sum, t) => sum + t.amount, 0);
        if (totalXP < rule.value) return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error evaluating custom rule:', error);
    return false;
  }
}

/**
 * Get badge progress for a member
 */
export async function getBadgeProgress(memberId: string, badgeId: string): Promise<number> {
  try {
    const memberBadge = await prisma.memberBadge.findUnique({
      where: {
        memberId_badgeId: {
          memberId,
          badgeId
        }
      }
    });

    if (memberBadge) return 100;

    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: { company: true }
    });

    if (!badge) return 0;

    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) return 0;

    const requirement = badge.requirement as any;

    switch (requirement.type) {
      case 'xp_total':
        return Math.min(100, Math.round((member.totalXP / requirement.value) * 100));

      case 'level':
        return Math.min(100, Math.round((member.level / requirement.value) * 100));

      case 'message_count':
        const messageCount = await prisma.xPTransaction.count({
          where: { memberId, eventType: 'message.created' }
        });
        return Math.min(100, Math.round((messageCount / requirement.value) * 100));

      default:
        return 0;
    }
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return 0;
  }
}
