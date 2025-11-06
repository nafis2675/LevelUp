// lib/leaderboard.ts - Leaderboard Generation with Caching

import { prisma } from './prisma';
import { cacheGet, cacheSet } from './redis';

export interface LeaderboardParams {
  companyId: string;
  type: 'total_xp' | 'weekly_xp' | 'level' | 'badges_earned';
  timeframe?: 'all_time' | 'weekly' | 'monthly';
  limit?: number;
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl?: string;
  totalXP: number;
  level: number;
  weeklyXP?: number;
  badgeCount?: number;
  rank?: number;
}

/**
 * Generate leaderboard with caching
 */
export async function generateLeaderboard(
  params: LeaderboardParams
): Promise<LeaderboardEntry[]> {
  const { companyId, type, timeframe = 'all_time', limit = 50 } = params;

  // Try cache first
  const cacheKey = `leaderboard:${companyId}:${type}:${timeframe}`;
  const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
  if (cached) return cached;

  let results: LeaderboardEntry[] = [];

  switch (type) {
    case 'total_xp':
      results = await getTopByTotalXP(companyId, limit);
      break;

    case 'level':
      results = await getTopByLevel(companyId, limit);
      break;

    case 'weekly_xp':
      results = await getTopByWeeklyXP(companyId, limit);
      break;

    case 'badges_earned':
      results = await getTopByBadges(companyId, limit);
      break;
  }

  // Add rank to each entry
  results = results.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  // Cache for 5 minutes
  await cacheSet(cacheKey, results, 300);

  return results;
}

/**
 * Get top members by total XP
 */
async function getTopByTotalXP(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const members = await prisma.member.findMany({
    where: { companyId },
    orderBy: { totalXP: 'desc' },
    take: limit,
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      totalXP: true,
      level: true
    }
  });

  return members;
}

/**
 * Get top members by level
 */
async function getTopByLevel(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const members = await prisma.member.findMany({
    where: { companyId },
    orderBy: [{ level: 'desc' }, { totalXP: 'desc' }],
    take: limit,
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      totalXP: true,
      level: true
    }
  });

  return members;
}

/**
 * Get top members by weekly XP
 */
async function getTopByWeeklyXP(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const members = await prisma.member.findMany({
    where: { companyId },
    include: {
      xpTransactions: {
        where: { createdAt: { gte: weekAgo } },
        select: { amount: true }
      }
    }
  });

  const sorted = members
    .map(m => ({
      id: m.id,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl || undefined,
      totalXP: m.totalXP,
      level: m.level,
      weeklyXP: m.xpTransactions.reduce((sum, t) => sum + t.amount, 0)
    }))
    .sort((a, b) => b.weeklyXP - a.weeklyXP)
    .slice(0, limit);

  return sorted;
}

/**
 * Get top members by badges earned
 */
async function getTopByBadges(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const members = await prisma.member.findMany({
    where: { companyId },
    include: {
      memberBadges: {
        select: { id: true }
      }
    },
    orderBy: {
      memberBadges: {
        _count: 'desc'
      }
    },
    take: limit
  });

  return members.map(m => ({
    id: m.id,
    displayName: m.displayName,
    avatarUrl: m.avatarUrl || undefined,
    totalXP: m.totalXP,
    level: m.level,
    badgeCount: m.memberBadges.length
  }));
}

/**
 * Get member's rank in a specific leaderboard
 */
export async function getMemberRank(
  memberId: string,
  type: 'total_xp' | 'weekly_xp' | 'level' | 'badges_earned'
): Promise<number> {
  const member = await prisma.member.findUnique({
    where: { id: memberId }
  });

  if (!member) return -1;

  let rank = 0;

  switch (type) {
    case 'total_xp':
      rank = await prisma.member.count({
        where: {
          companyId: member.companyId,
          totalXP: { gt: member.totalXP }
        }
      });
      break;

    case 'level':
      rank = await prisma.member.count({
        where: {
          companyId: member.companyId,
          OR: [
            { level: { gt: member.level } },
            { level: member.level, totalXP: { gt: member.totalXP } }
          ]
        }
      });
      break;

    case 'badges_earned':
      const badgeCount = await prisma.memberBadge.count({
        where: { memberId }
      });

      const allMembers = await prisma.member.findMany({
        where: { companyId: member.companyId },
        include: {
          _count: {
            select: { memberBadges: true }
          }
        }
      });

      rank = allMembers.filter(m => m._count.memberBadges > badgeCount).length;
      break;

    case 'weekly_xp':
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const memberWeeklyXP = await prisma.xPTransaction.aggregate({
        where: {
          memberId,
          createdAt: { gte: weekAgo }
        },
        _sum: { amount: true }
      });

      const allMembersWeekly = await prisma.member.findMany({
        where: { companyId: member.companyId },
        include: {
          xpTransactions: {
            where: { createdAt: { gte: weekAgo } },
            select: { amount: true }
          }
        }
      });

      const myWeeklyXP = memberWeeklyXP._sum.amount || 0;
      rank = allMembersWeekly.filter(m => {
        const weeklyXP = m.xpTransactions.reduce((sum, t) => sum + t.amount, 0);
        return weeklyXP > myWeeklyXP;
      }).length;
      break;
  }

  return rank + 1; // Convert 0-based to 1-based rank
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats(companyId: string) {
  const totalMembers = await prisma.member.count({
    where: { companyId }
  });

  const avgLevel = await prisma.member.aggregate({
    where: { companyId },
    _avg: { level: true }
  });

  const topMember = await prisma.member.findFirst({
    where: { companyId },
    orderBy: { totalXP: 'desc' }
  });

  return {
    totalMembers,
    avgLevel: avgLevel._avg.level || 1,
    topMember
  };
}
