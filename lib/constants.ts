// lib/constants.ts - Application Constants

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  LEADERBOARD: 5 * 60,        // 5 minutes
  MEMBER_PROFILE: 60,         // 1 minute
  BADGE_PROGRESS: 30,         // 30 seconds
  COMPANY_SETTINGS: 10 * 60,  // 10 minutes
  XP_RULES: 5 * 60            // 5 minutes
} as const;

// XP limits
export const XP_LIMITS = {
  MAX_PER_GRANT: 10000,
  MAX_PER_DAY: 50000,
  MIN_GRANT: 1
} as const;

// Leaderboard limits
export const LEADERBOARD_LIMITS = {
  MIN_SIZE: 1,
  MAX_SIZE: 100,
  DEFAULT_SIZE: 50
} as const;

// Badge rarities
export const BADGE_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const;

// Event types
export const EVENT_TYPES = {
  MESSAGE_CREATED: 'message.created',
  PURCHASE_COMPLETED: 'purchase.completed',
  COURSE_COMPLETED: 'course.completed',
  MEMBER_JOINED: 'member.joined',
  MEMBER_LEFT: 'member.left'
} as const;

// Rate limits (requests per time window)
export const RATE_LIMITS = {
  API_PER_MINUTE: 100,
  XP_GRANTS_PER_MINUTE: 60,
  WEBHOOKS_PER_MINUTE: 1000
} as const;

// Time windows (in milliseconds)
export const TIME_WINDOWS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_FACTOR: 2
} as const;
