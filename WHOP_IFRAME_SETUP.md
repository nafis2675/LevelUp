# Whop Iframe SDK Integration

This document describes the Whop Iframe SDK integration completed for the LevelUp app.

## What Was Done

### 1. Installed Whop SDK Packages
```bash
npm install @whop/iframe @whop/react --legacy-peer-deps
```

### 2. Created Whop Provider Component
Created `components/WhopProvider.tsx` - a client-side wrapper for the Whop Iframe SDK provider:
- Wraps `WhopIframeSdkProvider` from `@whop/react`
- Marked as `'use client'` for browser-only execution

### 3. Integrated Provider in Root Layout
Updated `app/layout.tsx`:
- Added `WhopProvider` wrapper around all children
- Ensures SDK is available throughout the app

### 4. Created Test Component
Created `components/WhopIframeTest.tsx`:
- Demonstrates Iframe SDK functionality
- Shows two example buttons:
  - Open Whop Docs (external link)
  - View Profile Example
- Uses `useIframeSdk()` hook to access SDK methods

### 5. Added Test Component to Dashboard
Updated `app/(dashboard)/page.tsx`:
- Imported and rendered `WhopIframeTest` component
- Placed at top of dashboard for visibility

### 6. Configured Dynamic Rendering
Updated `app/(dashboard)/layout.tsx`:
- Added `export const dynamic = 'force-dynamic'`
- Prevents static page generation errors
- Required because Whop SDK needs browser context

### 7. Fixed Database Schema Issues
Fixed various Prisma issues across the codebase:
- Added required `id` and `updatedAt` fields to all `create` operations
- Fixed relation names (e.g., `memberBadges` → `MemberBadge`)
- Ensured all database operations include required fields

## How It Works

### SDK Integration
The Whop Iframe SDK enables communication between your embedded app and the Whop platform:

1. **Provider Setup**: `WhopProvider` wraps your app and initializes the SDK
2. **Hook Usage**: Components use `useIframeSdk()` to access SDK methods
3. **Communication**: SDK uses `window.postMessage` to communicate with Whop

### Available SDK Methods
From the test component, you can see examples of:
- `iframeSdk.openExternalUrl({ url })` - Opens URLs in Whop context

### Additional SDK Capabilities (from Whop docs)
The SDK provides many more methods including:
- User authentication and profile access
- Navigation within Whop
- Modal and dialog management
- Payment flows
- Analytics tracking

## Configuration in Whop Developer Dashboard

To complete the setup, you need to configure your app in the Whop Developer Dashboard:

1. Go to https://whop.com/developer/apps
2. Click on your "LevelUP1" app
3. Set the **Iframe URL** to: `https://thelevelup.vercel.app`
4. Save the settings

This tells Whop to load your Vercel deployment inside the iframe when users access your app.

## CSP Headers

The app already has the correct Content Security Policy headers configured in `next.config.js`:

```javascript
headers: [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self' https://whop.com https://*.whop.com",
  },
]
```

This allows your app to be embedded in Whop's iframe.

## Testing

### Local Testing
1. Run `npm run dev`
2. Visit the dashboard
3. You'll see the Whop Iframe Test component (note: some SDK methods may not work outside of Whop's iframe)

### Production Testing
1. Deploy to Vercel (already done at `https://thelevelup.vercel.app`)
2. Configure the iframe URL in Whop Developer Dashboard
3. Visit your app in Whop: `https://whop.com/joined/teamsync/level-up-1-E1NdiVF7sBxTLZ/app/`
4. The SDK should now be fully functional

## Next Steps

1. **Configure Iframe URL in Whop**: Set the iframe URL in your Whop app settings
2. **Remove Test Component**: Once verified, you can remove `WhopIframeTest` from the dashboard
3. **Implement Real Features**: Use the SDK to:
   - Get current user info
   - Check memberships/permissions
   - Navigate users within Whop
   - Track analytics
   - Handle payments

## Resources

- [Whop Iframe SDK Documentation](https://docs.whop.com/apps/guides/iframe)
- [Whop Developer Dashboard](https://whop.com/developer/apps)
- [Your Vercel Deployment](https://thelevelup.vercel.app)
- [Your Whop App](https://whop.com/joined/teamsync/level-up-1-E1NdiVF7sBxTLZ/app/)

