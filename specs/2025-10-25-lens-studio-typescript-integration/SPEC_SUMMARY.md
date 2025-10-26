# Lens Studio TypeScript Integration - Specification Summary

**Document**: Executive Summary for `spec.md`
**Date**: 2025-10-25
**Status**: Ready for Implementation

---

## 📋 Quick Overview

**What**: Migrate MedSnap's Lens Studio implementation from placeholder JavaScript to production TypeScript
**Why**: Enable type-safe development, maintainable architecture, and seamless backend integration
**How**: Adapt marvin's proven TypeScript patterns + create MedSnap-specific components
**Effort**: 12-18 hours
**Blocking**: All Dev 2 Tasks (2.1-2.4)

---

## 🎯 Key Points

### This is NOT a Greenfield Project

**We Already Have**:
- ✅ **Backend**: Fully implemented Express API with passing tests
- ✅ **Frontend Placeholder**: Basic JavaScript files in `lens-studio/Public/Scripts/`
- ✅ **Reference Implementation**: Working marvin TypeScript AR system
- ✅ **Planning Docs**: Comprehensive guides in this spec folder

**We're Building**:
- 🔧 TypeScript build pipeline for Lens Studio
- 🔧 Type-safe component architecture
- 🔧 Integration layer for existing backend APIs
- 🔧 Foundation for Dev 2 clinical mode tasks

### Architecture Transformation

**FROM** (Current):
```
lens-studio/
└── Public/Scripts/
    ├── clinical/modeManager.js      # Basic implementation
    ├── ui/patientCardRenderer.js    # TODO placeholder
    └── config.js                     # Working config
```

**TO** (Target):
```
lens-studio/
├── src/                              # TypeScript source
│   ├── MedSnapARSystem.ts           # Main coordinator
│   ├── AROverlays/OverlayManager.ts # AR rendering (~90% from marvin)
│   ├── Voice/AudioPlayer.ts         # TTS playback (new)
│   ├── State/StateManager.ts        # App state (new)
│   ├── Network/APIClient.ts         # Backend integration (new)
│   └── Clinical/                    # Dev 2 tasks 2.2-2.4
├── dist/lens-studio-entry.js        # Build output
└── tsconfig.json                     # TypeScript config
```

---

## 📊 Marvin Reuse Matrix

| Component | Marvin Equivalent | Reuse % | Strategy |
|-----------|-------------------|---------|----------|
| **lens-studio-entry.ts** | ✓ Exact pattern | 95% | Change @inputs only |
| **OverlayManager** | ✓ AR overlays | 90% | Adapt colors/layouts |
| **MedSnapARSystem** | ✓ MarvinARSystem | 70% | Remove CV, add Voice/API |
| **lens-studio.d.ts** | ✓ Type definitions | 80% | Add Audio/Text types |
| **tsconfig.json** | ✓ Build config | 95% | Update paths |
| **AudioPlayer** | ✗ None | 0% | Create from scratch |
| **StateManager** | ✗ None | 0% | Create from scratch |
| **APIClient** | ✗ None | 0% | Create from scratch |

**Key Insight**: Reuse infrastructure, create domain logic

---

## 🔧 Implementation Phases

### Phase 1: Build System (2h)
- package.json, tsconfig.json
- `npm run build` succeeds

### Phase 2: Type Definitions (2h)
- lens-studio.d.ts (from marvin + Audio/Text extensions)
- core.ts (MedSnap domain types)

### Phase 3: AR System Core (4h)
- MedSnapARSystem.ts (main coordinator)
- lens-studio-entry.ts (with @input annotations)

### Phase 4: Components (6h)
- OverlayManager (2h) - from marvin
- VoiceController (1h) - placeholder
- AudioPlayer (1h) - new
- StateManager (1h) - new
- ModeManager (1h) - extend existing

### Phase 5: Network Client (2h)
- APIClient.ts - wraps backend endpoints

### Phase 6: Lens Studio Integration (2h)
- Import built JS
- Wire components
- Test in simulator

**Total**: 18 hours

---

## ✅ Success Criteria (All Must Pass)

**Build & Types**:
- [ ] `npm run build` succeeds without errors
- [ ] `npm run type-check` passes
- [ ] @input annotations preserved in output

**Integration**:
- [ ] System initializes in Lens Studio simulator
- [ ] All @input components wire correctly in Inspector
- [ ] Update loop runs at ≥30 FPS

**Functionality**:
- [ ] Can make HTTP request to backend
- [ ] Can play TTS audio
- [ ] System disposes cleanly on scene reload

**Developer Readiness**:
- [ ] Can start Dev 2 Task 2.1 (Mode Manager) immediately

---

## 🔌 Integration Points

### With Existing Backend (IMPLEMENTED)
```typescript
apiClient.loadPatient()       → POST /api/clinical/patient/load
apiClient.recordSymptom()     → POST /api/clinical/symptom/record
apiClient.createPrescription() → POST /api/clinical/prescription/create
apiClient.generateTTS()        → POST /api/tts/generate
```

### With Existing Config (config.js)
```typescript
// Legacy JS continues using global.MedSnapConfig
// New TypeScript uses typed MedSnapConfig interface
function loadConfig(): MedSnapConfig {
  const legacy = (global as any).MedSnapConfig;
  return {
    backendUrl: legacy.API_BASE_URL,
    timeouts: {
      clinicalModeInactivity: legacy.TIMEOUTS.CLINICAL_AUTO_EXIT,
      ...
    },
    ...
  };
}
```

### With Marvin Reference
- Copy infrastructure patterns (lifecycle, events, overlays)
- Adapt for clinical domain (patient cards, prescriptions)
- Create voice/audio/state components from scratch

---

## 🚀 What Happens After

Once this spec is complete:

1. **Task 2.1**: Mode Manager (extend `ModeManager.ts`)
2. **Task 2.2**: Patient Card Renderer (use `OverlayManager`)
3. **Task 2.3**: Clinical Mode State Machine (use `StateManager`)
4. **Task 2.4**: Prescription UI (use `OverlayManager` + `AudioPlayer`)

All with **full TypeScript type safety** and **proven patterns from marvin**.

---

## 📚 Documentation Structure

**This Spec Folder** (`/Users/jasonyi/snaplens-code/specs/2025-10-25-lens-studio-typescript-integration/`):

1. **README.md** - Overview and context
2. **spec.md** - Formal specification (this is the authoritative document)
3. **SPEC_SUMMARY.md** - This file (quick reference)
4. **implementation-guide.md** - Step-by-step instructions
5. **marvin-to-medsnap-mapping.md** - Pattern mapping reference
6. **test-plan.md** - TDD workflow and tests
7. **CHECKLIST.md** - Progress tracking

**Read Order**:
1. Start: SPEC_SUMMARY.md (you are here)
2. Details: spec.md (full specification)
3. Implement: implementation-guide.md + CHECKLIST.md
4. Reference: marvin-to-medsnap-mapping.md, test-plan.md

---

## ⚠️ Critical Requirements

### TDD (Test-Driven Development)
**MANDATORY workflow** per CLAUDE.md:
```
1. Write tests FIRST
2. Run tests → FAIL (red)
3. Commit tests
4. Implement code
5. Run tests → PASS (green)
6. Commit code
```

### KISS (Keep It Simple, Stupid)
- Use simplest patterns from marvin that work
- No over-engineering
- No complex abstractions

### YAGNI (You Aren't Gonna Need It)
- Only build what's in the spec
- No "future-proofing"
- No features beyond Dev 2 Task scope

---

## 🎓 Key Learnings for Implementation

### What to Copy Exactly from Marvin
- Scene lifecycle pattern (OnStart, UpdateEvent, OnDestroy)
- @input annotation pattern
- Error handling with try-catch
- Billboard overlay logic
- Performance monitoring throttle

### What to Adapt from Marvin
- OverlayManager: Change colors to AR_COLORS (cyan, yellow, red, green)
- MedSnapARSystem: Remove CV components, add Voice/State/API
- Type definitions: Add Audio, Text, Animation types

### What to Create from Scratch
- VoiceController (ASR wrapper)
- AudioPlayer (TTS playback)
- StateManager (mode + patient state)
- ModeManager (extends existing JS)
- APIClient (backend HTTP client)
- All Clinical/ components (Dev 2 tasks)

---

## 📍 File Locations

**Existing Code**:
- Backend: `/Users/jasonyi/snaplens-code/backend/` ✅ WORKING
- Frontend: `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/` ⚠️ PLACEHOLDER
- Reference: `/Users/jasonyi/snaplens-code/marvin/ar-core/` ✅ WORKING

**New Code** (to create):
- Source: `/Users/jasonyi/snaplens-code/lens-studio/src/`
- Build output: `/Users/jasonyi/snaplens-code/lens-studio/dist/`
- Tests: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/`

---

## 🎯 Next Action

**Ready to implement?**

1. Read full spec: `spec.md`
2. Follow guide: `implementation-guide.md`
3. Track progress: `CHECKLIST.md`
4. Reference patterns: `marvin-to-medsnap-mapping.md`
5. Write tests first: `test-plan.md`

**Start with**:
```bash
cd /Users/jasonyi/snaplens-code/lens-studio
# Create package.json (Phase 1)
# See implementation-guide.md for exact contents
```

---

**Questions?** Refer to `spec.md` Section 6 (Integration Points) or Section 7 (Risks & Mitigations)

**Blockers?** All infrastructure is in place - backend working, marvin reference available, planning complete

**Ready?** Let's build! 🚀
