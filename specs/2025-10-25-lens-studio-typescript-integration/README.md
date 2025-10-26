# Lens Studio TypeScript Integration Spec

**Status**: Draft
**Created**: 2025-10-25
**Owner**: Dev 2
**Estimated Effort**: 12-18 hours
**Priority**: Critical (Blocking all Dev 2 tasks)

## Overview

Implement a complete TypeScript-based architecture for MedSnap's Lens Studio integration, based on marvin's proven reference implementation. This is critical infrastructure work as our current implementation consists only of placeholder JavaScript files with TODO comments, while marvin has a fully functional TypeScript AR system running on Snap Spectacles.

## Problem Statement

### Current State
- Only placeholder JavaScript files in `lens-studio/` with TODO comments
- No TypeScript build system for Lens Studio integration
- No proper component wiring pattern
- Missing AR overlay system, voice/audio integration, and state management
- Cannot implement Dev 2 tasks (clinical mode, patient cards, prescription UI) without this foundation

### Reference Implementation
Marvin repository demonstrates a complete TypeScript-based AR system with:
- Full TypeScript architecture with proper build tooling
- `MarvinARSystem` central coordinator with lifecycle management
- `@input` annotations for Lens Studio component wiring
- Scene lifecycle event handling (OnStart, OnDestroy, UpdateEvent)
- Modular component architecture (OverlayManager, GestureHandler, ObjectTracker)
- Proper type definitions for Lens Studio API
- Successful deployment to Snap Spectacles

## Success Criteria

### Core Infrastructure (Hours 1-6)
- [ ] TypeScript build system configured (tsconfig.json, package.json)
- [ ] Lens Studio type definitions in place (`types/lens-studio.d.ts`)
- [ ] Build pipeline produces JavaScript consumable by Lens Studio
- [ ] Hot reload during development with `npm run dev`

### MedSnap AR System (Hours 6-12)
- [ ] `MedSnapARSystem` main coordinator implemented
- [ ] Component initialization with `@input` annotations working
- [ ] Scene lifecycle events wired (OnStart, OnDestroy, UpdateEvent)
- [ ] System can be imported into Lens Studio and initialized

### Component Integration (Hours 12-18)
- [ ] AR Overlay Manager for patient cards and UI elements
- [ ] Voice/Audio Controller for TTS playback and ASR
- [ ] State Manager for clinical/training mode states
- [ ] HTTP client for backend API calls
- [ ] Mode Manager integrated with AR system

### Validation
- [ ] Build succeeds without errors
- [ ] TypeScript types enforce API contracts
- [ ] System initializes in Lens Studio simulator
- [ ] All `@input` components wire correctly in Inspector
- [ ] Console logs confirm lifecycle events firing
- [ ] Ready to implement Dev 2 Task 2.1 (Mode Manager)

## Architecture

### Directory Structure
```
medsnap/
├── lens-studio/
│   ├── src/                          # TypeScript source (NEW)
│   │   ├── MedSnapARSystem.ts       # Main system coordinator
│   │   ├── lens-studio-entry.ts     # Lens Studio entry point
│   │   ├── types/
│   │   │   ├── lens-studio.d.ts     # Lens Studio API types
│   │   │   └── core.ts              # MedSnap core types
│   │   ├── AROverlays/
│   │   │   └── OverlayManager.ts    # AR overlay rendering
│   │   ├── Voice/
│   │   │   ├── VoiceController.ts   # ASR integration
│   │   │   └── AudioPlayer.ts       # TTS playback
│   │   ├── State/
│   │   │   ├── StateManager.ts      # Application state
│   │   │   └── ModeManager.ts       # Mode switching (Dev 2 Task 2.1)
│   │   ├── Clinical/
│   │   │   ├── PatientCardRenderer.ts    # Dev 2 Task 2.2
│   │   │   ├── ClinicalModeStateMachine.ts # Dev 2 Task 2.3
│   │   │   └── PrescriptionUI.ts         # Dev 2 Task 2.4
│   │   └── Network/
│   │       └── APIClient.ts         # Backend HTTP client
│   ├── dist/                         # Compiled JavaScript (NEW)
│   │   ├── lens-studio-entry.js     # Import this in Lens Studio
│   │   └── *.d.ts                   # Type declaration files
│   ├── tsconfig.json                 # TypeScript config (NEW)
│   ├── package.json                  # Build scripts (NEW)
│   └── MedSnap.lsproj/              # Lens Studio project (existing)
│       └── Cache/...
```

### Component Hierarchy
```
MedSnapARSystem (main coordinator)
├── OverlayManager (AR rendering)
│   ├── PatientCardRenderer (Dev 2 Task 2.2)
│   └── PrescriptionUI (Dev 2 Task 2.4)
├── VoiceController (ASR + wake word)
│   └── AudioPlayer (TTS playback)
├── StateManager (app state)
│   ├── ModeManager (Dev 2 Task 2.1)
│   └── ClinicalModeStateMachine (Dev 2 Task 2.3)
├── APIClient (backend calls)
└── DeviceTracking (Lens Studio component)
```

## Implementation Plan

### Phase 1: Build System Setup (2 hours)

**Files to Create:**
1. `lens-studio/package.json` - Build scripts and dependencies
2. `lens-studio/tsconfig.json` - TypeScript compiler config
3. `lens-studio/.gitignore` - Ignore dist/ and node_modules/

**Key Configuration:**
- Target: ES2020 (Lens Studio JavaScript engine)
- Module: CommonJS (Lens Studio compatibility)
- Enable decorators for `@input` annotations
- Source maps for debugging
- Declaration files for type checking

**Validation:**
```bash
cd lens-studio
npm install
npm run build  # Should succeed
npm run dev    # Should watch for changes
```

### Phase 2: Type Definitions (2 hours)

**Files to Create:**
1. `lens-studio/src/types/lens-studio.d.ts` - Lens Studio API types
   - Copy from marvin reference, adapt for MedSnap needs
   - Core types: vec3, quat, mat4, vec4, vec2
   - Components: Script, SceneObject, Text, AudioComponent
   - Events: UpdateEvent, SceneEvent, TapEvent
   - Networking: RemoteServiceModule, Request, Response
   - Audio: AudioComponent, AsrModule

2. `lens-studio/src/types/core.ts` - MedSnap core types
   - PatientData interface
   - ClinicalState enum
   - PrescriptionData interface
   - VoiceCommand interface
   - AROverlayConfig interface

**Validation:**
- TypeScript compiler accepts type definitions
- No circular dependencies
- All Lens Studio API types covered for Dev 2 needs

### Phase 3: AR System Core (4 hours)

**Files to Create:**
1. `lens-studio/src/MedSnapARSystem.ts` - Main coordinator
   - Pattern: Follow marvin's `MarvinARSystem.ts` structure
   - Initialize all subsystems
   - Manage lifecycle (initialize, start, stop, dispose)
   - Setup update loop
   - Performance monitoring

2. `lens-studio/src/lens-studio-entry.ts` - Entry point
   - Pattern: Follow marvin's `lens-studio-entry.ts`
   - Declare `@input` components for Inspector wiring
   - Create MedSnapARSystem instance
   - Bind to SceneEvent.OnStart
   - Bind to SceneEvent.OnDestroy
   - Export global debug API

**Key Patterns from Marvin:**
```typescript
// @input declarations at top of file
// @input SceneObject sceneRoot
// @input Component.RemoteServiceModule remoteService
// @input Component.AudioComponent audioComponent

// Scene load initialization
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  initializeSystem();
});

// Update loop
const updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(() => {
  arSystem.update();
});

// Cleanup
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  arSystem.dispose();
});
```

**Validation:**
- Build produces `lens-studio-entry.js`
- File can be imported into Lens Studio
- `@input` fields appear in Inspector
- System initializes without errors

### Phase 4: Component Implementations (6 hours)

#### 4.1 Overlay Manager (2 hours)
**File**: `lens-studio/src/AROverlays/OverlayManager.ts`
- Pattern: Based on marvin's `OverlayManager.ts`
- Create/destroy text overlays
- Position overlays in 3D space (top 1/3 of screen for patient cards)
- Billboard effect (face camera)
- Fade in/out animations
- Color management (cyan, yellow, red, green per FR AR-1)

#### 4.2 Voice/Audio System (2 hours)
**Files**:
- `lens-studio/src/Voice/VoiceController.ts` - ASR integration
- `lens-studio/src/Voice/AudioPlayer.ts` - TTS playback

**VoiceController responsibilities:**
- Initialize Snap ASR module
- Wake word detection ("Hey MedSnap")
- Transcription callbacks
- Route commands to StateManager

**AudioPlayer responsibilities:**
- Initialize AudioComponent
- Load audio tracks from backend TTS URLs
- Play/stop control
- Queue management for multiple TTS responses

#### 4.3 State Management (2 hours)
**Files**:
- `lens-studio/src/State/StateManager.ts` - Global app state
- `lens-studio/src/State/ModeManager.ts` - Mode switching (Dev 2 Task 2.1 foundation)

**StateManager responsibilities:**
- Current mode (IDLE, TRAINING, CLINICAL)
- Current patient data (if in clinical mode)
- Session context
- Event emitter for state changes

**ModeManager responsibilities:**
- Switch between modes
- Validate mode transitions
- Exit cleanup
- Integration point for Dev 2 Task 2.1

### Phase 5: Network Client (2 hours)

**File**: `lens-studio/src/Network/APIClient.ts`

**Responsibilities:**
- HTTP request wrapper around RemoteServiceModule
- Endpoint configuration (from Resources/config.json)
- Request/response serialization
- Error handling with retry logic
- Response caching for TTS

**Key Endpoints for Dev 2:**
```typescript
class APIClient {
  async loadPatient(patientName: string): Promise<PatientData>
  async recordSymptom(symptom: string): Promise<void>
  async createPrescription(med: string, dose: string): Promise<PrescriptionResponse>
  async generateTTS(text: string): Promise<AudioTrack>
  async extractIntent(transcription: string): Promise<VoiceCommand>
}
```

**Validation:**
- Can make HTTP POST requests
- JSON serialization works
- Error responses handled gracefully
- Integration with backend API endpoints

### Phase 6: Lens Studio Integration (2 hours)

**Steps:**
1. Build TypeScript to JavaScript: `npm run build`
2. Import `dist/lens-studio-entry.js` into Lens Studio project
3. Create scene objects for components:
   - `MedSnapSystem` (Script component with lens-studio-entry.js)
   - `SceneRoot` (parent for all AR elements)
   - `RemoteService` (RemoteServiceModule component)
   - `AudioPlayer` (AudioComponent for TTS)
4. Wire `@input` fields in Inspector:
   - Drag scene objects to corresponding input slots
5. Add config.json to Resources with backend URL
6. Test in simulator

**Validation Checklist:**
- [ ] Script imports without errors
- [ ] All `@input` fields appear in Inspector
- [ ] Can wire all required components
- [ ] Scene loads without errors
- [ ] Console shows initialization logs
- [ ] Update loop fires (check via debug logs)
- [ ] System disposes on scene unload

## Integration Points

### With Dev 1 (Training Mode)
- Dev 1 responsible for training mode AR overlays (pulse point circles, arrows)
- Dev 2 provides MedSnapARSystem infrastructure
- Share OverlayManager for rendering
- Dev 1 uses StateManager for mode switching

### With Dev 3 (Backend API)
- APIClient calls Dev 3's Express endpoints
- `/api/clinical/patient/load` - Load patient data
- `/api/clinical/symptom/record` - Record symptoms
- `/api/clinical/prescription/create` - Create prescription
- `/api/tts/generate` - Generate TTS audio
- `/api/voice/command` - Extract intent from transcription

### With Dev 4 (CV Pipeline)
- MedSnapARSystem initializes CV components (if needed for clinical mode)
- Hand tracking for gesture navigation (future)
- OCR for vital signs (future)

## Dependencies

### NPM Packages (lens-studio/package.json)
```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean"
  }
}
```

### Lens Studio Components Required
- `Component.RemoteServiceModule` - HTTP requests
- `Component.AudioComponent` - TTS playback
- `Component.AsrModule` - Voice recognition (optional, may use backend)
- `Component.Text` - AR text rendering
- `Component.ScreenTransform` - UI positioning
- `Component.DeviceTracking` - Camera position/rotation

## File Reference

### Marvin Reference Files (read-only, for patterns)
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/main.ts` - System coordinator pattern
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/lens-studio-entry.ts` - Entry point pattern
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/lens-studio.d.ts` - Type definitions
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/core.ts` - Core type patterns
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/AROverlays/OverlayManager.ts` - Overlay pattern
- `/Users/jasonyi/snaplens-code/marvin/ar-core/tsconfig.json` - Build config
- `/Users/jasonyi/snaplens-code/marvin/ar-core/package.json` - Scripts

### MedSnap Files to Create
All in `/Users/jasonyi/snaplens-code/lens-studio/`:
- `package.json`
- `tsconfig.json`
- `src/MedSnapARSystem.ts`
- `src/lens-studio-entry.ts`
- `src/types/lens-studio.d.ts`
- `src/types/core.ts`
- `src/AROverlays/OverlayManager.ts`
- `src/Voice/VoiceController.ts`
- `src/Voice/AudioPlayer.ts`
- `src/State/StateManager.ts`
- `src/State/ModeManager.ts`
- `src/Network/APIClient.ts`

## Testing Strategy

### Development Testing (TypeScript)
```bash
# Type checking
npm run build

# Watch mode during development
npm run dev
```

### Integration Testing (Lens Studio)
1. Import built JavaScript into Lens Studio
2. Wire components in Inspector
3. Run in Spectacles Simulator
4. Check console logs for:
   - Initialization success
   - Update loop firing
   - Component lifecycle events
5. Test scene reload (should cleanup and reinitialize)

### Acceptance Tests
- [ ] Build completes without TypeScript errors
- [ ] All `@input` fields accessible in Lens Studio Inspector
- [ ] System initializes on scene load
- [ ] Update loop runs at ~60 FPS
- [ ] System disposes cleanly on scene unload
- [ ] Can make HTTP request to backend
- [ ] Can play TTS audio
- [ ] Console logs confirm all subsystems initialized

## Known Constraints

### Lens Studio JavaScript Engine
- ES2020 target (no ES2021+ features)
- CommonJS modules (no ES modules)
- No native async/await in some contexts (use callbacks)
- Global `script` object is entry point
- `@input` annotations are parsed by Lens Studio (not TypeScript)

### Performance Requirements
- AR rendering: ≥30 FPS (ideally 60 FPS per FR-41)
- Update loop runs every frame
- Minimize allocations in update loop
- Cache frequently accessed components

### KISS Principle
- Don't over-engineer
- Use simplest patterns from marvin that work
- No complex abstractions beyond what marvin demonstrates
- Focus on Dev 2 needs only (clinical mode, patient cards, prescription UI)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Lens Studio doesn't support TypeScript syntax | High | Use marvin's proven tsconfig settings, CommonJS output |
| `@input` annotations break after build | High | Keep annotations in comments, test in Lens Studio early |
| Performance degradation from TypeScript overhead | Medium | Profile in simulator, optimize hot paths, match marvin's patterns |
| Type definitions incomplete | Medium | Start with marvin's types, extend as needed for Dev 2 tasks |
| Build pipeline complexity | Low | Keep it simple, just TypeScript compiler (no webpack/rollup initially) |

## Timeline

| Phase | Hours | Deliverable |
|-------|-------|-------------|
| 1. Build System | 2 | package.json, tsconfig.json, build succeeds |
| 2. Type Definitions | 2 | lens-studio.d.ts, core.ts, types compile |
| 3. AR System Core | 4 | MedSnapARSystem, lens-studio-entry, initializes in Lens Studio |
| 4. Components | 6 | OverlayManager, Voice, State, all subsystems working |
| 5. Network Client | 2 | APIClient, can call backend endpoints |
| 6. Integration | 2 | Full system working in Lens Studio simulator |
| **Total** | **18** | Complete TypeScript foundation, ready for Dev 2 tasks |

## Success Metrics

1. **Build Success Rate**: 100% (no TypeScript errors)
2. **Integration Success**: All `@input` components wire correctly in Lens Studio
3. **Runtime Success**: System initializes and runs in simulator without errors
4. **Code Reuse**: >80% of patterns match marvin's proven implementation
5. **Developer Readiness**: Dev 2 can immediately start Task 2.1 (Mode Manager) after this spec completes

## Next Steps After Completion

With this infrastructure in place, Dev 2 can proceed with:
1. **Task 2.1**: Mode Manager implementation (hours 6-12)
2. **Task 2.2**: Patient Card Renderer (hours 12-18)
3. **Task 2.3**: Clinical Mode State Machine (hours 18-30)
4. **Task 2.4**: Prescription UI (hours 30-36)

All tasks will now use TypeScript with proper typing, following marvin's proven patterns.

## References

- Marvin AR Core: `/Users/jasonyi/snaplens-code/marvin/ar-core/`
- MedSnap PRD: `/Users/jasonyi/snaplens-code/MedSnap_PRD.md`
- MedSnap Task List: `/Users/jasonyi/snaplens-code/MedSnap_TaskList_Updated.md`
- Lens Studio API Docs: `/Users/jasonyi/snaplens-code/docs/Lens_Studio_API_Reference.md`
- Dev 2 Instructions: `/Users/jasonyi/snaplens-code/CLAUDE.md`
