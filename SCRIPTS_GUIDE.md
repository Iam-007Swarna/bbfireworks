# Helper Scripts Guide

This project includes several helper scripts to simplify common development and production tasks.

## Available Scripts

### Quick Start Scripts

#### `start-dev.sh`
Starts the development server with auto-reload.

```bash
./start-dev.sh
```

**What it does:**
1. Kills any existing Next.js servers
2. Starts development server on http://localhost:3000
3. Enables hot module replacement (HMR)
4. Uses Turbopack for fast builds

**Use when:**
- Developing new features
- Testing changes with hot reload
- Running in dev mode

---

#### `start-prod.sh`
Starts the production server (requires build first).

```bash
./start-prod.sh
```

**What it does:**
1. Kills any existing Next.js servers
2. Starts production server on http://localhost:3000
3. Runs optimized production build
4. No hot reload (requires restart for changes)

**Use when:**
- Testing production builds locally
- Verifying performance optimizations
- Debugging production-only issues

**Note:** Run `npm run build` before using this script.

---

### Comprehensive Helper Script

#### `scripts.sh`
Main helper script with multiple commands for all common tasks.

```bash
./scripts.sh [command]
```

### Commands

#### Development Commands

**`dev`** - Start development server
```bash
./scripts.sh dev
```
- Kills existing servers
- Starts dev server with HMR
- Equivalent to: `npm run dev`

**`build`** - Build for production
```bash
./scripts.sh build
```
- Cleans `.next` directory
- Runs production build
- Generates optimized bundles
- Equivalent to: `npm run build`

**`prod`** - Build and start production
```bash
./scripts.sh prod
```
- Runs `build` command
- Starts production server
- One-step production testing

**`start`** - Start production server
```bash
./scripts.sh start
```
- Starts production server only
- Requires prior build
- Equivalent to: `npm start`

---

#### Maintenance Commands

**`clean`** - Clean build cache
```bash
./scripts.sh clean
```
- Removes `.next` directory
- Removes `node_modules/.cache`
- Use when experiencing strange build errors

**`clean:all`** - Complete clean
```bash
./scripts.sh clean:all
```
- Removes `.next` directory
- Removes `node_modules` directory
- Requires running `npm install` after
- **Prompts for confirmation**

**`restart`** - Restart production server
```bash
./scripts.sh restart
```
- Kills all existing servers
- Cleans and rebuilds
- Starts fresh production server
- **Most common troubleshooting command**

---

#### Process Management

**`kill`** - Kill all Next.js servers
```bash
./scripts.sh kill
```
- Forcefully terminates all Next.js processes
- Useful when servers are stuck
- Safe to run anytime

**`check`** - Check server status
```bash
./scripts.sh check
```
- Shows running Next.js processes
- Checks if port 3000 is in use
- Displays process IDs and details
- Useful for debugging

---

#### Database Commands

**`db:push`** - Push schema to database
```bash
./scripts.sh db:push
```
- Pushes Prisma schema changes to database
- Use in development
- Equivalent to: `npm run db:push`

**`db:migrate`** - Run database migrations
```bash
./scripts.sh db:migrate
```
- Creates and runs migrations
- Use in production
- Equivalent to: `npm run db:migrate`

**`db:studio`** - Open Prisma Studio
```bash
./scripts.sh db:studio
```
- Opens Prisma Studio GUI
- Visual database browser
- Runs on http://localhost:5555

---

#### Code Quality

**`lint`** - Run ESLint
```bash
./scripts.sh lint
```
- Runs ESLint code quality checks
- Shows warnings and errors
- Equivalent to: `npm run lint`

---

#### Help

**`help`** - Show help message
```bash
./scripts.sh help
./scripts.sh --help
./scripts.sh -h
```
- Displays all available commands
- Shows usage information

---

## Common Workflows

### Starting Development

```bash
# Fresh start
./scripts.sh dev
```

### Testing Production Build

```bash
# Build and start
./scripts.sh prod

# Or step by step
./scripts.sh build
./scripts.sh start
```

### Troubleshooting Production

```bash
# Complete restart
./scripts.sh restart

# Or manual steps
./scripts.sh kill
./scripts.sh clean
./scripts.sh build
./scripts.sh start
```

### Database Changes

```bash
# Development
./scripts.sh db:push

# Production
./scripts.sh db:migrate
```

### Debugging Server Issues

```bash
# Check what's running
./scripts.sh check

# Kill everything
./scripts.sh kill

# Start fresh
./scripts.sh dev  # or prod
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev | `./scripts.sh dev` |
| Start prod | `./scripts.sh prod` |
| Rebuild | `./scripts.sh restart` |
| Kill servers | `./scripts.sh kill` |
| Check status | `./scripts.sh check` |
| Clean cache | `./scripts.sh clean` |
| Database GUI | `./scripts.sh db:studio` |
| Lint code | `./scripts.sh lint` |

---

## Troubleshooting Scripts

### Script Won't Execute

**Error:** `Permission denied`

**Solution:**
```bash
chmod +x start-dev.sh
chmod +x start-prod.sh
chmod +x scripts.sh
```

### Port Already in Use

```bash
# Kill all servers
./scripts.sh kill

# Or manually
lsof -ti:3000 | xargs kill -9
```

### Build Keeps Failing

```bash
# Complete clean
./scripts.sh clean

# Or nuclear option
./scripts.sh clean:all
npm install
./scripts.sh build
```

### Server Won't Start

```bash
# Check what's running
./scripts.sh check

# Kill and restart
./scripts.sh restart
```

---

## Script Features

All scripts include:
- ✅ Colored output for better readability
- ✅ Error handling and validation
- ✅ Process cleanup before starting
- ✅ Helpful status messages
- ✅ Safe defaults

---

## Tips

1. **Use `restart` when in doubt** - It's the most comprehensive fix
2. **Check before starting** - Run `./scripts.sh check` to see what's running
3. **Clean regularly** - Run `./scripts.sh clean` when switching branches
4. **Test production locally** - Always test with `./scripts.sh prod` before deploying
5. **Use tab completion** - Scripts support bash tab completion

---

## Integration with Documentation

For production-specific issues, see:
- [Production Fixes Guide](./docs/PRODUCTION_FIXES.md)
- [Quick Fix Guide](./docs/QUICK_FIX_GUIDE.md)
- [Fixes Summary](./docs/FIXES_SUMMARY.md)

---

**Last Updated:** 2025-10-18
