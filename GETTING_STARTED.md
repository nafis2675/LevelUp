# Getting Started with LevelUp

Welcome to LevelUp! This guide will help you get your gamification system up and running in minutes.

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
cd LevelUp
npm install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with default data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your dashboard!

## Understanding the System

### Core Concepts

**XP (Experience Points)**
- Members earn XP for various actions (messages, purchases, etc.)
- XP accumulates to increase member levels
- Configurable through XP Rules

**Levels**
- Automatic progression based on total XP
- Uses RPG-style curve (Level 1 → 100)
- Each level requires more XP than the previous

**Badges**
- Achievement rewards for specific accomplishments
- Can be based on XP, level, message count, or custom criteria
- Four rarity tiers: common, rare, epic, legendary

**Rewards**
- Claimable benefits when members reach certain milestones
- Types: roles, free days, discount codes, custom
- Can require level, XP, or specific badges

**Leaderboards**
- Rank members by various metrics
- Types: total XP, weekly XP, level, badges earned
- Cached for performance (5-minute TTL)

## Configuration

### Creating Your First XP Rule

1. Go to **Rules** page
2. Click **Create Rule**
3. Fill in the form:
   - **Name**: "Send Message"
   - **Event Type**: "Message Sent"
   - **XP Amount**: 5
   - **Cooldown**: 60 seconds
   - **Max Per Day**: 100
4. Click **Create Rule**

### Creating Your First Badge

1. Go to **Badges** page
2. Click **Create Badge**
3. Fill in the form:
   - **Name**: "Chatter"
   - **Description**: "Send 100 messages"
   - **Icon**: 💬
   - **Rarity**: Common
   - **Requirement Type**: Message Count
   - **Value**: 100
4. Click **Create Badge**

### Creating Your First Reward

1. Go to **Rewards** page
2. Click **Create Reward**
3. Fill in the form:
   - **Name**: "VIP Role"
   - **Description**: "Get the VIP role"
   - **Type**: Role Assignment
   - **Required Level**: 10
4. Click **Create Reward**

## Webhook Integration

### Setting Up Webhooks

1. Go to your Whop app dashboard
2. Navigate to Webhooks settings
3. Add your webhook URL: `https://your-app.vercel.app/api/webhooks`
4. Select these events:
   - `message.created`
   - `payment.succeeded`
   - `course.section_completed`
   - `membership.created`
   - `membership.deleted`
5. Save the webhook secret in your `.env` file

### Testing Webhooks

```bash
# Send a test webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-whop-signature: your-signature" \
  -d '{
    "action": "message.created",
    "data": {
      "user_id": "test-user",
      "company_id": "test-company",
      "membership_id": "test-membership"
    }
  }'
```

## Dashboard Overview

### Main Dashboard
- Overview statistics
- Top members list
- Recent activity feed

### Leaderboard
- View top members
- Switch between different ranking types
- Filter by timeframe

### Badges
- View all badges
- Create new badges
- Edit existing badges
- See badge statistics

### Rewards
- Manage rewards
- View claim history
- Configure requirements

### Rules
- Configure XP rules
- Set cooldowns and limits
- Enable/disable rules

### Settings
- General configuration
- Notification preferences
- Webhook URL
- Feature toggles

## API Usage

### Grant XP Manually

```javascript
const response = await fetch('/api/xp/grant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberId: 'member-id',
    amount: 50,
    reason: 'Manual grant by admin'
  })
});
```

### Get Member Profile

```javascript
const member = await fetch('/api/members/member-id');
const data = await member.json();
```

### Get Leaderboard

```javascript
const leaderboard = await fetch(
  '/api/members/leaderboard?companyId=your-company&type=total_xp&limit=50'
);
const data = await leaderboard.json();
```

## Customization

### Adjusting XP Curve

Edit `lib/xp.ts`:

```typescript
export const XP_BASE = 100;      // Base XP for calculations
export const XP_EXPONENT = 1.5;  // Growth rate (higher = steeper)
export const MAX_LEVEL = 100;    // Maximum level
```

### Custom Badge Requirements

You can create custom badge requirements by setting the requirement type to `custom` and providing a rules array:

```json
{
  "type": "custom",
  "rules": [
    {
      "type": "xp_in_timeframe",
      "value": 1000,
      "days": 7
    }
  ]
}
```

### Notification Messages

Edit `lib/notifications.ts` to customize notification messages:

```typescript
await sendNotification({
  userId: member.whopUserId,
  title: `🎉 Custom Level Up Message!`,
  message: `You're amazing! You reached Level ${newLevel}!`,
  link: `/members/${member.id}`
});
```

## Best Practices

### XP Rules
- Start with low XP amounts (5-10 for messages)
- Use cooldowns to prevent spam (60s for messages)
- Set daily limits for repetitive actions
- Award more XP for valuable actions (100+ for purchases)

### Badges
- Create a mix of easy and hard badges
- Use secret badges for surprises
- Award badges for milestones (Level 5, 10, 25, etc.)
- Create time-limited badges for events

### Rewards
- Make rewards valuable but achievable
- Use level requirements to create progression
- Don't make rewards too easy to get
- Consider repeatable rewards with cooldowns

### Leaderboards
- Update frequently but cache for performance
- Offer multiple leaderboard types
- Reset weekly/monthly leaderboards for fresh competition
- Highlight top 3 positions

## Troubleshooting

### Database Connection Issues

```bash
# Check database connection
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Whop dashboard for delivery logs
4. Test with curl command (see above)

### Member Not Getting XP

1. Check if XP rule is active
2. Verify event type matches
3. Check cooldown hasn't been triggered
4. Check daily limit hasn't been reached
5. Review event handler logs

### Leaderboard Not Updating

1. Clear Redis cache manually
2. Check cache TTL settings
3. Verify database queries are working
4. Check for errors in logs

## Development Tips

### Database Migrations

```bash
# Create a migration
npm run db:migrate

# View database in browser
npm run db:studio

# Reset database
npx prisma migrate reset
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Linting

```bash
# Run ESLint
npm run lint
```

### Testing Locally

```bash
# Use ngrok to expose local server for webhook testing
npx ngrok http 3000

# Update Whop webhook URL with ngrok URL
```

## Next Steps

1. **Customize Your Configuration**
   - Set up your XP rules
   - Create badges for your community
   - Configure rewards

2. **Test the System**
   - Send test events
   - Verify XP is granted
   - Check badge achievements

3. **Deploy to Production**
   - Follow DEPLOYMENT.md guide
   - Set up monitoring
   - Configure webhooks

4. **Engage Your Community**
   - Announce the gamification system
   - Explain how to earn XP
   - Show off the leaderboard

## Resources

- **Documentation**: See DEVELOPMENT_PROMPT.md for full specification
- **Deployment**: See DEPLOYMENT.md for production setup
- **API Reference**: See README.md for API endpoints
- **Whop Docs**: https://docs.whop.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Support

Need help? Check these resources:

1. Review the error logs in your console
2. Check Vercel function logs (in production)
3. Review the API endpoint documentation
4. Check the Prisma schema for data structure
5. Test webhooks manually with curl

## Tips for Success

✅ Start with simple XP rules and expand gradually
✅ Test thoroughly before deploying
✅ Monitor webhook delivery in Whop dashboard
✅ Keep cooldowns reasonable (don't frustrate users)
✅ Make badges achievable but meaningful
✅ Use the leaderboard to drive engagement
✅ Regularly check analytics and adjust

---

**Ready to level up your community? Let's go! 🚀**
