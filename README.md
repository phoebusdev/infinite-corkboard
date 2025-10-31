# Infinite Corkboard

A never-ending digital corkboard where you can pin and write notes.

## Features

- **Infinite canvas**: Pan and zoom around an unlimited corkboard
- **Pin notes**: Click anywhere to add a sticky note
- **Write freely**: Click notes to focus and write on them
- **View/Edit modes**: Login to edit, public view for everyone else
- **Natural look**: Notes have slight random rotations for a realistic feel

## How to Use

1. **View Mode** (default): See all pinned notes, click to focus and read
2. **Edit Mode**: Login with password to add, edit, and delete notes
3. **Navigation**:
   - Drag the board to pan around
   - Scroll to zoom in/out
   - Click notes to pull them into focus
   - Click outside to unfocus

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and set your admin password:
   ```bash
   cp .env.local.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add Vercel Blob storage in Vercel dashboard
4. Set `ADMIN_PASSWORD` environment variable in Vercel
5. Deploy

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vercel Blob** (Object Storage)
- **Server Actions**

## Environment Variables

- `ADMIN_PASSWORD`: Password for edit mode (required)
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token (auto-set by Vercel)
