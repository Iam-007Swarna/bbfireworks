# Quick Fix Guide - BB Fireworks Production Issues

> **TL;DR:** Common production issues and their immediate fixes.

## 🚨 Production Not Working After Build?

### 1. Authentication Issues (Login/Logout Not Working)

**Quick Fix:**
```bash
# Kill all old servers
pkill -9 -f "node.*next"

# Clean rebuild
rm -rf .next
npm run build
npm start
```

**Check These:**
- ✅ `.env` has `NEXTAUTH_URL="http://localhost:3000"`
- ✅ `src/auth.config.ts` has `secure: false` for localhost
- ✅ Both `NEXTAUTH_SECRET` and `AUTH_SECRET` are set

---

### 2. Lucide-React Icon Errors

**Error:** `Module factory is not available. It might have been deleted in an HMR update.`

**Quick Fix:**
1. Never import lucide-react in server components
2. Create client component wrapper:

```typescript
// src/components/YourIcon.tsx
"use client";
import { IconName } from "lucide-react";

export function YourIcon() {
  return <IconName size={18} />;
}
```

3. Use wrapper in server component:
```typescript
// src/app/layout.tsx
import { YourIcon } from "@/components/YourIcon";

export default function Layout() {
  return <YourIcon />;
}
```

---

### 3. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Quick Fix:**
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

---

## 🔧 Common Commands

```bash
# Full reset (use when nothing else works)
pkill -9 -f "node.*next" && rm -rf .next && npm run build && npm start

# Just rebuild
rm -rf .next && npm run build

# Start dev
npm run dev

# Start production
npm start

# Check what's running
ps aux | grep "next start"
```

---

## ✅ Production Deployment Checklist

**Before Deploying to HTTPS:**

1. Update `src/auth.config.ts`:
   ```typescript
   secure: true  // Change from false
   ```

2. Update `.env.prod`:
   ```bash
   NEXTAUTH_URL="https://yourdomain.com"  # Change from localhost
   ```

3. Test locally first:
   ```bash
   rm -rf .next
   npm run build
   npm start
   # Test on http://localhost:3000
   ```

4. Deploy only after local production testing passes

---

## 🐛 Debugging

**Check if auth is working:**
```bash
# Browser DevTools → Application → Cookies
# Should see: next-auth.session-token
```

**Check environment variables:**
```bash
cat .env | grep NEXTAUTH
```

**Check running processes:**
```bash
ps aux | grep next
```

---

## 📞 When Nothing Works

1. Kill everything: `pkill -9 -f node`
2. Clear browser cookies completely
3. Delete `.next` and `node_modules/.cache`
4. Restart terminal/IDE
5. Fresh build: `npm run build`
6. Fresh start: `npm start`
7. Test in incognito window

---

**See [PRODUCTION_FIXES.md](./PRODUCTION_FIXES.md) for detailed documentation.**
