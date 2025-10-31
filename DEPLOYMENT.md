# Deployment Guide

## Current Status

✅ **Deployed to Vercel**: https://infinite-corkboard.vercel.app
✅ **GitHub Repository**: https://github.com/phoebusdev/infinite-corkboard
✅ **Environment Variable Set**: `ADMIN_PASSWORD` = `corkboard2024!`
✅ **Storage**: Vercel Blob (simpler than KV!)

## Quick Setup (30 seconds)

### Add Vercel Blob Storage

1. Go to https://vercel.com/phoebusdevs-projects/infinite-corkboard
2. Click on the "Storage" tab
3. Click "Create" or "Connect Store"
4. Select "Blob"
5. Click "Continue" and "Connect"
6. Vercel automatically adds `BLOB_READ_WRITE_TOKEN`
7. Done! Your notes will now persist.

That's it! Blob is much simpler than KV - just one click to set up.

## Test the Application

Once Blob is connected:

1. Visit https://infinite-corkboard.vercel.app
2. Click "Login to Edit" button (top right)
3. Enter password: `corkboard2024!`
4. Click anywhere on the board to add sticky notes
5. Click notes to focus and write on them
6. Refresh the page - your notes persist!

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
- All changes save automatically to Blob storage

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

Note: Local development works without Blob (notes just won't persist).

## Architecture

- **Frontend**: Next.js 14 (App Router) with React 18
- **Styling**: Tailwind CSS with custom corkboard theme
- **Storage**: Vercel Blob (stores papers.json file)
- **Auth**: Simple cookie-based password authentication
- **Deployment**: Vercel with automatic GitHub deployments

## Why Blob Instead of KV?

- **Simpler**: Just stores a JSON file, no database complexity
- **Easier Setup**: One-click connection in Vercel
- **Perfect for this use case**: Storing a list of papers doesn't need a database
- **Cost-effective**: Blob is very economical for small data

## Production URLs

- **Main**: https://infinite-corkboard.vercel.app
- **GitHub**: https://github.com/phoebusdev/infinite-corkboard
- **Vercel Dashboard**: https://vercel.com/phoebusdevs-projects/infinite-corkboard
