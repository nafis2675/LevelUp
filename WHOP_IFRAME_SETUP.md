# Whop Iframe Setup Guide

This guide will help you properly configure LevelUp to run in Whop's iframe.

## ⚡ Quick Diagnosis

1. **Test Page**: Visit `https://your-vercel-url.vercel.app/test` to verify iframe loading
2. **Health Check**: Visit `https://your-vercel-url.vercel.app/api/health` to check environment

## 🔧 Required Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

### Critical (Required)
```bash
# Database - MUST be configured or app will hang
DATABASE_URL=postgresql://user:password@host:5432/levelup
DIRECT_URL=postgresql://user:password@host:5432/levelup

# Whop Integration
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=app_xxx
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxx
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxx
```

### Optional (Recommended)
```bash
# Redis for caching (optional but recommended)
REDIS_URL=redis://your-redis-url:6379

# Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🎯 Common Issues & Solutions

### Issue: App shows infinite loading spinner

**Cause**: Missing or invalid `DATABASE_URL` in Vercel

**Solution**:
1. Set up a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
2. Add `DATABASE_URL` to Vercel environment variables
3. Redeploy your app

### Issue: "Database not initialized" error

**Cause**: Database schema not created

**Solution**:
```bash
# Run this locally or in Vercel build command
npx prisma db push
```

### Issue: CSP/iframe blocked errors

**Cause**: Content Security Policy blocking iframe

**Solution**: Already configured in `next.config.js`:
```javascript
Content-Security-Policy: "frame-ancestors 'self' https://whop.com https://*.whop.com"
```

This allows embedding from all Whop domains.

## 📋 Setup Checklist

- [ ] Set up PostgreSQL database
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] Add all Whop env variables (`WHOP_API_KEY`, etc.)
- [ ] Run `npx prisma db push` to create database schema
- [ ] Deploy to Vercel
- [ ] Test `/test` page to verify iframe works
- [ ] Test `/api/health` to verify all env vars are set
- [ ] Configure Whop app to use your Vercel URL
- [ ] Test in Whop iframe

## 🚀 Database Setup Options

### Option 1: Vercel Postgres (Easiest)
1. Go to Vercel project → Storage → Create Database
2. Select "Postgres"
3. Environment variables are automatically added

### Option 2: Neon (Free Tier)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy connection string
4. Add as `DATABASE_URL` in Vercel

### Option 3: Supabase (Free Tier)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Project Settings → Database
4. Copy "Connection Pooling" URL
5. Add as `DATABASE_URL` in Vercel

## 🧪 Testing Your Setup

1. **Test Page (No Database Required)**:
   ```
   https://your-app.vercel.app/test
   ```
   Should load immediately and show environment status.

2. **Health Check API**:
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return JSON with all environment variables status.

3. **Main Dashboard (Requires Database)**:
   ```
   https://your-app.vercel.app/
   ```
   Should load with mock data (no database calls).

4. **Leaderboard (Requires Database)**:
   ```
   https://your-app.vercel.app/leaderboard
   ```
   Will show error if database not configured.

## 🔍 Debugging in Whop Iframe

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Look for CSP or CORS errors
5. Verify parent frame is `whop.com` or `*.whop.com`

## 📝 Next Steps

After fixing the environment variables:
1. Redeploy your Vercel app
2. Test the `/test` page in Whop's iframe
3. Verify all environment variables show as "Set"
4. Test the main dashboard
5. Configure your Whop app to use the Vercel URL

## 🆘 Still Having Issues?

Check the logs:
- Vercel Dashboard → Deployments → [Your Deployment] → Runtime Logs
- Look for database connection errors
- Look for missing environment variable errors
- Check for CSP/iframe errors
