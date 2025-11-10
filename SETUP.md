# LevelUp Database Setup

## Quick Setup for Neon Database

After connecting your Neon database to Vercel, you need to push the Prisma schema to create the database tables.

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

### Option 2: Manual Setup

1. Copy your Neon database connection string from Vercel environment variables

2. Create a `.env.local` file:
   ```env
   DATABASE_URL="your-neon-connection-string"
   ```

3. Push the schema:
   ```bash
   npx prisma db push
   ```

### Option 3: In Vercel Dashboard

1. Go to your Vercel project settings
2. Navigate to the "Deployments" tab
3. Redeploy your latest deployment
4. The `postinstall` script will automatically run `prisma generate`
5. After deployment, you need to manually push the schema once:
   - Use Option 1 or 2 above to push the schema to Neon

## Verify Setup

After pushing the schema, you can verify it worked by:

1. Check your Neon dashboard - you should see tables like `Member`, `Company`, `XPTransaction`, etc.
2. Visit your leaderboard page - it should now load (even if empty)

## Troubleshooting

### "relation does not exist" error
This means the database schema hasn't been pushed yet. Follow one of the setup options above.

### "Failed to load leaderboard"
1. Check your DATABASE_URL is correctly set in Vercel
2. Ensure the database schema has been pushed
3. Check Vercel deployment logs for more detailed errors

## Next Steps

After setting up the database, you may want to:
1. Seed some test data: `npm run db:seed`
2. View your database: `npm run db:studio`
