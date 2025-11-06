# LevelUp: Smart Gamification Suite

A production-ready Whop app that adds sophisticated gamification mechanics (XP, levels, badges, leaderboards, rewards) to any Whop community.

## Features

- **XP System**: Award XP for any action (messages, purchases, course completion)
- **Leveling**: Automatic level progression with RPG-style curve
- **Badges**: Create achievement badges with custom requirements
- **Leaderboards**: Multiple leaderboard types (all-time, weekly, by level, by badges)
- **Rewards**: Automated rewards (roles, free days, discount codes)
- **Webhooks**: Real-time event processing from Whop
- **Admin Dashboard**: Full-featured UI for managing all aspects

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Caching**: Redis (Upstash)
- **Integration**: Whop SDK

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `WHOP_API_KEY` - Your Whop API key
- `WHOP_CLIENT_ID` - Your Whop client ID
- `WHOP_CLIENT_SECRET` - Your Whop client secret
- `WHOP_WEBHOOK_SECRET` - Your Whop webhook secret

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

```
├── app/
│   ├── (dashboard)/        # Dashboard pages
│   │   ├── page.tsx        # Main dashboard
│   │   ├── leaderboard/    # Leaderboard page
│   │   ├── badges/         # Badge management
│   │   ├── rewards/        # Reward management
│   │   ├── rules/          # XP rules
│   │   └── settings/       # App settings
│   ├── api/                # API routes
│   │   ├── webhooks/       # Webhook handler
│   │   ├── members/        # Member endpoints
│   │   ├── xp/             # XP endpoints
│   │   ├── badges/         # Badge endpoints
│   │   ├── rewards/        # Reward endpoints
│   │   └── rules/          # Rules endpoints
│   └── layout.tsx          # Root layout
├── lib/
│   ├── xp.ts               # XP calculation utilities
│   ├── xp-engine.ts        # XP granting engine
│   ├── badge-engine.ts     # Badge achievement system
│   ├── leaderboard.ts      # Leaderboard generation
│   ├── event-handler.ts    # Webhook event handler
│   ├── whop.ts             # Whop SDK integration
│   ├── notifications.ts    # Notification system
│   ├── prisma.ts           # Prisma client
│   └── redis.ts            # Redis client
├── prisma/
│   └── schema.prisma       # Database schema
└── whop.config.json        # Whop app configuration
```

## API Endpoints

### Webhooks
- `POST /api/webhooks` - Main webhook handler

### Members
- `GET /api/members/[id]` - Get member profile
- `PATCH /api/members/[id]` - Update member
- `GET /api/members/leaderboard` - Get leaderboard

### XP
- `POST /api/xp/grant` - Manually grant XP
- `GET /api/xp/history` - Get XP transaction history

### Badges
- `GET /api/badges` - List all badges
- `POST /api/badges` - Create badge
- `PATCH /api/badges/[id]` - Update badge
- `DELETE /api/badges/[id]` - Delete badge

### Rules
- `GET /api/rules` - List all XP rules
- `POST /api/rules` - Create rule
- `PATCH /api/rules/[id]` - Update rule
- `DELETE /api/rules/[id]` - Delete rule

### Rewards
- `GET /api/rewards` - List all rewards
- `POST /api/rewards` - Create reward
- `PATCH /api/rewards/[id]` - Update reward
- `DELETE /api/rewards/[id]` - Delete reward
- `POST /api/rewards/claim` - Claim reward

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

The app will be automatically deployed on push to main branch.

### Database

Use [Supabase](https://supabase.com) or [Railway](https://railway.app) for PostgreSQL hosting.

### Redis

Use [Upstash](https://upstash.com) for Redis caching (free tier available).

## Whop Integration

1. Create a new app in your Whop dashboard
2. Copy your webhook URL: `https://your-app.vercel.app/api/webhooks`
3. Configure webhooks for these events:
   - `message.created`
   - `payment.succeeded`
   - `course.section_completed`
   - `membership.created`
   - `membership.deleted`
4. Add your API keys to environment variables

## Default Configuration

### XP Rules (MVP)
1. Send message: 5 XP (60s cooldown)
2. Make purchase: 100 XP (no limit)
3. Join community: 50 XP (one-time)

### Default Badges
1. Welcome - Join community
2. Chatter - Send 100 messages
3. Level 10 - Reach level 10
4. Early Adopter - First 100 members
5. Supporter - Make any purchase

## Level Calculation

Uses standard RPG curve:
- Base XP: 100
- Exponent: 1.5
- Max Level: 100
- Formula: XP needed = 100 * (level ^ 1.5)

## Performance

- Webhook processing: <200ms (p95)
- Leaderboard caching: 5 minutes TTL
- Database indexing on all frequent queries
- Redis caching for expensive operations

## Security

- Webhook signature verification (HMAC)
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration

## Support

For issues or questions:
- Check the documentation in `DEVELOPMENT_PROMPT.md`
- Review the API endpoints
- Contact support

## License

MIT
