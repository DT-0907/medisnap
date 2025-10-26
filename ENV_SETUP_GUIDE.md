# Environment Variables Setup Guide

## ✅ Your .env File Configuration

Since you have your API keys in the .env file, the system is configured to use your backend as a proxy for all external API calls. This is more secure as the API keys never leave your server.

## 📁 .env File Location

Your .env file should be in:
```
medisnap/backend/.env
```

## 🔑 Required Environment Variables

Make sure your .env file contains all these keys:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Supabase Database (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# External API Keys (Required for Production)
GEMINI_API_KEY=your-actual-gemini-api-key
FISH_AUDIO_API_KEY=your-actual-fish-audio-api-key
LETTA_API_KEY=your-actual-letta-api-key

# Optional - Set to true for mock data
DEMO_MODE=false
```

## 🚀 How It Works

1. **Lens Studio Client** → Makes requests to your backend
2. **Your Backend** → Reads API keys from .env file
3. **Backend** → Makes external API calls with your keys
4. **Backend** → Returns responses to Lens Studio client

This architecture ensures:
- ✅ API keys are secure (never exposed to client)
- ✅ All external API calls are proxied through your backend
- ✅ Easy to update keys (just change .env file)
- ✅ Demo mode fallback if keys are missing

## 📡 Backend API Routes

Your backend needs these routes to handle external API calls:

### Already Implemented (in medisnap/backend)
- `POST /api/training/start`
- `POST /api/training/feedback`
- `POST /api/clinical/patient/load`
- `POST /api/clinical/symptom/record`
- `POST /api/clinical/decision-support`
- `POST /api/clinical/prescription/create`
- `POST /api/voice/command`
- `POST /api/tts/generate` - Uses FISH_AUDIO_API_KEY

### May Need to Add (for external API proxying)
- `POST /api/external/gemini` - Uses GEMINI_API_KEY
- `POST /api/external/letta/context` - Uses LETTA_API_KEY
- `POST /api/database/query` - Uses SUPABASE_KEY
- `GET /health` - Health check endpoint

## 🔍 Verify Your Setup

### 1. Check Backend Health
```bash
cd medisnap/backend
npm run dev

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### 2. Test API Key Loading
```bash
# In your backend directory
node -e "require('dotenv').config(); console.log('Keys loaded:', Object.keys(process.env).filter(k => k.includes('API_KEY')));"
# Should show: ['GEMINI_API_KEY', 'FISH_AUDIO_API_KEY', 'LETTA_API_KEY']
```

### 3. Deploy to Railway
```bash
# Make sure .env variables are set in Railway dashboard
railway up

# Test deployed endpoint
curl https://medsnap-api.railway.app/health
```

## 🎯 Quick Checklist

- [ ] .env file exists in `medisnap/backend/`
- [ ] All API keys are set (not placeholder values)
- [ ] Backend server runs without errors
- [ ] Health endpoint returns ok
- [ ] Railway deployment has env vars configured

## 🔒 Security Notes

1. **Never commit .env file** - It's in .gitignore
2. **Use Railway's environment variables** for production
3. **API keys stay on backend** - Never sent to client
4. **HTTPS only** in production

## 💡 Demo Mode

If any API keys are missing, the system automatically falls back to demo mode with mock data. This ensures the demo works even without all keys configured.

To force demo mode:
```bash
DEMO_MODE=true
```

## ✨ Updated API Integration

The `apiIntegrationManager.js` has been updated to:
1. Route all external API calls through your backend
2. Use the backend's .env file for API keys
3. Never expose keys to the client
4. Provide automatic demo fallbacks

## 📝 Example Backend Route for Gemini

If your backend doesn't have the proxy routes yet, here's an example:

```javascript
// routes/external.js
router.post('/api/external/gemini', async (req, res) => {
  const { prompt, temperature = 0.7, maxOutputTokens = 500 } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens }
        })
      }
    );

    const data = await response.json();
    res.json({
      text: data.candidates[0].content.parts[0].text,
      insights: data.candidates[0].content.parts[0].text
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Gemini API error' });
  }
});
```

## 🚀 Ready to Deploy!

With your .env file configured, the system will:
1. ✅ Use your real API keys from the backend
2. ✅ Keep keys secure (never exposed to client)
3. ✅ Fall back to demo mode if needed
4. ✅ Work seamlessly with Snap Spectacles

---

**Your API keys are safe and the system is configured to use them properly! 🎉**