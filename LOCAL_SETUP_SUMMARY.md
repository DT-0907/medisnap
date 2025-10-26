# 🏠 Local Backend Setup - Summary of Changes

## ✅ What Changed for Local Deployment

### 1. **Backend URLs Updated**
All API calls now point to `http://localhost:3000` instead of Railway:

- ✅ `apiIntegrationManager.js` - Main API manager
- ✅ `trainingMode.js` - Training mode endpoints
- ✅ `voiceControllerIntegrated.js` - Voice command processing

### 2. **API Keys Configuration**
- Your `.env` file in `medisnap/backend/` contains all API keys
- Backend reads keys from `.env` and proxies all external API calls
- Keys never exposed to client (secure!)

### 3. **Easy Startup Scripts**
- **Mac/Linux**: `./start-local.sh`
- **Windows**: `start-local.bat`

## 🚀 Quick Start (2 Steps!)

### Step 1: Start Backend
```bash
# Mac/Linux
./start-local.sh

# Windows
start-local.bat

# OR manually
cd medisnap/backend
npm run dev
```

### Step 2: Open Lens Studio
1. Open `lens-studio/MedSnap.lsproj`
2. Click Preview
3. Everything auto-connects to localhost:3000

## 📁 Your .env File Should Have

```bash
# medisnap/backend/.env
SUPABASE_URL=your-actual-url
SUPABASE_KEY=your-actual-key
SUPABASE_DB_URL=your-actual-db-url

GEMINI_API_KEY=your-actual-key
FISH_AUDIO_API_KEY=your-actual-key
LETTA_API_KEY=your-actual-key

PORT=3000
NODE_ENV=development
DEMO_MODE=false
```

## 🔍 Verify Everything Works

### Test 1: Backend Health
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### Test 2: In Lens Studio Console
```javascript
global.apiManager.verifyBackendConnection()
// Should log: "✅ Backend connected"
```

### Test 3: Load Patient
```javascript
global.apiManager.loadPatient("Sarah Chen")
// Should return patient data
```

## 📱 Testing on Physical Spectacles

If testing on real hardware, replace `localhost` with your computer's IP:

1. Find your IP:
```bash
# Mac
ifconfig | grep inet

# Windows
ipconfig

# Shows something like: 192.168.1.100
```

2. Update in `apiIntegrationManager.js`:
```javascript
backend: 'http://192.168.1.100:3000'  // Your IP
```

3. Ensure both devices on same WiFi network

## 🎯 Benefits of Local Backend

| Aspect | Railway | Local | Winner |
|--------|---------|-------|--------|
| **Setup Speed** | Deploy first | Instant | Local ✅ |
| **Development** | Deploy each change | Auto-reload | Local ✅ |
| **Debugging** | Check logs online | Direct console | Local ✅ |
| **Cost** | Free tier limits | Free forever | Local ✅ |
| **Network** | Internet required | LAN only | Local ✅ |
| **Production** | Ready | Need deployment | Railway ✅ |

## 🔄 Switching Between Local/Production

To switch back to Railway later:
```javascript
// In apiIntegrationManager.js
backend: 'https://medsnap-api.railway.app'  // Production
```

## 🚨 Common Issues & Fixes

### "Cannot connect to backend"
→ Run `./start-local.sh` first

### "API keys not found"
→ Edit `medisnap/backend/.env` with real keys

### "CORS error"
→ Backend already has `cors()` enabled, should work

### "Demo mode activated"
→ Backend not running, start it first

## ✨ Everything is Ready!

Your local setup is complete:
- ✅ Backend runs on localhost:3000
- ✅ All scripts updated to use local backend
- ✅ API keys secure in .env file
- ✅ Easy startup with `./start-local.sh`
- ✅ Demo fallback if backend unavailable

## 📝 Next Steps

1. **Run**: `./start-local.sh`
2. **Open**: Lens Studio project
3. **Test**: Voice commands and hand tracking
4. **Deploy**: To Spectacles when ready

---

**Local development is now faster and easier! No more deployment delays! 🎉**

**Quick Commands:**
```bash
# Start everything
./start-local.sh

# Test backend
curl http://localhost:3000/health

# Stop backend
Ctrl+C
```