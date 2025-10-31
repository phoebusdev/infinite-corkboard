# Infinite Corkboard

A production-ready infinite corkboard web application where users can add, move, and edit virtual sticky notes.  Built with Next.js 16, React 19, TypeScript 5, and Zustand.

## ✅ Features Implemented

### Phase 1: Foundation & Security

- **Secure Authentication**: Bcrypt password hashing with rate limiting (5 attempts/15min via Vercel KV)
- **Optimistic Locking**: Version-based concurrency control prevents data loss from simultaneous edits
- **Error Handling**: Global error boundaries + Sonner toast notifications
- **Auto Backups**: Automated backups before every data mutation
- **Schema Migration**: Automatic migration of existing papers to new schema

### Phase 2: State Management

- **Zustand Store**: Centralized state with DevTools (papers, viewport, UI, auth slices)
- **Custom Hooks**: `usePapers()`, `useViewport()`, `useAuth()`, `useDebounce()`
- **Optimistic Updates**: Instant UI feedback with automatic rollback on errors
- **Debounced Saves**: Text updates debounced to 500ms, position updates on drag end

## 🏗️ Architecture

**Tech Stack**: Next.js 16 (App Router) • React 19 • TypeScript 5 • Tailwind CSS 4 • Zustand • Vercel Blob • bcrypt • Sonner

**Key Files**:
- `app/actions.ts` - Server actions with versioning & rate limiting
- `lib/store/` - Zustand slices (papers, viewport, UI, auth)
- `lib/hooks/` - Custom hooks for CRUD operations
- `lib/storage/` - Versioned storage with automatic backups
- `lib/auth/` - Secure authentication with password hashing

**Data Model**:
```typescript
interface Paper {
  id, text, x, y, rotation, zIndex, color, width, height,
  createdAt, updatedAt, version, tags[], isLocked
}
```

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Generate password hash
node scripts/hash-password.js admin123

# 3. Configure .env.local
cp .env.example .env.local
# Add: ADMIN_PASSWORD_HASH="$2b$10$..."

# 4. Run
npm run dev
```

**Login**: Use the password you hashed in step 2

## 📖 Usage

1. **Add Papers**: Click anywhere (requires login)
2. **Edit**: Click paper to focus and edit
3. **Move**: Drag papers to reposition
4. **Delete**: Click Delete when focused
5. **Navigate**: Drag background (pan), scroll (zoom 0.5x-2x)

## 🔐 Security

- Bcrypt password hashing (10 rounds)
- Rate limiting (5 attempts per 15min per IP)
- HttpOnly, Secure, SameSite cookies
- Optimistic locking with version numbers
- Automatic backups before mutations

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Set `ADMIN_PASSWORD_HASH` env var
4. Deploy (Blob storage auto-created)

Optional: Add Vercel KV for rate limiting

## 🗺️ Roadmap

### Phase 3: Enhanced Features (Next)
- [ ] Paper colors (5 options: yellow, pink, blue, green, orange)
- [ ] Z-index management (click to bring forward)
- [ ] Keyboard shortcuts (Delete, Esc, Ctrl+F)
- [ ] Search & filter
- [ ] Export/import (JSON)

### Phase 4: Polish & Production
- [ ] Virtual scrolling (react-virtuoso for 1000+ papers)
- [ ] UI animations & polish
- [ ] Testing (Jest + Playwright)
- [ ] Performance monitoring
- [ ] Complete documentation

### Future
- Real-time collaboration (WebSockets)
- Paper resizing & rich text
- Mobile touch support
- Paper linking with arrows

## 📝 Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
```

**Current Status**: Phase 1 & 2 Complete ✅ • Next: Phase 3 (Enhanced Features)

## 📄 License

MIT

---

Built with ❤️ using Next.js • Zustand • Tailwind CSS • Vercel
