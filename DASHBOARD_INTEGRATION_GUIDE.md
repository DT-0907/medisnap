# MedSnap Dashboard Integration Guide

**Date**: October 26, 2025
**Source**: https://github.com/DT-0907/medisnap/tree/delbert (frontend2 directory)
**Destination**: `/medsnap-dashboard/`

---

## What Was Pulled In

The **complete frontend dashboard** from Delbert's medisnap repository has been successfully integrated into this project. This includes:

### Directory Structure
```
medsnap-dashboard/
├── app/                          # Next.js App Router pages
│   ├── about/                   # About page
│   ├── api/                     # API routes (email services)
│   ├── ar-medical-dashboard/    # Main dashboard application
│   ├── contact/                 # Contact page
│   ├── login/                   # Login interface
│   ├── policy/                  # Privacy policy
│   ├── products/                # Products page
│   ├── trial/                   # Trial signup
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # React components
│   ├── ui/                      # 75+ Radix UI components
│   ├── osiris-website.tsx       # Marketing landing page
│   ├── patient-details.tsx      # Patient info display
│   ├── patient-search.tsx       # Advanced search
│   ├── simple-patient-search.tsx # Simplified search
│   ├── voice-agent-button.tsx   # Voice control UI
│   └── theme-provider.tsx       # Theme system
│
├── lib/                         # Utilities and data
│   ├── patients-data.ts         # 100 mock patient records
│   └── utils.ts                 # Helper functions
│
├── public/                      # Static assets
├── hooks/                       # Custom React hooks
├── styles/                      # Additional stylesheets
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
└── next.config.mjs             # Next.js config
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd medsnap-dashboard
pnpm install
# or
npm install
```

### 2. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at:
- **Landing Page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/ar-medical-dashboard

### 3. Build for Production

```bash
pnpm build
pnpm start
```

---

## Key Features

### 1. AR Medical Dashboard (`/ar-medical-dashboard`)

**Features**:
- 🔍 **Patient Search**: Advanced search with command palette (Cmd/Ctrl+K)
- 👤 **Patient Details**: Comprehensive medical information display
- 📊 **Vital Signs**: Real-time vital signs monitoring
- 🤖 **AI Diagnosis**: AI-generated diagnostic summaries
- 💊 **Medication Tracking**: Current medications and allergies
- 📋 **Medical History**: Historical diagnoses and treatments
- 🎤 **Voice Agent** (UI only): Voice control button for future integration

**Mock Database**:
- 100 procedurally generated patient records
- Realistic medical data (symptoms, medications, vital signs)
- Located in: `lib/patients-data.ts`

### 2. Marketing Website (Landing Page)

**Features**:
- 🎨 Animated hero section with neural pathways effect
- ⚡ TypeWriter effect with rotating taglines
- 🌊 Fluid dock navigation
- 📜 Scroll-based text reveal animations
- 🎭 Glassmorphism design throughout

### 3. Additional Pages

- `/about` - About page
- `/contact` - Contact form
- `/login` - Login interface
- `/products` - Products showcase
- `/trial` - Trial signup
- `/policy` - Privacy policy

---

## Technology Stack

### Core Framework
- **Next.js 14.2.5** (App Router)
- **React 18** + TypeScript
- **Node.js 20+**

### UI & Styling
- **Tailwind CSS 3.4.1**
- **Radix UI** components (Avatar, Dialog, Popover, etc.)
- **Lucide React** icons
- **class-variance-authority** for variants

### Animation
- **Framer Motion 11.0.8** - Advanced animations
- **GSAP 3.12.5** - Timeline animations
- **@splinetool/react-spline** - 3D graphics

### State Management
- React useState/useEffect hooks
- No global state management (Redux, Zustand, etc.)

### Search
- **cmdk 1.1.1** - Command palette for patient search

---

## Integration with Main Project

### Current Status

The dashboard is **standalone** and operates independently. To integrate with the main MedSnap project:

### Step 1: Backend Connection

Replace mock data with real API calls:

**Current** (`lib/patients-data.ts`):
```typescript
export const patientsDatabase: Patient[] = Array.from({ length: 100 }, ...);
```

**Target** (connect to backend):
```typescript
// Create new file: lib/api-client.ts
export async function fetchPatients() {
  const response = await fetch('http://localhost:3000/api/clinical/patients');
  return response.json();
}

export async function fetchPatient(id: string) {
  const response = await fetch(`http://localhost:3000/api/clinical/patient/${id}`);
  return response.json();
}
```

**Update** `app/ar-medical-dashboard/page.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { fetchPatients } from '@/lib/api-client'

export default function DashboardPage() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    fetchPatients().then(setPatients)
  }, [])

  // Rest of component...
}
```

### Step 2: Voice Agent Integration

Connect voice button to Snap ASR or Web Speech API:

**Current** (`components/voice-agent-button.tsx`):
```typescript
onClick={() => {
  setIsActive(!isActive)
  console.log('Voice agent toggled:', !isActive)
}}
```

**Target**:
```typescript
onClick={() => {
  if (!isActive) {
    startVoiceRecognition()
  } else {
    stopVoiceRecognition()
  }
  setIsActive(!isActive)
}}
```

### Step 3: AI Integration

Replace mock AI summaries with real Gemini API calls:

**Current** (`components/patient-details.tsx`):
```typescript
const aiSummary = `Based on the patient's chief complaint of ${patient.chiefComplaint}...`
```

**Target**:
```typescript
const [aiSummary, setAiSummary] = useState('')

useEffect(() => {
  fetch('/api/clinical/ai-summary', {
    method: 'POST',
    body: JSON.stringify({ patientId: patient.id })
  })
  .then(res => res.json())
  .then(data => setAiSummary(data.summary))
}, [patient.id])
```

### Step 4: Authentication

Add authentication to protect routes:

1. Install auth library: `pnpm add next-auth`
2. Create `/app/api/auth/[...nextauth]/route.ts`
3. Wrap dashboard with auth check
4. Redirect to `/login` if not authenticated

---

## Environment Variables

Create `.env.local` in `medsnap-dashboard/`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Backend endpoints
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Email (Resend API)
RESEND_API_KEY=your_resend_api_key

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE=false
NEXT_PUBLIC_ENABLE_AI=false
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## Development Workflow

### 1. Start Development Server

```bash
cd medsnap-dashboard
pnpm dev
```

### 2. Make Changes

Edit files in:
- `app/` for pages
- `components/` for UI components
- `lib/` for utilities and data

### 3. View Changes

Hot reload is automatic. Open http://localhost:3000

### 4. Test Patient Search

1. Navigate to `/ar-medical-dashboard`
2. Click search box or press Cmd/Ctrl+K
3. Search by:
   - Patient name (e.g., "Sarah")
   - Patient ID (e.g., "PT00001")
   - Chief complaint (e.g., "Chest pain")

### 5. Test AI Diagnosis

1. Select a patient
2. Click "AI Diagnosis" button
3. View generated summary

---

## Customization Guide

### Change Color Scheme

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#your-color',
        // Add more shades
      }
    }
  }
}
```

Replace yellow (#FFEB3B) references throughout:
- `app/globals.css`
- Component files with `bg-yellow-*`, `text-yellow-*`

### Add New Patient Fields

1. Update interface in `lib/patients-data.ts`:
```typescript
export interface Patient {
  // ... existing fields
  bloodType?: string
  insurance?: string
}
```

2. Update mock generator
3. Update `PatientDetails` component to display new fields

### Modify Dashboard Layout

Edit `app/ar-medical-dashboard/page.tsx`:
- Add new sections
- Reorder components
- Change grid layout

---

## File Locations Reference

### Key Components
- **Dashboard Page**: `app/ar-medical-dashboard/page.tsx`
- **Patient Details**: `components/patient-details.tsx`
- **Patient Search**: `components/simple-patient-search.tsx`
- **Voice Button**: `components/voice-agent-button.tsx`
- **Landing Page**: `components/osiris-website.tsx`

### Data & Logic
- **Patient Data**: `lib/patients-data.ts`
- **Utilities**: `lib/utils.ts`

### Styling
- **Global CSS**: `app/globals.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Custom Styles**: `styles/`

### Configuration
- **Next.js**: `next.config.mjs`
- **TypeScript**: `tsconfig.json`
- **ESLint**: `.eslintrc.json` (if present)

---

## Common Tasks

### Add a New Page

1. Create directory in `app/`: `app/my-page/`
2. Create `page.tsx`:
```typescript
export default function MyPage() {
  return <div>My Page</div>
}
```
3. Access at: `http://localhost:3000/my-page`

### Add a New Component

1. Create file in `components/`: `components/my-component.tsx`
2. Export component:
```typescript
export function MyComponent({ prop }: { prop: string }) {
  return <div>{prop}</div>
}
```
3. Import in pages: `import { MyComponent } from '@/components/my-component'`

### Add New UI Component (Radix UI)

Using shadcn/ui CLI:
```bash
pnpm dlx shadcn-ui@latest add button
# or
npx shadcn-ui@latest add dialog
```

Components will be added to `components/ui/`

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
pnpm dev -- -p 3001
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

### TypeScript Errors

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Fix common issues
# 1. Add missing type definitions
# 2. Update tsconfig.json
# 3. Add @ts-ignore for temporary fixes
```

### Styling Issues

```bash
# Rebuild Tailwind CSS
pnpm build

# Check for conflicting styles
# - Inspect element in browser
# - Check global.css
# - Verify Tailwind config
```

---

## Performance Optimization

### 1. Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image'

<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### 2. Code Splitting

Use dynamic imports for heavy components:
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy-component'))
```

### 3. Reduce Bundle Size

Analyze bundle:
```bash
pnpm build
# Check .next/analyze/ for bundle report
```

### 4. Optimize Animations

- Use `will-change` CSS property
- Prefer `transform` over `position`
- Use `useReducedMotion` hook for accessibility

---

## Next Steps

### Immediate Actions

1. ✅ **Dashboard is integrated** - Ready to use
2. 🔄 **Install dependencies** - Run `pnpm install`
3. 🚀 **Start dev server** - Run `pnpm dev`
4. 🔍 **Test features** - Explore dashboard and search

### Short-term Integration

1. **Connect Backend API**:
   - Replace mock data with API calls
   - Add error handling
   - Implement loading states

2. **Add Authentication**:
   - Install next-auth
   - Protect dashboard routes
   - Add user session management

3. **Voice Integration**:
   - Connect voice button to Web Speech API
   - Test voice commands
   - Add voice feedback

### Long-term Development

1. **AR Integration**:
   - Connect to Snap Spectacles
   - Add hand tracking
   - Implement AR overlays

2. **AI Enhancement**:
   - Integrate Gemini API
   - Add Letta context management
   - Implement real-time analysis

3. **Production Deployment**:
   - Set up CI/CD
   - Configure environment variables
   - Deploy to Vercel/Railway

---

## Additional Resources

### Documentation
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Framer Motion**: https://www.framer.com/motion/

### Component Library
- **shadcn/ui**: https://ui.shadcn.com/
- **Lucide Icons**: https://lucide.dev/

### Main Project Docs
- See `CLAUDE.md` for main project guidelines
- See `DELBERT_REPO_ANALYSIS.md` for detailed analysis

---

## Support

For questions or issues:
- Check `DELBERT_REPO_ANALYSIS.md` for detailed component docs
- Review main project `CLAUDE.md` for development guidelines
- Inspect component files for inline documentation

---

**Integration Status**: ✅ Complete
**Ready for Development**: ✅ Yes
**Next Action**: Install dependencies and start dev server
