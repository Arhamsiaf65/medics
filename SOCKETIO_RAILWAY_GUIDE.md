# Socket.io on Railway - Special Configuration Guide

Your medical appointment system uses Socket.io for real-time chat. This guide ensures it works correctly on Railway.

## Why Socket.io Needs Special Setup

- **WebSockets** require persistent connections
- **Multiple instances** need to communicate via Redis
- **Load balancing** requires Socket.io Redis adapter

✅ **Good news**: Railway supports WebSockets and your backend already uses the Redis adapter!

---

## Current Setup (Already Correct)

### Backend Dependencies
```json
{
  "@socket.io/redis-adapter": "^8.3.0",  // ✅ Allows multi-instance Socket.io
  "ioredis": "^5.10.1",                   // ✅ Redis client
  "@socket.io/socket.io": "^4.8.3"        // ✅ Socket.io server
}
```

### Socket.io Configuration
In [backend/src/config/connectSocket.ts](backend/src/config/connectSocket.ts):
- Already uses Redis adapter ✅
- Handles namespaces correctly ✅
- Configured for production ✅

---

## Railway-Specific Configuration

### 1. Redis URL Format (Upstash)

Your Upstash Redis URL should look like:
```
rediss://default:password@hostname.upstash.io:6379
```

**Important Points:**
- Protocol: `rediss://` (with SSL/TLS)
- Default username
- Match this exactly in Railway variables
- Upstash automatically handles connection pooling

### 2. Environment Variables for Railway

In Railway dashboard, ensure these are set:

```
REDIS_URL=rediss://default:[your-token]@[hostname].upstash.io:6379
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
EMAIL_USER=your-email
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-vercel-frontend.vercel.app
NODE_ENV=production
```

### 3. CORS Configuration for WebSockets

Update `backend/src/server.ts`:

```typescript
app.use(cors({
    origin: [
        "http://localhost:5173",              // Local dev
        "https://your-frontend.vercel.app",   // Production
        "https://your-frontend.railway.app"   // If on Railway
    ],
    credentials: true,  // ← CRITICAL for WebSockets
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
```

### 4. Socket.io Initialization

Ensure your Socket.io setup includes Redis adapter:

```typescript
// backend/src/config/connectSocket.ts
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

export function initializeSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    // Redis Pub/Sub Adapter (critical for Railway)
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
            io.adapter(createAdapter(pubClient, subClient));
            console.log("Socket.io connected to Redis");
        })
        .catch(err => {
            console.error("Redis connection error:", err);
        });

    return io;
}
```

---

## Testing Socket.io on Railway

### 1. Check Redis Connection

After deployment, check logs for:
```
socket initialized with Redis Pub/Sub Adapter
Socket.io connected to Redis
```

### 2. Test Connection from Frontend

In browser console (F12):
```javascript
// Open your deployed app and run:
io.on('connect', () => console.log('Connected to Socket.io'));
io.on('disconnect', () => console.log('Disconnected from Socket.io'));
```

### 3. Check Real-time Features

Test in your app:
- [ ] Chat messages appear instantly
- [ ] Typing indicators update in real-time
- [ ] Notifications arrive without refresh
- [ ] Multiple tabs sync correctly

---

## Common Issues & Solutions

### Issue 1: "WebSocket is closed" or timeout

**Cause**: Redis connection failed or Redis URL is wrong

**Solution**:
```bash
# 1. Verify REDIS_URL in Railway variables
# 2. Check it matches Upstash format: rediss://default:token@hostname:6379
# 3. Restart backend service
# 4. Check Railway logs for Redis connection errors
```

### Issue 2: Messages not syncing between tabs

**Cause**: Redis adapter not initialized properly

**Solution**:
```typescript
// Ensure this is in your Socket.io config:
io.adapter(createAdapter(pubClient, subClient));

// And logs show: "Socket.io connected to Redis"
```

### Issue 3: Frequent disconnections on mobile

**Cause**: Railway may be restarting instances or network issues

**Solutions**:
- Add reconnection logic in frontend:
```typescript
// frontend/src/api/socket.ts
const socket = io(API_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});
```

### Issue 4: "Origin mismatch" error

**Cause**: Frontend URL not in CORS origins

**Solution**:
```typescript
// Update backend/src/server.ts
cors: {
    origin: [
        "https://your-exact-frontend-url.com",  // Match exactly!
        // No trailing slash, match protocol (https)
    ]
}
```

---

## Performance Optimization for Railway

### 1. Connection Pooling

Upstash Redis handles this automatically, but monitor:
- Railway Dashboard → Metrics → Memory usage
- If consistently high, consider upgrading

### 2. Message Queue Size

For high traffic, monitor Socket.io backlog:
```typescript
// In your Socket.io event handlers
socket.on('message', (data) => {
    // Keep this fast - offload heavy work to BullMQ
    queue.add('process-message', data);
});
```

### 3. Redis Memory

Upstash free tier: 10,000 requests/day
- Monitor at: https://console.upstash.com
- Chat messages take negligible space
- Clear old data if needed

### 4. Keep-alive Settings

Railway automatically manages these, but you can configure:
```typescript
const io = new Server(server, {
    pingInterval: 25000,      // Send ping every 25s
    pingTimeout: 20000,       // Wait 20s for pong response
    // These help with mobile connections
});
```

---

## Deployment Checklist for Socket.io

- [ ] Redis URL set in Railway variables
- [ ] CORS includes frontend URL with exact domain
- [ ] `credentials: true` in CORS config
- [ ] Redis adapter imported and initialized
- [ ] Logs show "Socket.io connected to Redis"
- [ ] Frontend can connect (check browser console)
- [ ] Test chat functionality end-to-end
- [ ] Monitor Railway metrics for issues

---

## Monitoring & Debugging

### View Socket.io Logs

In Railway dashboard:
```
Logs → Filter for "socket" or "redis"
```

### Test Redis Connection

```bash
# SSH into Railway instance (if available) or check logs
# Look for messages like:
"Socket.io connected to Redis"
"Redis client ready"
```

### Monitor Real-time Activity

Use Socket.io Admin UI (optional):
```typescript
import { instrument } from "@socket.io/admin-ui";

instrument(io, {
    auth: false,
    mode: "development"
});

// Access at: https://your-backend.railway.app/admin/
```

---

## What's Handled Automatically on Railway

✅ HTTP/2 support
✅ WebSocket proxy handling  
✅ SSL/TLS termination
✅ Load balancing (with Redis adapter)
✅ Connection persistence
✅ Automatic restarts on failure

---

## Key Differences: Local vs Railway

| Feature | Local | Railway |
|---------|-------|---------|
| CORS | localhost:3000 | your-domain.com |
| Redis | localhost:6379 | upstash redis url |
| WebSockets | Native support | ✅ Full support |
| Load balancer | Single instance | ✅ With Redis adapter |
| SSL/TLS | Optional | ✅ Enforced |
| Public URL | localhost | https://your-app.railway.app |

---

## Next Steps

1. Deploy backend with correct Redis URL
2. Wait for "Socket.io connected to Redis" in logs
3. Update CORS with production domain
4. Deploy frontend
5. Test chat/real-time features
6. Monitor metrics for 24 hours
7. Celebrate! 🎉

---

For more details, see: `RAILWAY_DEPLOYMENT_GUIDE.md`
