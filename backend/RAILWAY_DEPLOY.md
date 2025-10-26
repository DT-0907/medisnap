# Railway Deployment Guide for MedSnap Backend

## Prerequisites
- Railway CLI installed ✅ (already done)
- Railway account created
- Backend code ready ✅ (already done)

## Deployment Steps

### Step 1: Login to Railway
```bash
railway login
```
This will open your browser for OAuth authentication. Complete the login process.

### Step 2: Initialize Railway Project
```bash
cd backend
railway init
```
- Select "Create new project"
- Name it "medisnap-backend" or similar
- Choose your team/personal account

### Step 3: Link to GitHub (Optional but Recommended)
```bash
railway link
```
This enables automatic deployments on git push.

### Step 4: Add Environment Variables
```bash
railway variables set SUPABASE_URL="<from-dev4>"
railway variables set SUPABASE_KEY="<from-dev4>"
railway variables set SUPABASE_DB_URL="<from-dev4>"
railway variables set GEMINI_API_KEY="<your-key>"
railway variables set FISH_AUDIO_API_KEY="<your-key>"
railway variables set LETTA_API_KEY="<your-key>"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set DEMO_MODE="false"
```

Or add them via Railway Dashboard:
1. Go to your project on https://railway.app
2. Click on your service
3. Go to "Variables" tab
4. Add each variable from .env.example

### Step 5: Deploy
```bash
railway up
```

This will:
- Build your TypeScript code
- Deploy to Railway's infrastructure
- Assign a public URL (e.g., medisnap-backend-production.up.railway.app)

### Step 6: Verify Deployment
```bash
railway status
railway logs
```

Test the deployed API:
```bash
curl https://your-railway-url.railway.app/health
```

### Step 7: Get Public URL
```bash
railway domain
```

Share this URL with:
- Dev 1 (Frontend/Lens Studio) for API integration
- Dev 2 (AR/CV) for backend communication
- Team documentation

## Configuration Files Created

### railway.json
- Defines build and deploy configuration
- Uses Nixpacks builder (Railway's default)
- Specifies build and start commands

### nixpacks.toml
- Configures Node.js 18 runtime
- Defines build phases
- Optimizes deployment process

## Troubleshooting

### Build Fails
- Check Railway logs: `railway logs`
- Ensure all dependencies in package.json
- Verify TypeScript compiles locally: `npm run build`

### Environment Variables Missing
- Check Railway dashboard or `railway variables`
- Ensure Supabase credentials from Dev 4
- Verify API keys are valid

### Port Issues
- Railway automatically assigns PORT via env
- App uses `process.env.PORT || 3000`
- Don't hardcode port numbers

### Deployment Timeout
- Check if build completes: `npm run build`
- Verify start command works: `npm start`
- Review Railway build logs

## Next Steps After Deployment

1. **Share URL with team** - Add to team documentation
2. **Test all endpoints** - Verify health check and future routes
3. **Monitor logs** - `railway logs --follow`
4. **Set up custom domain** (optional) - `railway domain add yourdomain.com`
5. **Configure alerts** - Set up Railway notifications for downtime

## Estimated Time
- Login & Setup: 5 minutes
- Environment Variables: 5 minutes (waiting on Dev 4 for Supabase)
- First Deploy: 5-10 minutes
- Verification: 5 minutes

**Total: ~20-25 minutes**

## Status
- [x] Railway CLI installed
- [ ] Railway login (requires manual auth)
- [ ] Project initialized
- [ ] Environment variables set (waiting on Dev 4)
- [ ] First deployment
- [ ] URL shared with team
