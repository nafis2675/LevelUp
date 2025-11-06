// lib/event-handler.ts - Event Handler for Webhooks

import { prisma } from './prisma';
import { grantXP, getOrCreateMember, getLastXPGrant, getXPGrantsToday } from './xp-engine';
import { getUserData } from './whop';

/**
 * Handle incoming webhook events
 */
export async function handleEvent(event: any): Promise<void> {
  try {
    const { action, data } = event;

    // Map Whop events to internal event types
    const eventMap: Record<string, string> = {
      'message.created': 'message.created',
      'payment.succeeded': 'purchase.completed',
      'course.section_completed': 'course.completed',
      'membership.created': 'member.joined',
      'membership.deleted': 'member.left'
    };

    const eventType = eventMap[action];
    if (!eventType) {
      console.log(`Ignoring unmapped event: ${action}`);
      return;
    }

    // Handle member leaving
    if (eventType === 'member.left') {
      await handleMemberLeft(data);
      return;
    }

    // Get company ID from event
    const companyId = data.company_id || data.companyId;
    if (!companyId) {
      console.error('No company ID in event data');
      return;
    }

    // Find applicable XP rules
    const rules = await prisma.xPRule.findMany({
      where: {
        companyId,
        eventType,
        isActive: true
      }
    });

    if (rules.length === 0) {
      console.log(`No active rules for event type: ${eventType}`);
      return;
    }

    // Get or create member
    const userData = await getUserData(data.user_id).catch(() => null);
    const member = await getOrCreateMember(
      data.user_id,
      companyId,
      {
        displayName: userData?.username || data.user_name || 'Unknown User',
        avatarUrl: userData?.profile_picture_url,
        whopMembershipId: data.membership_id || data.membershipId || 'unknown'
      }
    );

    // Process each applicable rule
    for (const rule of rules) {
      // Check conditions (if any)
      if (rule.conditions && !matchesConditions(data, rule.conditions as any)) {
        console.log(`Event doesn't match rule conditions: ${rule.name}`);
        continue;
      }

      // Check cooldown
      if (rule.cooldown > 0) {
        const lastGrant = await getLastXPGrant(member.id, eventType);
        if (lastGrant) {
          const timeSinceLastGrant = Date.now() - lastGrant.createdAt.getTime();
          if (timeSinceLastGrant < rule.cooldown * 1000) {
            console.log(`Cooldown active for rule: ${rule.name}`);
            continue;
          }
        }
      }

      // Check daily limit
      if (rule.maxPerDay > 0) {
        const todayCount = await getXPGrantsToday(member.id, eventType);
        if (todayCount >= rule.maxPerDay) {
          console.log(`Daily limit reached for rule: ${rule.name}`);
          continue;
        }
      }

      // Grant XP
      console.log(`Granting ${rule.xpAmount} XP to ${member.displayName} for ${rule.name}`);
      await grantXP({
        memberId: member.id,
        amount: rule.xpAmount,
        reason: rule.name,
        eventType,
        metadata: data
      });
    }
  } catch (error) {
    console.error('Error handling event:', error);
    throw error;
  }
}

/**
 * Check if event data matches rule conditions
 */
function matchesConditions(data: any, conditions: Record<string, any>): boolean {
  try {
    for (const [key, value] of Object.entries(conditions)) {
      // Support nested keys with dot notation (e.g., "channel.id")
      const dataValue = key.split('.').reduce((obj, k) => obj?.[k], data);

      if (Array.isArray(value)) {
        // If condition value is an array, check if data value is in array
        if (!value.includes(dataValue)) {
          return false;
        }
      } else if (dataValue !== value) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error matching conditions:', error);
    return false;
  }
}

/**
 * Handle member leaving event
 */
async function handleMemberLeft(data: any): Promise<void> {
  try {
    const companyId = data.company_id || data.companyId;
    const userId = data.user_id || data.userId;

    // Optionally delete member data or mark as inactive
    // For now, we'll keep the data for historical purposes
    const member = await prisma.member.findUnique({
      where: {
        whopUserId_companyId: {
          whopUserId: userId,
          companyId
        }
      }
    });

    if (member) {
      console.log(`Member left: ${member.displayName}`);
      // You could mark as inactive here if you add an isActive field
    }
  } catch (error) {
    console.error('Error handling member left:', error);
  }
}

/**
 * Process events in batch
 */
export async function handleEventBatch(events: any[]): Promise<void> {
  const promises = events.map(event => handleEvent(event).catch(console.error));
  await Promise.all(promises);
}

/**
 * Get event statistics
 */
export async function getEventStats(companyId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await prisma.xPTransaction.findMany({
    where: {
      member: {
        companyId
      },
      createdAt: {
        gte: startDate
      }
    },
    select: {
      eventType: true,
      amount: true,
      createdAt: true
    }
  });

  // Group by event type
  const stats = transactions.reduce((acc, t) => {
    if (!acc[t.eventType]) {
      acc[t.eventType] = { count: 0, totalXP: 0 };
    }
    acc[t.eventType].count++;
    acc[t.eventType].totalXP += t.amount;
    return acc;
  }, {} as Record<string, { count: number; totalXP: number }>);

  return stats;
}
