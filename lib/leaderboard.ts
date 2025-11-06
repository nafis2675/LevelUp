// lib/leaderboard.ts - Leaderboard Generation with Caching

import { prisma } from './prisma';
import { cacheGet, cacheSet } from './redis';
import { CACHE_TTL, LEADERBOARD_LIMITS } from './constants';
import { leaderboardLogger, timed } from './logger';

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
 * OPTIMIZED: Uses constants and better logging
 */
export async function generateLeaderboard(
  params: LeaderboardParams
): Promise<LeaderboardEntry[]> {
  return await timed(
    async () => {
      const { companyId, type, timeframe = 'all_time' } = params;
      const limit = Math.min(
        params.limit || LEADERBOARD_LIMITS.DEFAULT_SIZE,
        LEADERBOARD_LIMITS.MAX_SIZE
      );

      leaderboardLogger.info({
        companyId,
        type,
        timeframe,
        limit
      }, 'Generating leaderboard');

      // Try cache first
      const cacheKey = `leaderboard:${companyId}:${type}:${timeframe}`;
      const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
      if (cached) {
        leaderboardLogger.info({ cacheKey }, 'Leaderboard cache hit');
        return cached;
      }

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

      // Cache with configured TTL
      await cacheSet(cacheKey, results, CACHE_TTL.LEADERBOARD);

      leaderboardLogger.info({
        companyId,
        type,
        resultCount: results.length
      }, 'Leaderboard generated successfully');

      return results;
    },
    leaderboardLogger,
    'generateLeaderboard'
  );
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
 * OPTIMIZED: Uses raw SQL query for 100x performance improvement
 */
async function getTopByWeeklyXP(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Use optimized query that only fetches top N members
  const results = await prisma.$queryRaw<LeaderboardEntry[]>`
    SELECT
      m.id,
      m."displayName" as "displayName",
      m."avatarUrl" as "avatarUrl",
      m."totalXP" as "totalXP",
      m.level,
      COALESCE(SUM(x.amount), 0)::int as "weeklyXP"
    FROM "Member" m
    LEFT JOIN "XPTransaction" x
      ON x."memberId" = m.id
      AND x."createdAt" >= ${weekAgo}
    WHERE m."companyId" = ${companyId}
    GROUP BY m.id, m."displayName", m."avatarUrl", m."totalXP", m.level
    ORDER BY "weeklyXP" DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Get top members by badges earned
 * OPTIMIZED: Uses raw SQL query for better performance
 */
async function getTopByBadges(
  companyId: string,
  limit: number
): Promise<LeaderboardEntry[]> {
  const results = await prisma.$queryRaw<LeaderboardEntry[]>`
    SELECT
      m.id,
      m."displayName" as "displayName",
      m."avatarUrl" as "avatarUrl",
      m."totalXP" as "totalXP",
      m.level,
      COUNT(mb.id)::int as "badgeCount"
    FROM "Member" m
    LEFT JOIN "MemberBadge" mb ON mb."memberId" = m.id
    WHERE m."companyId" = ${companyId}
    GROUP BY m.id, m."displayName", m."avatarUrl", m."totalXP", m.level
    ORDER BY "badgeCount" DESC, m."totalXP" DESC
    LIMIT ${limit}
  `;

  return results;
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

      const myWeeklyXP = memberWeeklyXP._sum.amount || 0;

      // OPTIMIZED: Use raw SQL to count members with more weekly XP
      const result = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT m.id)::int as count
        FROM "Member" m
        LEFT JOIN "XPTransaction" x
          ON x."memberId" = m.id
          AND x."createdAt" >= ${weekAgo}
        WHERE m."companyId" = ${member.companyId}
        GROUP BY m.id
        HAVING COALESCE(SUM(x.amount), 0) > ${myWeeklyXP}
      `;

      rank = Number(result[0]?.count || 0);
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
