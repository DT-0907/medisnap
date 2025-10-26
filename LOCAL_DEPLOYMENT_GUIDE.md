# 🏠 Local Backend Deployment Guide

## Overview
Running the backend locally instead of Railway provides faster development, easier debugging, and no deployment delays. This guide shows how to set up and run MedSnap with a local backend.

## 🚀 Quick Start

### 1. Set Up Environment Variables
```bash
cd medisnap/backend

# Copy the example env file
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

### 2. Install Dependencies
```bash
# In medisnap/backend directory
npm install
```

### 3. Start the Backend Server
```bash
# Development mode with hot reload
npm run dev

# OR production mode
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ API keys loaded from .env
```

### 4. Verify Backend is Running
```bash
# In a new terminal
curl http://localhost:3000/health

# Should return:
{"status":"ok","mode":"local","timestamp":"..."}
```

## 📝 Configuration Changes Made

### 1. API Endpoint Updated
In `lens-studio/MedSnap.lsproj/Assets/Scripts/apiIntegrationManager.js`:
```javascript
// Changed from:
backend: 'https://medsnap-api.railway.app'

// To:
backend: 'http://localhost:3000'
```

### 2. CORS Already Configured
The backend already has CORS enabled in `medisnap/backend/src/app.ts`:
```javascript
app.use(cors());  // Allows requests from any origin during development
```

## 🔧 Local Development Setup

### Backend Terminal (Terminal 1)
```bash
cd medisnap/backend
npm run dev

# Watch for:
# - Server running on port 3000
# - Database connection successful
# - API keys loaded
```

### Database Setup (One-time)
```bash
# If using local PostgreSQL
psql -c "CREATE DATABASE medsnap_dev;"

# Load schema
psql medsnap_dev < db/schema.sql

# Load seed data
psql medsnap_dev < db/seed.sql

# OR use Supabase cloud database with connection string in .env
```

### Lens Studio (Terminal 2)
1. Open Lens Studio
2. Load `lens-studio/MedSnap.lsproj`
3. Preview will now connect to `http://localhost:3000`

## 🌐 Network Configuration

### For Testing on Physical Device
If testing on actual Snap Spectacles:

1. **Find your local IP address:**
```bash
# Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4

# Linux
hostname -I
```

2. **Update the backend endpoint:**
```javascript
// In apiIntegrationManager.js, replace localhost with your IP
backend: 'http://192.168.1.XXX:3000'  // Your actual IP
```

3. **Ensure firewall allows port 3000:**
```bash
# Mac
sudo pfctl -d  # Temporarily disable firewall (re-enable after testing!)

# Windows
# Add firewall rule for port 3000 in Windows Defender Firewall

# Linux
sudo ufw allow 3000
```

## 📊 API Routes Available Locally

### Health Check
```bash
GET http://localhost:3000/health
```

### Training Mode
```bash
POST http://localhost:3000/api/training/start
POST http://localhost:3000/api/training/feedback
```

### Clinical Mode
```bash
POST http://localhost:3000/api/clinical/patient/load
POST http://localhost:3000/api/clinical/symptom/record
POST http://localhost:3000/api/clinical/decision-support
POST http://localhost:3000/api/clinical/prescription/create
```

### Voice & TTS
```bash
POST http://localhost:3000/api/voice/command
POST http://localhost:3000/api/tts/generate
```

### External API Proxies (if implemented)
```bash
POST http://localhost:3000/api/external/gemini
POST http://localhost:3000/api/external/letta/context
POST http://localhost:3000/api/database/query
```

## 🧪 Testing the Integration

### 1. Test Backend Connection
```javascript
// In Lens Studio console
global.apiManager.verifyBackendConnection()
// Should log: "✅ Backend connected - API keys available"
```

### 2. Test Patient Loading
```javascript
global.apiManager.loadPatient("Sarah Chen")
// Should return patient data with medications
```

### 3. Test TTS Generation
```javascript
global.apiManager.generateTTS("Hello from MedSnap")
// Should return audio URL
```

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
1. Check backend is running: `curl http://localhost:3000/health`
2. Check no firewall blocking port 3000
3. Verify CORS is enabled in backend

### Issue: "API keys not found"
**Solution:**
1. Check .env file exists in `medisnap/backend/`
2. Verify all keys are set (not placeholders)
3. Restart backend after changing .env

### Issue: "Network error from Spectacles"
**Solution:**
1. Use computer's IP address instead of localhost
2. Ensure both devices on same network
3. Check firewall allows incoming connections

### Issue: "Demo mode activated unexpectedly"
**Solution:**
1. Backend health check failed - verify it's running
2. Check console for specific error messages
3. Ensure backend URL is correct in apiIntegrationManager.js

## 📁 File Structure for Local Development

```
medisnap/
├── backend/
│   ├── .env                 ← Your API keys here
│   ├── src/
│   │   ├── app.ts           ← CORS configured
│   │   ├── routes/          ← API endpoints
│   │   └── services/        ← External API handlers
│   └── package.json
│
└── lens-studio/
    └── MedSnap.lsproj/
        └── Assets/Scripts/
            └── apiIntegrationManager.js  ← Points to localhost:3000
```

## 🚦 Development Workflow

1. **Start Backend First**
   ```bash
   cd medisnap/backend
   npm run dev
   ```

2. **Open Lens Studio**
   - Load MedSnap.lsproj
   - Preview mode will auto-connect to local backend

3. **Make Changes**
   - Backend changes: Auto-reload with nodemon
   - Lens Studio changes: Refresh preview

4. **Test on Device**
   - Update IP address in apiIntegrationManager.js
   - Build and deploy to Spectacles
   - Ensure device on same network

## 🔒 Security Considerations for Local Dev

1. **API Keys**: Still secure in .env file
2. **Network**: Only accessible on local network
3. **CORS**: Configured to allow any origin (dev only)
4. **Production**: Switch back to Railway URL for deployment

## 🎯 Benefits of Local Deployment

✅ **Faster Development**: No deployment wait times
✅ **Better Debugging**: Direct access to logs
✅ **Cost Effective**: No hosting costs during development
✅ **Offline Capable**: Works without internet (except external APIs)
✅ **Full Control**: Easy to modify and test

## 📝 Switching Between Local and Production

To switch between local and production backends:

```javascript
// In apiIntegrationManager.js

// For local development:
backend: 'http://localhost:3000'

// For production:
backend: 'https://medsnap-api.railway.app'

// Or use environment detection:
backend: window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://medsnap-api.railway.app'
```

## ✨ Demo Mode

If the backend is not running or unreachable, the system automatically falls back to demo mode with mock data, ensuring the demo always works.

## 🚀 Ready for Local Development!

Your local setup is now complete:
- ✅ Backend points to localhost:3000
- ✅ CORS enabled for cross-origin requests
- ✅ API keys secure in .env file
- ✅ Demo fallback if backend unavailable
- ✅ Easy switching between local/production

**Start developing locally with instant feedback! 🎉**

---

## Quick Commands Reference

```bash
# Start backend
cd medisnap/backend && npm run dev

# Test health
curl http://localhost:3000/health

# View logs
tail -f medisnap/backend/logs/app.log

# Test specific endpoint
curl -X POST http://localhost:3000/api/clinical/patient/load \
  -H "Content-Type: application/json" \
  -d '{"patient_name":"Sarah Chen"}'
```