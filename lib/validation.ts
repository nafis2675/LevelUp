// lib/validation.ts - Input Validation Schemas

import { z } from 'zod';

// XP granting validation
export const GrantXPSchema = z.object({
  memberId: z.string().cuid(),
  amount: z.number().int().min(0).max(10000),
  reason: z.string().min(1).max(200),
  eventType: z.string().min(1).max(100),
  metadata: z.any().optional()
});

// Badge creation validation
export const CreateBadgeSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url().or(z.string().regex(/^[\p{Emoji}]$/u)), // URL or emoji
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  requirement: z.object({
    type: z.string(),
    value: z.number().optional(),
    days: z.number().optional(),
    rules: z.array(z.any()).optional()
  }),
  isActive: z.boolean().default(true),
  isSecret: z.boolean().default(false)
});

// XP Rule creation validation
export const CreateXPRuleSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(100),
  eventType: z.string().min(1),
  xpAmount: z.number().int().min(1).max(10000),
  cooldown: z.number().int().min(0).default(0),
  maxPerDay: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  conditions: z.record(z.string(), z.any()).optional()
});

// Reward creation validation
export const CreateRewardSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['role', 'free_days', 'discount_code', 'custom']),
  config: z.record(z.string(), z.any()),
  requiredLevel: z.number().int().min(1).optional(),
  requiredXP: z.number().int().min(0).optional(),
  requiredBadges: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isRepeatable: z.boolean().default(false),
  cooldownDays: z.number().int().min(0).default(0)
});

// Member update validation
export const UpdateMemberSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional()
});

// Leaderboard query validation
export const LeaderboardQuerySchema = z.object({
  companyId: z.string(),
  type: z.enum(['total_xp', 'weekly_xp', 'level', 'badges_earned']),
  timeframe: z.enum(['all_time', 'weekly', 'monthly']).default('all_time'),
  limit: z.number().int().min(1).max(100).default(50)
});
