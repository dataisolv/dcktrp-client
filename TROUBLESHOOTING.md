# Troubleshooting Guide

## Network Error on Login

### Problem
Getting "Network Error" or "AxiosError" when trying to login.

### Solution
The app now uses Next.js rewrites to proxy API requests to avoid CORS issues. Make sure:

1. **Backend server is running**
   ```bash
   # In dcktrp-rag directory
   # Start the server (default port: 8012)
   ```

2. **Environment variable is set correctly**
   ```env
   # In .env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8012
   ```

3. **Dev server was restarted after config changes**
   ```bash
   # Stop the server (Ctrl+C) and restart
   pnpm run dev
   ```

### How It Works

The Next.js config (`next.config.ts`) now includes rewrites that proxy these paths:
- `/login` → `http://localhost:8012/login`
- `/users/*` → `http://localhost:8012/users/*`
- `/conversations/*` → `http://localhost:8012/conversations/*`
- `/query/*` → `http://localhost:8012/query/*`
- etc.

This is similar to how dcktrp-ui uses Vite's proxy feature, but for Next.js.

## User Registration Issues

### Problem
Unable to register a new user - getting 403 Forbidden or similar error.

### Cause
The `/users/` endpoint requires admin privileges.

### Solutions

**Option 1: Create admin user on server**
```bash
# On the dcktrp-rag server, create an admin user first
# Then use that admin account to create other users
```

**Option 2: Use existing user**
If users already exist on the server, just login with existing credentials.

**Option 3: Modify server** (for development/testing)
Temporarily modify the server's user routes to allow public registration.

## CORS Errors

### Problem
Still getting CORS errors even with proxy.

### Check
1. Make sure the backend server has CORS enabled (it should by default)
2. Verify the proxy is working by checking Network tab in browser DevTools
3. Ensure you're using relative URLs (e.g., `/login` not `http://localhost:8012/login`)

## Streaming Not Working

### Problem
Chat messages send but responses don't stream.

### Solutions
1. Check that `/query/stream` endpoint is accessible on the backend
2. Verify the backend server supports NDJSON streaming
3. Check browser console for any errors during streaming

## Authentication Token Issues

### Problem
Token not persisting or getting logged out frequently.

### Solutions
1. Check browser localStorage (`auth_token` key should exist)
2. Clear localStorage and try logging in again
3. Verify token expiration settings on the server

## Development Server Issues

### Problem
Changes not reflecting or build errors.

### Solutions
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Restart dev server
pnpm run dev
```

## Port Already in Use

### Problem
Error: Port 3000 is already in use

### Solution
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 pnpm run dev
```
