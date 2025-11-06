# Whop Integration Notes

## Important: Whop SDK

The Whop SDK packages (`@whop/api` and `@whop-apps/frosted-ui`) are not publicly available on npm. This project uses a custom implementation using axios to interact with the Whop API.

## API Implementation

The Whop API integration is implemented in `lib/whop.ts` using axios HTTP client. All API calls follow the Whop API v1 specification.

### Available Functions

```typescript
// Get company data
await getCompanyData(companyId);

// Get membership data
await getMembership(membershipId);

// Get user data
await getUserData(userId);

// Send notification
await sendNotification({
  userId: 'user-id',
  title: 'Notification Title',
  message: 'Notification message',
  link: '/optional/link'
});

// Verify webhook signature
verifyWebhookSignature(payload, signature);

// Assign role (placeholder)
await assignRole({ membershipId, roleId });

// Create discount code (placeholder)
await createDiscountCode({ companyId, code, discountPercent });

// Extend membership (placeholder)
await extendMembership({ membershipId, days });
```

## API Endpoints

Base URL: `https://api.whop.com/v1`

### Authentication

All requests require Bearer token authentication:

```
Authorization: Bearer YOUR_WHOP_API_KEY
```

### Endpoints Used

- `GET /companies/{id}` - Get company details
- `GET /memberships/{id}` - Get membership details
- `GET /users/{id}` - Get user details
- `POST /notifications` - Send notification to user

### Webhook Events

The following webhook events are supported:

- `message.created` - When a message is sent
- `payment.succeeded` - When a payment is completed
- `course.section_completed` - When a course section is completed
- `membership.created` - When a new member joins
- `membership.deleted` - When a member leaves

## Whop API Documentation

For full Whop API documentation, visit: https://docs.whop.com

## Environment Variables

Required Whop environment variables:

```env
WHOP_API_KEY=whop_...              # Your Whop API key
WHOP_CLIENT_ID=...                 # Your Whop client ID
WHOP_CLIENT_SECRET=...             # Your Whop client secret
WHOP_WEBHOOK_SECRET=...            # Webhook signature secret
NEXT_PUBLIC_WHOP_COMPANY_ID=...    # Your company ID
```

## Testing

To test the Whop integration locally:

1. Set up ngrok to expose your local server:
   ```bash
   npx ngrok http 3000
   ```

2. Update your Whop app webhook URL with the ngrok URL

3. Trigger events in your Whop community

4. Check the webhook handler logs

## Webhook Signature Verification

All incoming webhooks are verified using HMAC-SHA256:

```typescript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', WHOP_WEBHOOK_SECRET);
const digest = hmac.update(payload).digest('hex');
const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
```

## Error Handling

All Whop API calls include error handling:

```typescript
try {
  const response = await whopClient.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

## Rate Limiting

Whop API has rate limits. Implement retry logic for production:

```typescript
// Recommended: Use axios-retry
import axiosRetry from 'axios-retry';

axiosRetry(whopClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return error.response?.status === 429;
  }
});
```

## Production Considerations

1. **Cache API responses** - Use Redis to cache frequently accessed data
2. **Implement retry logic** - Handle rate limits and transient errors
3. **Monitor API usage** - Track API calls and response times
4. **Handle webhook failures** - Implement retry mechanism for failed webhooks
5. **Validate webhook signatures** - Always verify webhook authenticity

## Support

For Whop API support:
- Documentation: https://docs.whop.com
- Discord: Join the Whop developer community
- Email: Contact Whop support

## Notes

- Some Whop API features may require specific permissions
- Test all integrations in a development environment first
- Keep API keys secure and never commit them to version control
- Monitor webhook delivery in the Whop dashboard
