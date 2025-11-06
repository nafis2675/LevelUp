# LevelUp: Smart Gamification Suite - Complete Development Specification

## Executive Summary
Build a production-ready Whop app that adds sophisticated gamification mechanics (XP, levels, badges, leaderboards, rewards) to any Whop community. Target 2-week MVP launch with core features, expandable to premium features.

---

## 1. PROJECT OVERVIEW

### 1.1 Core Value Proposition
LevelUp transforms passive community members into engaged participants through game mechanics proven to increase activity by 30-40%. Community owners can reward ANY action (messages, purchases, course completion, custom events) with XP points, badges, and automated rewards.

### 1.2 Success Metrics
- **Technical:** Sub-200ms webhook processing, 99.9% uptime, handles 10,000+ concurrent users
- **Business:** 100+ installs in month 1, $5K MRR by month 3, <5% churn
- **User:** 30%+ increase in member activity, 50%+ of communities customize default settings

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Tech Stack (Whop's Preferred)
```
Frontend:
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Frosted UI components (@whop-apps/frosted-ui)
- TailwindCSS for custom styling
- Recharts for leaderboard visualizations
- React Query for data fetching/caching

Backend:
- Next.js API Routes (serverless functions)
- Prisma ORM with PostgreSQL (Supabase or Railway)
- @whop/api SDK for all Whop interactions
- Webhook signature verification (HMAC)
- Redis for caching leaderboards (Upstash)

Infrastructure:
- Vercel for hosting (instant deployment)
- Supabase/Railway for database
- Upstash Redis for caching
- Cloudinary for badge image uploads
- PostHog for analytics (optional)
```

### 2.2 Database Schema (Prisma)
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core Models

model Company {
  id              String   @id // Whop company ID
  name            String
  ownerId         String   // Whop user ID
  settings        Json     @default("{}")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  members         Member[]
  badges          Badge[]
  rules           XPRule[]
  rewards         Reward[]
  leaderboards    Leaderboard[]
  
  @@index([ownerId])
}

model Member {
  id              String   @id @default(cuid())
  whopUserId      String   // Whop user ID
  whopMembershipId String  // Whop membership ID
  companyId       String
  
  displayName     String
  avatarUrl       String?
  
  totalXP         Int      @default(0)
  level           Int      @default(1)
  currentLevelXP  Int      @default(0) // XP within current level
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastActivityAt  DateTime @default(now())
  
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  xpTransactions  XPTransaction[]
  memberBadges    MemberBadge[]
  rewardsClaimed  RewardClaim[]
  
  @@unique([whopUserId, companyId])
  @@index([companyId, totalXP]) // For leaderboard queries
  @@index([whopMembershipId])
}

model XPRule {
  id          String   @id @default(cuid())
  companyId   String
  
  name        String   // "Message sent", "Course completed", etc.
  eventType   String   // "message.created", "purchase.completed"
  xpAmount    Int      // XP to award
  cooldown    Int      @default(0) // Seconds before same event counts again
  maxPerDay   Int      @default(0) // 0 = unlimited
  
  isActive    Boolean  @default(true)
  conditions  Json?    // Advanced filters (channel, product, etc.)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId, eventType])
}

model XPTransaction {
  id          String   @id @default(cuid())
  memberId    String
  
  amount      Int
  reason      String   // "Message sent in #general"
  eventType   String   // References XPRule.eventType
  metadata    Json?    // Original webhook data
  
  createdAt   DateTime @default(now())
  
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  @@index([memberId, createdAt])
}

model Badge {
  id          String   @id @default(cuid())
  companyId   String
  
  name        String
  description String
  imageUrl    String   // Cloudinary URL or emoji
  rarity      String   @default("common") // common, rare, epic, legendary
  
  // Achievement conditions
  requirement Json     // { type: "xp_total", value: 1000 } or { type: "custom", rules: [...] }
  
  isActive    Boolean  @default(true)
  isSecret    Boolean  @default(false) // Don't show until earned
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  memberBadges MemberBadge[]
  
  @@index([companyId])
}

model MemberBadge {
  id          String   @id @default(cuid())
  memberId    String
  badgeId     String
  
  earnedAt    DateTime @default(now())
  progress    Int      @default(100) // For progressive badges (0-100)
  
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([memberId, badgeId])
  @@index([memberId])
}

model Reward {
  id          String   @id @default(cuid())
  companyId   String
  
  name        String
  description String
  type        String   // "role", "free_days", "discount_code", "custom"
  config      Json     // { roleId: "...", days: 7, code: "LEVEL10" }
  
  requiredLevel Int?
  requiredXP    Int?
  requiredBadges Json? // Array of badge IDs
  
  isActive    Boolean  @default(true)
  isRepeatable Boolean @default(false)
  cooldownDays Int     @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  claims      RewardClaim[]
  
  @@index([companyId])
}

model RewardClaim {
  id          String   @id @default(cuid())
  memberId    String
  rewardId    String
  
  claimedAt   DateTime @default(now())
  status      String   @default("pending") // pending, completed, failed
  
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  reward      Reward   @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  
  @@index([memberId])
  @@index([rewardId])
}

model Leaderboard {
  id          String   @id @default(cuid())
  companyId   String
  
  name        String   // "All-Time", "This Week", "Top Level Gainers"
  type        String   // "total_xp", "weekly_xp", "level", "badges_earned"
  timeframe   String   @default("all_time") // all_time, weekly, monthly
  
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
}
```

### 2.3 API Routes Structure
```
app/
├── api/
│   ├── webhooks/
│   │   └── route.ts           # Main webhook handler (POST)
│   ├── auth/
│   │   └── callback/route.ts  # OAuth callback
│   ├── members/
│   │   ├── [id]/route.ts      # GET member profile
│   │   └── leaderboard/route.ts # GET leaderboard
│   ├── xp/
│   │   ├── grant/route.ts     # POST manual XP grant
│   │   └── history/route.ts   # GET XP transaction history
│   ├── badges/
│   │   ├── route.ts           # GET all badges, POST create badge
│   │   └── [id]/route.ts      # PATCH update, DELETE badge
│   ├── rewards/
│   │   ├── route.ts           # GET all rewards, POST create reward
│   │   ├── [id]/route.ts      # PATCH update, DELETE reward
│   │   └── claim/route.ts     # POST claim reward
│   ├── rules/
│   │   ├── route.ts           # GET all rules, POST create rule
│   │   └── [id]/route.ts      # PATCH update, DELETE rule
│   └── settings/
│       └── route.ts           # GET/PATCH company settings
```

---

## 3. CORE FEATURES IMPLEMENTATION

### 3.1 XP System Logic

**Level Calculation Formula:**
```typescript
// utils/xp.ts

// Standard RPG curve: XP needed = baseXP * (level ^ exponent)
export const XP_BASE = 100;
export const XP_EXPONENT = 1.5;
export const MAX_LEVEL = 100;

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT));
}

export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

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
```

**XP Granting Logic:**
```typescript
// lib/xp-engine.ts

export async function grantXP(params: {
  memberId: string;
  amount: number;
  reason: string;
  eventType: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  newLevel?: number;
  leveledUp: boolean;
  badgesEarned?: Badge[];
}> {
  const member = await prisma.member.findUnique({
    where: { id: params.memberId }
  });
  
  if (!member) throw new Error('Member not found');
  
  const oldLevel = member.level;
  const newTotalXP = member.totalXP + params.amount;
  const levelData = calculateLevel(newTotalXP);
  
  // Update member
  const updated = await prisma.member.update({
    where: { id: params.memberId },
    data: {
      totalXP: newTotalXP,
      level: levelData.level,
      currentLevelXP: levelData.currentLevelXP,
      lastActivityAt: new Date()
    }
  });
  
  // Create transaction record
  await prisma.xPTransaction.create({
    data: {
      memberId: params.memberId,
      amount: params.amount,
      reason: params.reason,
      eventType: params.eventType,
      metadata: params.metadata
    }
  });
  
  const leveledUp = levelData.level > oldLevel;
  
  // Check for new badges
  const newBadges = await checkBadgeAchievements(member.id, updated);
  
  // Send notifications if leveled up or earned badges
  if (leveledUp) {
    await sendLevelUpNotification(member, levelData.level);
  }
  
  if (newBadges.length > 0) {
    await sendBadgeNotification(member, newBadges);
  }
  
  return {
    success: true,
    newLevel: levelData.level,
    leveledUp,
    badgesEarned: newBadges
  };
}
```

### 3.2 Webhook Handler

```typescript
// app/api/webhooks/route.ts

import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/whop';
import { handleEvent } from '@/lib/event-handler';

export async function POST(req: Request) {
  try {
    // Verify webhook signature
    const body = await req.text();
    const signature = headers().get('x-whop-signature');
    
    if (!verifyWebhookSignature(body, signature)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    
    // Process event asynchronously (don't block webhook response)
    handleEvent(event).catch(console.error);
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

**Event Handler:**
```typescript
// lib/event-handler.ts

export async function handleEvent(event: any) {
  const { action, data } = event;
  
  // Map Whop events to XP rules
  const eventMap = {
    'message.created': 'message.created',
    'payment.succeeded': 'purchase.completed',
    'course.section_completed': 'course.completed',
    'membership.created': 'member.joined'
  };
  
  const eventType = eventMap[action];
  if (!eventType) return; // Ignore unmapped events
  
  // Find applicable XP rules
  const rules = await prisma.xPRule.findMany({
    where: {
      companyId: data.company_id,
      eventType,
      isActive: true
    }
  });
  
  for (const rule of rules) {
    // Check conditions (if any)
    if (rule.conditions && !matchesConditions(data, rule.conditions)) {
      continue;
    }
    
    // Check cooldown
    if (rule.cooldown > 0) {
      const lastGrant = await getLastXPGrant(data.user_id, eventType);
      if (lastGrant && Date.now() - lastGrant.createdAt < rule.cooldown * 1000) {
        continue; // Still in cooldown
      }
    }
    
    // Check daily limit
    if (rule.maxPerDay > 0) {
      const todayCount = await getXPGrantsToday(data.user_id, eventType);
      if (todayCount >= rule.maxPerDay) {
        continue; // Hit daily limit
      }
    }
    
    // Grant XP
    const member = await getOrCreateMember(data.user_id, data.company_id);
    await grantXP({
      memberId: member.id,
      amount: rule.xpAmount,
      reason: rule.name,
      eventType,
      metadata: data
    });
  }
}
```

### 3.3 Badge Achievement System

```typescript
// lib/badge-engine.ts

export async function checkBadgeAchievements(
  memberId: string,
  member: Member
): Promise<Badge[]> {
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
    
    const requirement = badge.requirement as any;
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
        
      case 'custom':
        earned = await evaluateCustomRule(memberId, requirement.rules);
        break;
    }
    
    if (earned) {
      await prisma.memberBadge.create({
        data: {
          memberId,
          badgeId: badge.id,
          earnedAt: new Date()
        }
      });
      newlyEarned.push(badge);
    }
  }
  
  return newlyEarned;
}
```

### 3.4 Leaderboard Generation

```typescript
// lib/leaderboard.ts

export async function generateLeaderboard(params: {
  companyId: string;
  type: 'total_xp' | 'weekly_xp' | 'level' | 'badges_earned';
  timeframe?: 'all_time' | 'weekly' | 'monthly';
  limit?: number;
}) {
  const { companyId, type, timeframe = 'all_time', limit = 50 } = params;
  
  // Try cache first
  const cacheKey = `leaderboard:${companyId}:${type}:${timeframe}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  let query: any = {
    where: { companyId },
    take: limit,
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      totalXP: true,
      level: true
    }
  };
  
  switch (type) {
    case 'total_xp':
      query.orderBy = { totalXP: 'desc' };
      break;
      
    case 'level':
      query.orderBy = [{ level: 'desc' }, { totalXP: 'desc' }];
      break;
      
    case 'weekly_xp':
      // Need to sum XP transactions from last 7 days
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
          ...m,
          weeklyXP: m.xpTransactions.reduce((sum, t) => sum + t.amount, 0)
        }))
        .sort((a, b) => b.weeklyXP - a.weeklyXP)
        .slice(0, limit);
      
      await redis.setex(cacheKey, 300, JSON.stringify(sorted)); // 5min cache
      return sorted;
      
    case 'badges_earned':
      // Count badges per member
      const membersWithBadges = await prisma.member.findMany({
        where: { companyId },
        include: {
          _count: {
            select: { memberBadges: true }
          }
        },
        orderBy: {
          memberBadges: {
            _count: 'desc'
          }
        },
        take: limit
      });
      
      await redis.setex(cacheKey, 300, JSON.stringify(membersWithBadges));
      return membersWithBadges;
  }
  
  const results = await prisma.member.findMany(query);
  await redis.setex(cacheKey, 300, JSON.stringify(results));
  return results;
}
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 Page Structure
```
app/
├── (dashboard)/
│   ├── layout.tsx          # Main app layout with nav
│   ├── page.tsx            # Dashboard overview
│   ├── leaderboard/
│   │   └── page.tsx        # Leaderboard view
│   ├── badges/
│   │   ├── page.tsx        # Badge management
│   │   └── create/page.tsx # Create badge form
│   ├── rewards/
│   │   ├── page.tsx        # Reward management
│   │   └── create/page.tsx # Create reward form
│   ├── rules/
│   │   ├── page.tsx        # XP rules management
│   │   └── create/page.tsx # Create rule form
│   ├── members/
│   │   ├── page.tsx        # Member list
│   │   └── [id]/page.tsx   # Member profile
│   └── settings/
│       └── page.tsx        # App settings
```

### 4.2 Key Components (Using Frosted UI)

**Dashboard Component:**
```tsx
// app/(dashboard)/page.tsx

import { Card, Stat } from '@whop-apps/frosted-ui';
import { getMemberStats, getTopMembers } from '@/lib/queries';

export default async function Dashboard() {
  const stats = await getMemberStats();
  const topMembers = await getTopMembers(5);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">LevelUp Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Stat
            label="Total Members"
            value={stats.totalMembers}
            trend={{ value: stats.newThisWeek, label: 'this week' }}
          />
        </Card>
        
        <Card>
          <Stat
            label="XP Awarded Today"
            value={stats.xpToday.toLocaleString()}
            trend={{ value: stats.xpGrowth, label: 'vs yesterday' }}
          />
        </Card>
        
        <Card>
          <Stat
            label="Badges Earned"
            value={stats.badgesEarned}
            trend={{ value: stats.badgesThisWeek, label: 'this week' }}
          />
        </Card>
        
        <Card>
          <Stat
            label="Avg Level"
            value={stats.avgLevel.toFixed(1)}
          />
        </Card>
      </div>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Top Members</h2>
        <TopMembersList members={topMembers} />
      </Card>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <RecentActivityFeed />
      </Card>
    </div>
  );
}
```

**Leaderboard Component:**
```tsx
// components/leaderboard.tsx

import { Avatar, Badge } from '@whop-apps/frosted-ui';

interface LeaderboardProps {
  members: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    totalXP: number;
    level: number;
  }>;
}

export function Leaderboard({ members }: LeaderboardProps) {
  return (
    <div className="space-y-2">
      {members.map((member, index) => (
        <div
          key={member.id}
          className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
        >
          <span className="text-2xl font-bold text-gray-400 w-8">
            {index + 1}
          </span>
          
          <Avatar
            src={member.avatarUrl}
            name={member.displayName}
            size="md"
          />
          
          <div className="flex-1">
            <p className="font-semibold">{member.displayName}</p>
            <p className="text-sm text-gray-600">
              {member.totalXP.toLocaleString()} XP
            </p>
          </div>
          
          <Badge variant={index < 3 ? 'success' : 'default'}>
            Level {member.level}
          </Badge>
        </div>
      ))}
    </div>
  );
}
```

**XP Rule Builder:**
```tsx
// components/rule-builder.tsx

import { Select, Input, Button, Toggle } from '@whop-apps/frosted-ui';
import { useState } from 'react';

export function RuleBuilder({ onSave }: { onSave: (rule: any) => void }) {
  const [rule, setRule] = useState({
    name: '',
    eventType: '',
    xpAmount: 10,
    cooldown: 0,
    maxPerDay: 0,
    isActive: true
  });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(rule); }}>
      <div className="space-y-4">
        <Input
          label="Rule Name"
          placeholder="Message sent in chat"
          value={rule.name}
          onChange={(e) => setRule({ ...rule, name: e.target.value })}
          required
        />
        
        <Select
          label="Trigger Event"
          value={rule.eventType}
          onChange={(val) => setRule({ ...rule, eventType: val })}
          required
        >
          <option value="">Select event...</option>
          <option value="message.created">Message Sent</option>
          <option value="purchase.completed">Purchase Made</option>
          <option value="course.completed">Course Completed</option>
          <option value="member.joined">New Member Joined</option>
        </Select>
        
        <Input
          type="number"
          label="XP Amount"
          value={rule.xpAmount}
          onChange={(e) => setRule({ ...rule, xpAmount: parseInt(e.target.value) })}
          min={1}
          required
        />
        
        <Input
          type="number"
          label="Cooldown (seconds)"
          hint="Prevent spamming the same action"
          value={rule.cooldown}
          onChange={(e) => setRule({ ...rule, cooldown: parseInt(e.target.value) })}
          min={0}
        />
        
        <Input
          type="number"
          label="Max Per Day"
          hint="0 = unlimited"
          value={rule.maxPerDay}
          onChange={(e) => setRule({ ...rule, maxPerDay: parseInt(e.target.value) })}
          min={0}
        />
        
        <Toggle
          label="Active"
          checked={rule.isActive}
          onChange={(checked) => setRule({ ...rule, isActive: checked })}
        />
        
        <Button type="submit" variant="primary">
          Create Rule
        </Button>
      </div>
    </form>
  );
}
```

---

## 5. WHOP INTEGRATION

### 5.1 App Configuration (whop.config.json)
```json
{
  "name": "LevelUp",
  "identifier": "levelup",
  "version": "1.0.0",
  "description": "Smart gamification suite with XP, levels, badges, and leaderboards",
  "icon": "https://your-domain.com/icon.png",
  "category": "Engagement",
  "permissions": [
    "read:company",
    "read:memberships",
    "read:users",
    "write:notifications"
  ],
  "webhooks": [
    "message.created",
    "payment.succeeded",
    "course.section_completed",
    "membership.created",
    "membership.deleted"
  ],
  "oauth": {
    "scopes": ["company:read", "memberships:read", "users:read", "notifications:write"]
  },
  "pricing": {
    "free": {
      "name": "Free",
      "price": 0,
      "limits": {
        "members": 50,
        "badges": 5,
        "rules": 3
      }
    },
    "pro": {
      "name": "Pro",
      "price": 29,
      "interval": "month"
    },
    "premium": {
      "name": "Premium",
      "price": 59,
      "interval": "month"
    }
  }
}
```

### 5.2 Whop SDK Usage
```typescript
// lib/whop.ts

import { WhopAPI } from '@whop/api';

export const whop = new WhopAPI({
  apiKey: process.env.WHOP_API_KEY!
});

export async function getCompanyData(companyId: string) {
  return await whop.companies.retrieve(companyId);
}

export async function getMembership(membershipId: string) {
  return await whop.memberships.retrieve(membershipId);
}

export async function sendNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  return await whop.notifications.create({
    user_id: params.userId,
    title: params.title,
    body: params.message,
    url: params.link
  });
}

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  
  const crypto = require('crypto');
  const secret = process.env.WHOP_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## 6. MVP FEATURES (2-WEEK SPRINT)

### Week 1: Core Infrastructure
- [ ] Project setup (Next.js + Prisma + Supabase)
- [ ] Database schema implementation
- [ ] Whop OAuth integration
- [ ] Webhook handler (message.created only for MVP)
- [ ] Basic XP granting logic
- [ ] Level calculation system
- [ ] Member profile page

### Week 2: UI & Polish
- [ ] Dashboard with stats
- [ ] Leaderboard view (all-time only)
- [ ] XP rule builder (3 default rules)
- [ ] Badge creation (5 default badges)
- [ ] Notification system for level-ups
- [ ] Settings page
- [ ] Deploy to Vercel

### Post-MVP (Premium Features)
- [ ] Custom badge uploads
- [ ] Advanced XP rules (conditions, cooldowns)
- [ ] Reward automation (role assignment, discount codes)
- [ ] Weekly/monthly leaderboards
- [ ] Member profiles with achievement showcase
- [ ] Export data (CSV)
- [ ] Webhook support for more events
- [ ] Admin override tools

---

## 7. ENVIRONMENT VARIABLES

```env
# .env.local

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For Prisma migrations

# Redis
REDIS_URL="redis://..."

# Whop
WHOP_API_KEY="whop_..."
WHOP_CLIENT_ID="..."
WHOP_CLIENT_SECRET="..."
WHOP_WEBHOOK_SECRET="..."
NEXT_PUBLIC_WHOP_COMPANY_ID="..."

# Image Storage
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Optional
POSTHOG_KEY="..." # Analytics
```

---

## 8. DEPLOYMENT CHECKLIST

### Vercel Setup
1. Connect GitHub repo
2. Set environment variables
3. Enable Vercel Postgres (or use external Supabase)
4. Deploy webhook endpoint
5. Configure custom domain (optional)

### Whop App Store
1. Submit app for review
2. Provide test credentials
3. Include screenshots (dashboard, leaderboard, badges)
4. Write compelling description
5. Set pricing tiers

### Testing
- [ ] XP granting works across all event types
- [ ] Level calculations are accurate
- [ ] Badges unlock correctly
- [ ] Leaderboard updates in real-time
- [ ] Notifications send properly
- [ ] Webhook signature verification works
- [ ] Mobile responsive design
- [ ] Load testing (1000+ concurrent users)

---

## 9. SUCCESS CRITERIA

### Technical Metrics
- Webhook latency <200ms (p95)
- Page load time <1s
- Zero data loss (transaction integrity)
- 99.9% uptime

### Business Metrics
- 100+ installs in month 1
- 20%+ conversion to paid (month 2)
- <5% monthly churn
- 4.5+ star rating

### User Metrics
- 30%+ increase in member activity
- 50%+ customize default settings
- 80%+ enable notifications
- <10% support ticket rate

---

## 10. DEVELOPMENT WORKFLOW

### Git Workflow
```bash
# Feature branches
git checkout -b feature/xp-system
git checkout -b feature/badge-engine

# Commits
git commit -m "feat: add XP granting logic"
git commit -m "fix: leaderboard caching bug"

# Before PR
npm run lint
npm run type-check
npm run test
```

### Testing Strategy
```typescript
// __tests__/xp-engine.test.ts

describe('XP Engine', () => {
  it('should grant XP correctly', async () => {
    const result = await grantXP({
      memberId: 'test-member',
      amount: 100,
      reason: 'Test',
      eventType: 'test.event'
    });
    
    expect(result.success).toBe(true);
  });
  
  it('should calculate level correctly', () => {
    const level = calculateLevel(500);
    expect(level.level).toBe(3);
  });
});
```

---

## 11. SECURITY CONSIDERATIONS

- [ ] Validate all webhook signatures
- [ ] Rate limit API endpoints (100 req/min per user)
- [ ] Sanitize all user inputs (XSS prevention)
- [ ] Use parameterized queries (SQL injection prevention)
- [ ] Implement CORS properly
- [ ] Encrypt sensitive data at rest
- [ ] Log all admin actions (audit trail)
- [ ] Implement CSP headers
- [ ] Use HTTPS only
- [ ] Regular dependency updates (npm audit)

---

## 12. PERFORMANCE OPTIMIZATION

- [ ] Cache leaderboards (5min TTL)
- [ ] Index database queries properly
- [ ] Use connection pooling (Prisma)
- [ ] Lazy load badge images
- [ ] Debounce XP calculations
- [ ] Batch notification sends
- [ ] Use CDN for static assets
- [ ] Implement pagination (100 items/page)
- [ ] Compress API responses (gzip)
- [ ] Monitor with Vercel Analytics

---

## FINAL NOTES

**Start with this command:**
```bash
npx create-next-app@latest levelup-gamification --typescript --tailwind --app --src-dir
cd levelup-gamification
npm install @whop-apps/frosted-ui @whop/api @prisma/client
npm install -D prisma
npx prisma init
```

**Default XP Rules for MVP:**
1. Send message: 5 XP (60s cooldown)
2. Make purchase: 100 XP (no limit)
3. Join community: 50 XP (one-time)

**Default Badges:**
1. Welcome - Join community
2. Chatter - Send 100 messages
3. Level 10 - Reach level 10
4. Early Adopter - First 100 members
5. Supporter - Make any purchase

This specification should enable any developer to build a production-ready LevelUp app in 2 weeks. Focus on the MVP features first, then expand to premium features based on user feedback.
