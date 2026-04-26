# Railway Deployment Guide - Medics Project

This guide covers deploying your full-stack medical appointment system (backend + frontend) to Railway.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services
- **Railway Account**: https://railway.app (free tier available)
- **GitHub Account**: Your project must be on GitHub
- **MongoDB Atlas**: Already set up ✅
- **Upstash Redis**: Already set up ✅
- **Vercel Account**: For frontend (or Railway for both)

### What You'll Get
- Free tier: 512MB RAM, 1GB storage
- WebSocket support ✅ (unlike Vercel)
- Easy GitHub integration
- Persistent environment variables
- Production monitoring

---

## Backend Deployment

### Step 1: Prepare Your Backend

Your backend is already configured correctly. Verify:

```bash
# In e:\medics\backend\package.json
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"  # ← Railway will use this
}
```

**IMPORTANT**: Ensure your `start` script points to the compiled `dist/server.js`

### Step 2: Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access your GitHub repositories
5. Select your `medics` repository

### Step 3: Configure Railway Service

1. After importing, Railway will auto-detect your project
2. Click on the backend folder
3. In the **Settings** tab:
   - **Root Directory**: Set to `backend` (if Railway didn't auto-detect)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Step 4: Add Environment Variables

In Railway dashboard:

1. Go to your project
2. Click **Variables** tab
3. Add these environment variables:

```
MONGODB_URI=mongodb+srv://arhamsaif66_db_admin_user:arhamsaifmedicspass@cluster0.tgkxskm.mongodb.net/myDatabase?retryWrites=true&w=majority

REDIS_URL=rediss://default:gQAAAAAAAaMvAAIgcDFhY2RhODVmZTViMGM0ZDcxOGFmODk4YmE2OTVlZDg2Ng@assured-orca-107311.upstash.io:6379

JWT_SECRET=sdfkjsd$^*$%#(Fds)

EMAIL_USER=arhamsaif65@gmail.com

EMAIL_PASS=mgge qetc pqgz vuqd

PORT=5000

FRONTEND_URL=https://your-vercel-frontend-url.vercel.app

NODE_ENV=production
```

⚠️ **SECURITY WARNING**: 
- Change `JWT_SECRET` to a new strong random value
- Use environment-specific email credentials if possible
- Never commit `.env` file to GitHub (already in `.gitignore` ✅)

### Step 5: Deploy Backend

1. Click **Deploy** button
2. Railway will:
   - Clone your repository
   - Install dependencies
   - Run build command
   - Start your server
3. Monitor logs in the **Logs** tab

**Expected output when successful**:
```
◇ injected env from Railway
socket initialized with Redis Pub/Sub Adapter
Connecting to MongoDB...
Server is running on port [Railway-assigned-port]
```

### Step 6: Get Backend URL

Once deployed:
1. Go to your backend service
2. Copy the **Public URL** (looks like: `https://medics-production-xxx.up.railway.app`)
3. Save this URL - you'll need it for frontend configuration

---

## Frontend Deployment

### Option A: Deploy on Vercel (Recommended for Frontend)

1. Go to https://vercel.com and sign in with GitHub
2. Click **New Project**
3. Select your `medics` repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
```
VITE_API_URL=https://[your-railway-backend-url].up.railway.app
```

6. Deploy and get your frontend URL

### Option B: Deploy on Railway (Both on Same Platform)

If you prefer everything on Railway:

1. In Railway dashboard, create a **new service** for frontend
2. Connect to the same repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm install && npx http-server dist -p $PORT`
   - **Install Command**: `npm install`

4. Add environment variable:
```
VITE_API_URL=https://[your-railway-backend-url].up.railway.app
```

---

## Configuration

### Update Backend CORS Settings

After getting your frontend URL, update [backend/src/server.ts](backend/src/server.ts):

```typescript
app.use(cors({
    origin: [
        "http://localhost:5173",           // Local development
        "http://127.0.0.1:5173",           // Local development
        "https://your-frontend-url.vercel.app",  // Vercel frontend
        "https://your-frontend-url.railway.app"  // If on Railway
    ],
    credentials: true,
}));
```

Then:
1. Commit and push to GitHub
2. Railway will auto-redeploy

### Update Frontend API Configuration

In [frontend/src/api/axios.ts](frontend/src/api/axios.ts), ensure:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});
```

---

## Environment Variables Summary

### Backend (.env on Railway)
| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `REDIS_URL` | Upstash Redis URL | `rediss://...` |
| `JWT_SECRET` | Random secret key | Generate a new one! |
| `EMAIL_USER` | Sender email | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | See Gmail setup below |
| `FRONTEND_URL` | Your deployed frontend URL | `https://your-app.vercel.app` |
| `PORT` | Server port (optional, Railway assigns one) | `5000` |
| `NODE_ENV` | Environment | `production` |

### Frontend (.env on Vercel/Railway)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway backend URL |

---

## Email Configuration for Production

### Gmail Setup (Free)

1. Enable 2-Factor Authentication in Google Account
2. Go to myaccount.google.com → Security
3. Create **App Password** for Gmail
4. Use the 16-character password as `EMAIL_PASS`

### SendGrid Alternative (Recommended)

1. Sign up at https://sendgrid.com (100 emails/day free)
2. Create API Key
3. Update backend to use SendGrid:

```typescript
// In backend/src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All dependencies installed (`npm install` in both backend & frontend)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Local testing successful with `.env` variables
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] Committed and pushed to GitHub

### Backend Deployment
- [ ] Railway project created and connected
- [ ] Root directory set to `backend`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Public URL copied

### Frontend Deployment
- [ ] `VITE_API_URL` set to backend URL
- [ ] Build command: `npm run build`
- [ ] Frontend deployed successfully
- [ ] Frontend URL working

### Post-Deployment Testing
- [ ] Frontend loads without CORS errors
- [ ] Login/Register works
- [ ] API calls succeed
- [ ] WebSocket/Chat connects
- [ ] Emails send successfully
- [ ] Check browser console for errors
- [ ] Check Railway logs for backend errors

---

## Troubleshooting

### Backend Won't Deploy

**Error: "Cannot find module"**
- Check Root Directory is set to `backend`
- Verify `package.json` exists in backend folder
- Check logs for missing dependencies

**Error: "Build failed"**
- Run `npm run build` locally to verify
- Check TypeScript compilation
- Verify Node.js version: `node -v` (should be v18+)

### CORS Errors in Frontend

**Error: "Access to XMLHttpRequest blocked by CORS"**
- Add frontend URL to backend `cors` configuration
- Make sure trailing slashes match
- Clear browser cache
- Restart backend

**Error: "WebSocket connection failed"**
- Railway supports WebSockets ✅
- Check `REDIS_URL` is correct
- Verify Socket.io is initialized
- Check firewall/proxy settings

### Database Connection Issues

**Error: "Cannot connect to MongoDB"**
- Verify `MONGODB_URI` in Railway variables
- Check IP whitelist in MongoDB Atlas (should include Railway IPs)
- Test connection locally with same URI
- Check MongoDB Atlas cluster is running

**Error: "Cannot connect to Redis"**
- Verify `REDIS_URL` is correct
- Check Upstash console for connection limits
- Verify credentials in URL

### Performance Issues

**Server running slowly:**
- Check Railway logs for errors
- Verify database connections
- Monitor Railway resource usage
- Consider upgrading RAM if needed

**WebSocket timeouts:**
- Check Redis connection
- Verify Socket.io adapter is initialized
- Check network latency
- Look for memory leaks in logs

---

## Quick Links

- **Railway Dashboard**: https://railway.app/dashboard
- **MongoDB Atlas**: https://www.mongodb.com/atlas
- **Upstash Console**: https://console.upstash.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Next Steps

1. Deploy backend to Railway
2. Get backend public URL
3. Update frontend CORS settings
4. Deploy frontend to Vercel
5. Test end-to-end functionality
6. Monitor logs for issues
7. Scale up if needed

**Happy Deploying! 🚀**
