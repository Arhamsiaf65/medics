# Quick Railway Deployment Checklist

## Before You Start
- [ ] Push all changes to GitHub `git push origin main`
- [ ] Verify `.env` is in `.gitignore`
- [ ] Test backend locally: `npm run build && npm start`
- [ ] Backend is running on port 5000 successfully

## Step 1: Deploy Backend (15 minutes)

1. [ ] Go to https://railway.app and sign in with GitHub
2. [ ] Click **New Project** → **Deploy from GitHub**
3. [ ] Select your `medics` repository
4. [ ] Railway detects it's a monorepo
5. [ ] Create service for `backend` folder
6. [ ] Set configurations:
   - Root Directory: `backend`
   - Build: `npm run build`
   - Start: `npm start`
7. [ ] Add these environment variables in Railway:
   ```
   MONGODB_URI=<your-mongodb-atlas-url>
   REDIS_URL=<your-upstash-url>
   JWT_SECRET=<new-random-secret-key>
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-app-password>
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   NODE_ENV=production
   ```
8. [ ] Click Deploy
9. [ ] Wait for deployment to complete (check logs)
10. [ ] Copy the **Public URL** (e.g., `https://medics-xyz.up.railway.app`)
11. [ ] Test API: Open `https://medics-xyz.up.railway.app/api/health` or similar
12. [ ] Check logs for any errors

## Step 2: Update Backend CORS

1. [ ] Update `backend/src/server.ts` CORS origins with your frontend URL
2. [ ] Commit: `git add . && git commit -m "Update CORS for production"`
3. [ ] Push: `git push origin main`
4. [ ] Railway auto-redeploys (watch logs)

## Step 3: Deploy Frontend (Vercel is recommended)

### Option A: Vercel
1. [ ] Go to https://vercel.com and sign in with GitHub
2. [ ] Click **Add New → Project**
3. [ ] Select your `medics` repository
4. [ ] Configure:
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Install: `npm install`
5. [ ] Add environment variable:
   ```
   VITE_API_URL=https://medics-xyz.up.railway.app
   ```
6. [ ] Deploy
7. [ ] Get your Vercel URL (e.g., `https://medics.vercel.app`)

### Option B: Railway
1. [ ] In Railway dashboard, click **New Service**
2. [ ] Connect to GitHub → same `medics` repo
3. [ ] Configure:
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Start: `npm install && npx http-server dist -p $PORT`
4. [ ] Add env: `VITE_API_URL=https://medics-xyz.up.railway.app`
5. [ ] Deploy

## Step 4: Final Testing

- [ ] Frontend loads without errors
- [ ] Check browser console (F12) - no CORS errors
- [ ] Try login/register
- [ ] Test API calls
- [ ] Try chat/WebSocket feature
- [ ] Test email sending
- [ ] Check mobile responsiveness
- [ ] Load speed test

## Troubleshooting Quick Fixes

**CORS Error?**
- [ ] Check backend URL in frontend
- [ ] Verify frontend URL in backend CORS settings
- [ ] Restart backend (redeploy)

**WebSocket Not Connecting?**
- [ ] Check Redis URL is correct in Railway
- [ ] Verify Socket.io is enabled in backend
- [ ] Check browser console for errors

**MongoDB Connection Failed?**
- [ ] Verify MongoDB URI in Railway variables
- [ ] Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Test URI locally first

**Emails Not Sending?**
- [ ] Verify EMAIL_USER and EMAIL_PASS
- [ ] Check if using Gmail (needs app password)
- [ ] Check backend logs for SMTP errors

## Success Indicators

When everything works:
- ✅ Frontend loads from your Vercel/Railway URL
- ✅ No CORS errors in console
- ✅ Login works and redirects to dashboard
- ✅ Chat connects with real-time updates
- ✅ Appointments can be booked
- ✅ Confirmation emails arrive
- ✅ No 502/503 errors

## Production URL References

**Save these for future reference:**
- Backend URL: `https://your-railway-backend-url.up.railway.app`
- Frontend URL: `https://your-vercel-frontend-url.vercel.app`
- MongoDB: `mongodb+srv://...`
- Redis: `rediss://...`
- Railway Dashboard: `https://railway.app/project/[project-id]`

---

**Time estimate: 30-45 minutes for complete deployment**

Need help? Check RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions.
