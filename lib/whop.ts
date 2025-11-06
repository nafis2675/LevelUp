// lib/whop.ts - Whop SDK Integration

import axios from 'axios';
import crypto from 'crypto';

const WHOP_API_BASE = 'https://api.whop.com/v5';

const whopClient = axios.create({
  baseURL: WHOP_API_BASE,
  headers: {
    'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Get Whop configuration from environment
export const whopConfig = {
  apiKey: process.env.WHOP_API_KEY,
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
  agentUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID
};

/**
 * Get company data from Whop
 */
export async function getCompanyData(companyId: string) {
  try {
    const response = await whopClient.get(`/companies/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
}

/**
 * Get membership data from Whop
 */
export async function getMembership(membershipId: string) {
  try {
    const response = await whopClient.get(`/memberships/${membershipId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching membership:', error);
    throw error;
  }
}

/**
 * Get user data from Whop
 */
export async function getUserData(userId: string) {
  try {
    const response = await whopClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Send notification to a user
 */
export async function sendNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    const response = await whopClient.post('/notifications', {
      user_id: params.userId,
      title: params.title,
      body: params.message,
      url: params.link
    });
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Verify webhook signature from Whop
 * FIXED: Uses timing-safe comparison and proper error handling
 * Note: Whop uses x-whop-signature header for webhook verification
 */
export function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) {
    console.warn('No webhook signature provided');
    return false;
  }

  const secret = process.env.WHOP_WEBHOOK_SECRET || process.env.WHOP_API_KEY;
  if (!secret) {
    console.error('WHOP_WEBHOOK_SECRET or WHOP_API_KEY is not set');
    return false;
  }

  // For development, you may want to disable this check
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
    console.log('Development mode: Skipping webhook signature verification');
    return true;
  }

  try {
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Assign role to a member
 */
export async function assignRole(params: {
  membershipId: string;
  roleId: string;
}) {
  try {
    // Implementation depends on Whop API
    // This is a placeholder
    console.log('Assigning role:', params);
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
}

/**
 * Create discount code
 */
export async function createDiscountCode(params: {
  companyId: string;
  code: string;
  discountPercent: number;
  usageLimit?: number;
}) {
  try {
    // Implementation depends on Whop API
    // This is a placeholder
    console.log('Creating discount code:', params);
    return { code: params.code };
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
}

/**
 * Extend membership days
 */
export async function extendMembership(params: {
  membershipId: string;
  days: number;
}) {
  try {
    // Implementation depends on Whop API
    // This is a placeholder
    console.log('Extending membership:', params);
    return true;
  } catch (error) {
    console.error('Error extending membership:', error);
    throw error;
  }
}
