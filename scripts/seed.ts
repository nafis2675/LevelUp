// scripts/seed.ts - Database seeding script

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test company
  const company = await prisma.company.upsert({
    where: { id: 'test-company-1' },
    update: {},
    create: {
      id: 'test-company-1',
      name: 'Test Community',
      ownerId: 'test-owner-1',
      settings: {},
      updatedAt: new Date()
    }
  });

  console.log('✅ Created company:', company.name);

  // Create default XP rules
  const rules = [
    {
      companyId: company.id,
      name: 'Send Message',
      eventType: 'message.created',
      xpAmount: 5,
      cooldown: 60,
      maxPerDay: 100
    },
    {
      companyId: company.id,
      name: 'Make Purchase',
      eventType: 'purchase.completed',
      xpAmount: 100,
      cooldown: 0,
      maxPerDay: 0
    },
    {
      companyId: company.id,
      name: 'Join Community',
      eventType: 'member.joined',
      xpAmount: 50,
      cooldown: 0,
      maxPerDay: 1
    }
  ];

  for (const rule of rules) {
    await prisma.xPRule.upsert({
      where: { id: `rule-${rule.eventType}` },
      update: {},
      create: {
        id: `rule-${rule.eventType}`,
        ...rule,
        updatedAt: new Date()
      }
    });
    console.log('✅ Created rule:', rule.name);
  }

  // Create default badges
  const badges = [
    {
      companyId: company.id,
      name: 'Welcome',
      description: 'Join the community',
      imageUrl: '👋',
      rarity: 'common',
      requirement: { type: 'member_join' }
    },
    {
      companyId: company.id,
      name: 'Chatter',
      description: 'Send 100 messages',
      imageUrl: '💬',
      rarity: 'common',
      requirement: { type: 'message_count', value: 100 }
    },
    {
      companyId: company.id,
      name: 'Level 10',
      description: 'Reach level 10',
      imageUrl: '🔟',
      rarity: 'rare',
      requirement: { type: 'level', value: 10 }
    },
    {
      companyId: company.id,
      name: 'Early Adopter',
      description: 'One of the first 100 members',
      imageUrl: '🌟',
      rarity: 'epic',
      requirement: { type: 'custom' }
    },
    {
      companyId: company.id,
      name: 'Supporter',
      description: 'Make any purchase',
      imageUrl: '💎',
      rarity: 'rare',
      requirement: { type: 'purchase_count', value: 1 }
    }
  ];

  for (const badge of badges) {
    await prisma.badge.create({
      data: {
        id: `badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...badge,
        updatedAt: new Date()
      }
    });
    console.log('✅ Created badge:', badge.name);
  }

  // Create default leaderboard
  await prisma.leaderboard.upsert({
    where: { id: 'default-leaderboard' },
    update: {},
    create: {
      id: 'default-leaderboard',
      companyId: company.id,
      name: 'All-Time Top Players',
      type: 'total_xp',
      timeframe: 'all_time',
      isDefault: true,
      updatedAt: new Date()
    }
  });

  console.log('✅ Created default leaderboard');

  console.log('');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
