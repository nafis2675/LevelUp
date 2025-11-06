// lib/xp.ts - XP System Utilities

// Standard RPG curve: XP needed = baseXP * (level ^ exponent)
export const XP_BASE = 100;
export const XP_EXPONENT = 1.5;
export const MAX_LEVEL = 100;

/**
 * Calculate XP needed to reach a specific level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT));
}

/**
 * Calculate total XP needed to reach a specific level from level 1
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Calculate level and progress from total XP
 */
export function calculateLevel(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number; // 0-100
} {
  let level = 1;
  let xpRemaining = totalXP;

  while (level < MAX_LEVEL) {
    const xpNeeded = getXPForLevel(level + 1);
    if (xpRemaining < xpNeeded) break;
    xpRemaining -= xpNeeded;
    level++;
  }

  const xpForNextLevel = level < MAX_LEVEL ? getXPForLevel(level + 1) : 0;
  const progress = xpForNextLevel > 0 ? (xpRemaining / xpForNextLevel) * 100 : 100;

  return {
    level,
    currentLevelXP: xpRemaining,
    xpForNextLevel,
    progress: Math.min(100, Math.round(progress))
  };
}

/**
 * Get level info for display purposes
 */
export function getLevelInfo(level: number) {
  const xpForThisLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const totalXPToReachLevel = getTotalXPForLevel(level);

  return {
    level,
    xpForThisLevel,
    xpForNextLevel,
    totalXPToReachLevel
  };
}

/**
 * Calculate XP difference between two levels
 */
export function getXPBetweenLevels(startLevel: number, endLevel: number): number {
  return getTotalXPForLevel(endLevel) - getTotalXPForLevel(startLevel);
}
