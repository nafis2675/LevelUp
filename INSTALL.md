# LevelUp Installation Guide

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or hosted)
- **Redis** instance (optional but recommended)
- **Whop account** with API access

## Step-by-Step Installation

### 1. Verify Prerequisites

```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Check npm version
npm --version
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install:
- Next.js 14
- TypeScript
- Prisma & Prisma Client
- Whop SDK
- TailwindCSS
- Redis client
- And all other dependencies

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/levelup"

# Redis (Optional but recommended)
REDIS_URL="redis://localhost:6379"

# Whop Integration (Required)
WHOP_API_KEY="whop_..."
WHOP_CLIENT_ID="..."
WHOP_CLIENT_SECRET="..."
WHOP_WEBHOOK_SECRET="..."
NEXT_PUBLIC_WHOP_COMPANY_ID="..."

# Image Storage (Optional)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR create a migration (for production)
npm run db:migrate
```

### 5. Seed Database (Optional)

```bash
# Add default XP rules, badges, and leaderboards
npx ts-node scripts/seed.ts
```

This creates:
- 3 default XP rules (message, purchase, join)
- 5 default badges (welcome, chatter, level 10, early adopter, supporter)
- 1 default leaderboard

### 6. Start Development Server

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification

### Check Installation

Visit these URLs to verify everything is working:

1. **Dashboard**: http://localhost:3000
2. **Webhook Health**: http://localhost:3000/api/webhooks (GET request)
3. **Database**: Run `npm run db:studio` to open Prisma Studio

### Test Webhook

```bash
# Test webhook endpoint with curl
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "action": "message.created",
    "data": {
      "user_id": "test-user",
      "company_id": "test-company-1",
      "membership_id": "test-membership"
    }
  }'
```

## Troubleshooting

### Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solutions**:
1. Verify PostgreSQL is running: `psql --version`
2. Check DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Ensure database exists: `createdb levelup`
4. Check firewall/network settings

### Prisma Client Not Generated

**Problem**: Import errors for @prisma/client

**Solution**:
```bash
npm run db:generate
```

### Module Not Found Errors

**Problem**: TypeScript can't find modules

**Solutions**:
1. Delete node_modules: `rm -rf node_modules`
2. Delete package-lock.json: `rm package-lock.json`
3. Reinstall: `npm install`
4. Restart dev server

### Redis Connection Failed

**Problem**: Can't connect to Redis

**Solutions**:
1. Redis is optional - app will work without it
2. Install Redis locally: https://redis.io/download
3. Use hosted Redis (Upstash): https://upstash.com
4. Update REDIS_URL in .env

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript Errors

**Problem**: Type errors during development

**Solutions**:
1. Run type check: `npm run type-check`
2. Check tsconfig.json settings
3. Update TypeScript: `npm install -D typescript@latest`
4. Restart VS Code TypeScript server

## Optional Setup

### Set Up Cloudinary (for badge images)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials from dashboard
3. Add to .env:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Set Up PostHog (for analytics)

1. Sign up at [PostHog](https://posthog.com)
2. Get your API key
3. Add to .env:
```env
POSTHOG_KEY="your-posthog-key"
```

### Configure VS Code

Install recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Database Management

### View Database

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio
```

### Reset Database

```bash
# Warning: This will delete all data!
npx prisma migrate reset
```

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U username levelup > backup.sql

# Restore from backup
psql -U username levelup < backup.sql
```

## Running in Production

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Environment Variables

In production, set these additional variables:
```env
NODE_ENV="production"
```

## Docker Installation (Alternative)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t levelup .
docker run -p 3000:3000 --env-file .env levelup
```

## Quick Start Commands

```bash
# Full installation
npm install && npm run db:generate && npm run db:push

# Development
npm run dev

# Production build
npm run build && npm start

# Database management
npm run db:studio

# Type checking
npm run type-check

# Linting
npm run lint
```

## Getting Help

If you encounter issues:

1. Check error messages in terminal
2. Review logs in browser console
3. Check DATABASE_URL format
4. Verify all environment variables
5. Try deleting node_modules and reinstalling
6. Check Node.js version compatibility

## Next Steps

After successful installation:

1. Read `GETTING_STARTED.md` for configuration
2. Review `DEVELOPMENT_PROMPT.md` for full specification
3. Check `DEPLOYMENT.md` for production deployment
4. Explore the dashboard at http://localhost:3000

---

**Installation complete! 🎉**

Your LevelUp development environment is ready to go!
