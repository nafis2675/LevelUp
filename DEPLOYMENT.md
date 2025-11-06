# LevelUp Deployment Guide

This guide will help you deploy LevelUp to production.

## Prerequisites

- Vercel account (recommended for hosting)
- PostgreSQL database (Supabase or Railway)
- Redis instance (Upstash)
- Whop app credentials
- Domain name (optional)

## Step 1: Database Setup

### Using Supabase (Recommended)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (pooler connection for best performance)
5. Save as `DATABASE_URL` in your environment variables

### Using Railway

1. Go to [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Save as `DATABASE_URL` in your environment variables

## Step 2: Redis Setup (Upstash)

1. Go to [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the Redis URL
4. Save as `REDIS_URL` in your environment variables

## Step 3: Whop App Configuration

1. Go to your Whop developer dashboard
2. Create a new app or use existing one
3. Copy the following credentials:
   - API Key → `WHOP_API_KEY`
   - Client ID → `WHOP_CLIENT_ID`
   - Client Secret → `WHOP_CLIENT_SECRET`
   - Webhook Secret → `WHOP_WEBHOOK_SECRET`
   - Company ID → `NEXT_PUBLIC_WHOP_COMPANY_ID`

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add WHOP_API_KEY
vercel env add WHOP_CLIENT_ID
vercel env add WHOP_CLIENT_SECRET
vercel env add WHOP_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_WHOP_COMPANY_ID

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add all environment variables
6. Click "Deploy"

## Step 5: Set Up Database Schema

After deployment, run the database migration:

```bash
# Using Vercel CLI
vercel env pull .env.local
npm run db:push

# Or manually via Prisma Studio
npx prisma studio
```

## Step 6: Configure Webhooks in Whop

1. Copy your webhook URL: `https://your-app.vercel.app/api/webhooks`
2. Go to your Whop app settings
3. Add webhook URL
4. Select these events:
   - `message.created`
   - `payment.succeeded`
   - `course.section_completed`
   - `membership.created`
   - `membership.deleted`
5. Save webhook configuration

## Step 7: Test the Integration

1. Visit your deployed app URL
2. Go to Settings page
3. Verify webhook URL is displayed
4. Create test XP rules
5. Trigger a test event (send a message in your Whop community)
6. Check if XP was granted

## Step 8: Seed Initial Data (Optional)

```bash
# Seed default rules and badges
npm run db:seed
```

## Environment Variables Checklist

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For migrations

# Redis
REDIS_URL="redis://..."

# Whop
WHOP_API_KEY="whop_..."
WHOP_CLIENT_ID="..."
WHOP_CLIENT_SECRET="..."
WHOP_WEBHOOK_SECRET="..."
NEXT_PUBLIC_WHOP_COMPANY_ID="..."

# Optional
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
POSTHOG_KEY="..."
```

## Monitoring & Analytics

### Vercel Analytics

Vercel automatically provides:
- Performance metrics
- Error tracking
- Real-time logs

Access via: Vercel Dashboard → Your Project → Analytics

### PostHog (Optional)

1. Sign up at [PostHog](https://posthog.com)
2. Copy API key
3. Add `POSTHOG_KEY` to environment variables

## Performance Optimization

### Recommended Settings

**Vercel:**
- Enable Edge Network
- Use Vercel Postgres Connection Pooler
- Enable ISR (Incremental Static Regeneration) for leaderboards

**Database:**
- Enable connection pooling
- Add indexes (already in schema)
- Regular VACUUM operations

**Redis:**
- Set appropriate TTL for caches (5 minutes for leaderboards)
- Monitor memory usage
- Use Redis insights dashboard

## Troubleshooting

### Webhooks Not Working

1. Check webhook URL is correct
2. Verify webhook signature secret matches
3. Check Vercel function logs
4. Test webhook with a manual POST request

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check database is accessible from Vercel
3. Ensure connection pooling is enabled
4. Check Prisma client is generated

### Redis Connection Issues

1. Verify REDIS_URL is correct
2. Check Redis instance is running
3. Test connection manually
4. Check firewall rules

## Scaling Considerations

### Current Limits
- Free tier: 50 members, 5 badges, 3 rules
- Pro tier: Unlimited

### Performance Targets
- Webhook processing: <200ms (p95)
- Page load: <1s
- Database queries: <100ms
- Uptime: 99.9%

### When to Scale

Consider upgrading when:
- Over 1,000 active members
- Over 10,000 daily events
- Over 100,000 XP transactions
- Database response time >100ms

## Security Checklist

- [ ] All environment variables are set
- [ ] Webhook signature verification is enabled
- [ ] Database credentials are secure
- [ ] API endpoints have rate limiting
- [ ] CORS is configured properly
- [ ] All secrets are in environment variables (not code)
- [ ] HTTPS is enforced
- [ ] Input validation is enabled

## Post-Deployment

1. Monitor Vercel function logs for errors
2. Check database performance metrics
3. Verify webhooks are being received
4. Test all features in production
5. Set up uptime monitoring (e.g., UptimeRobot)
6. Configure error alerting

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor webhook delivery

**Weekly:**
- Review performance metrics
- Check database size
- Verify backup integrity

**Monthly:**
- Update dependencies
- Review and optimize queries
- Check for security updates

## Support

If you encounter issues:

1. Check Vercel function logs
2. Review database logs
3. Test webhooks manually
4. Check Redis connection
5. Review environment variables

## Production Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Webhooks configured in Whop
- [ ] Test event processed successfully
- [ ] Dashboard loads correctly
- [ ] API endpoints responding
- [ ] Redis caching working
- [ ] Notifications sending
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backups configured
- [ ] Domain configured (if using custom domain)

## Rollback Plan

If deployment fails:

1. Revert to previous Vercel deployment
2. Check error logs
3. Fix issues locally
4. Test thoroughly
5. Deploy again

```bash
# Rollback using Vercel CLI
vercel rollback
```

---

**Congratulations! Your LevelUp app should now be live! 🎉**
