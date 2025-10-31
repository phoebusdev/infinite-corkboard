# Deployment Guide

## Current Status

✅ **Deployed to Vercel**: https://infinite-corkboard.vercel.app
✅ **GitHub Repository**: https://github.com/phoebusdev/infinite-corkboard
✅ **Environment Variable Set**: `ADMIN_PASSWORD` = `corkboard2024!`

## Next Steps to Complete Setup

### 1. Add Vercel KV Storage

The application needs Vercel KV (Redis) to store papers. Follow these steps:

1. Go to https://vercel.com/phoebusdevs-projects/infinite-corkboard
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "KV (Redis)"
5. Name it: `infinite-corkboard-kv`
6. Click "Create"
7. Vercel will automatically add the following environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
8. Redeploy the project (or wait for automatic redeployment)

### 2. Test the Application

Once KV is connected:

1. Visit https://infinite-corkboard.vercel.app
2. Click "Login to Edit" button (top right)
3. Enter password: `corkboard2024!`
4. Click anywhere on the board to add sticky notes
5. Click notes to focus and write on them
6. Click outside to unfocus

## How to Use

### View Mode (Default)
- Anyone can visit and view the corkboard
- Pan by dragging
- Zoom with mouse wheel
- Click notes to read them

### Edit Mode (After Login)
- Login with the admin password
- Click anywhere to add new sticky notes
- Click notes to edit text
- Click the delete button on focused notes to remove them
- All changes save automatically

## Changing the Admin Password

To change the admin password:

```bash
vercel env remove ADMIN_PASSWORD production
echo "your-new-password" | vercel env add ADMIN_PASSWORD production
vercel --prod
```

## Local Development

```bash
# Install dependencies
npm install

# Add .env.local with your password
echo "ADMIN_PASSWORD=your-local-password" > .env.local

# Run development server
npm run dev
```

## Architecture

- **Frontend**: Next.js 14 (App Router) with React 18
- **Styling**: Tailwind CSS with custom corkboard theme
- **Database**: Vercel KV (Redis)
- **Auth**: Simple cookie-based password authentication
- **Deployment**: Vercel with automatic GitHub deployments

## Production URLs

- **Main**: https://infinite-corkboard.vercel.app
- **GitHub**: https://github.com/phoebusdev/infinite-corkboard
- **Vercel Dashboard**: https://vercel.com/phoebusdevs-projects/infinite-corkboard
