// lib/notifications.ts - Notification System

import { sendNotification } from './whop';
import type { Member, Badge } from '@prisma/client';

/**
 * Send level up notification
 */
export async function sendLevelUpNotification(
  member: Member,
  newLevel: number
): Promise<void> {
  try {
    await sendNotification({
      userId: member.whopUserId,
      title: `🎉 Level Up! You're now Level ${newLevel}!`,
      message: `Congratulations! You've reached Level ${newLevel}. Keep up the great work!`,
      link: `/members/${member.id}`
    });
  } catch (error) {
    console.error('Error sending level up notification:', error);
  }
}

/**
 * Send badge earned notification
 */
export async function sendBadgeNotification(
  member: Member,
  badges: Badge[]
): Promise<void> {
  try {
    if (badges.length === 1) {
      await sendNotification({
        userId: member.whopUserId,
        title: `🏆 Badge Earned: ${badges[0].name}!`,
        message: badges[0].description,
        link: `/badges`
      });
    } else if (badges.length > 1) {
      await sendNotification({
        userId: member.whopUserId,
        title: `🏆 ${badges.length} Badges Earned!`,
        message: `You've earned: ${badges.map(b => b.name).join(', ')}`,
        link: `/badges`
      });
    }
  } catch (error) {
    console.error('Error sending badge notification:', error);
  }
}

/**
 * Send reward available notification
 */
export async function sendRewardNotification(
  member: Member,
  rewardName: string
): Promise<void> {
  try {
    await sendNotification({
      userId: member.whopUserId,
      title: `🎁 New Reward Available!`,
      message: `You've unlocked: ${rewardName}. Claim it now!`,
      link: `/rewards`
    });
  } catch (error) {
    console.error('Error sending reward notification:', error);
  }
}

/**
 * Send custom notification
 */
export async function sendCustomNotification(
  member: Member,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    await sendNotification({
      userId: member.whopUserId,
      title,
      message,
      link
    });
  } catch (error) {
    console.error('Error sending custom notification:', error);
  }
}
