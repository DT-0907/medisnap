# Lens Studio TypeScript Integration - Architecture Diagrams

This document provides visual representations of the MedSnap TypeScript architecture.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SNAP SPECTACLES DEVICE                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Lens Studio Runtime Environment               │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │         lens-studio-entry.js (Entry Point)          │ │ │
│  │  │                                                       │ │ │
│  │  │  @input SceneObject sceneRoot                       │ │ │
│  │  │  @input RemoteServiceModule remoteService           │ │ │
│  │  │  @input AudioComponent audioComponent               │ │ │
│  │  │                                                       │ │ │
│  │  │  • SceneEvent.OnStart → initialize()                │ │ │
│  │  │  • UpdateEvent → update() (every frame)             │ │ │
│  │  │  • SceneEvent.OnDestroy → dispose()                 │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │           MedSnapARSystem (Coordinator)             │ │ │
│  │  │                                                       │ │ │
│  │  │  • Initializes all subsystems                       │ │ │
│  │  │  • Manages lifecycle (start, stop, dispose)         │ │ │
│  │  │  • Coordinates update loop                          │ │ │
│  │  │  • Handles errors globally                          │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │              ↓           ↓         ↓          ↓            │ │
│  │  ┌──────────────┐ ┌─────────┐ ┌────────┐ ┌─────────────┐ │ │
│  │  │ OverlayMgr  │ │ Voice   │ │ State  │ │ APIClient   │ │ │
│  │  │             │ │Controller│ │Manager │ │             │ │ │
│  │  │ • AR text   │ │         │ │        │ │ • HTTP      │ │ │
│  │  │ • Billboard │ │ • ASR   │ │ • Mode │ │ • Backend   │ │ │
│  │  │ • Fade      │ │ • Wake  │ │ • State│ │   calls     │ │ │
│  │  └──────────────┘ └─────────┘ └────────┘ └─────────────┘ │ │
│  │              ↓           ↓                      ↓           │ │
│  │  ┌──────────────┐ ┌─────────┐                              │ │
│  │  │PatientCard  │ │ Audio   │                              │ │
│  │  │Renderer     │ │ Player  │                              │ │
│  │  │(Task 2.2)   │ │         │                              │ │
│  │  │             │ │ • TTS   │                              │ │
│  │  └──────────────┘ └─────────┘                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Railway)                         │
│                                                                   │
│  Express API Server (ALREADY IMPLEMENTED ✅)                     │
│                                                                   │
│  POST /api/clinical/patient/load                                 │
│  POST /api/clinical/symptom/record                               │
│  POST /api/clinical/prescription/create                          │
│  POST /api/voice/command                                         │
│  POST /api/tts/generate                                          │
│                                                                   │
│  Supabase PostgreSQL Database                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Dependency Graph

```
MedSnapARSystem
├─── OverlayManager
│    ├─── PatientCardRenderer (Dev 2 Task 2.2)
│    ├─── PrescriptionUI (Dev 2 Task 2.4)
│    └─── ClinicalModeStateMachine (Dev 2 Task 2.3) [uses overlays]
│
├─── VoiceController
│    └─── (ASR integration - placeholder for MVP)
│
├─── AudioPlayer
│    ├─── Used by: PatientCardRenderer (TTS greetings)
│    ├─── Used by: PrescriptionUI (TTS warnings)
│    └─── Used by: ClinicalModeStateMachine (TTS confirmations)
│
├─── StateManager
│    ├─── ModeManager (Dev 2 Task 2.1)
│    └─── ClinicalModeStateMachine (Dev 2 Task 2.3)
│
└─── APIClient
     ├─── Used by: PatientCardRenderer (load patient)
     ├─── Used by: PrescriptionUI (create prescription)
     ├─── Used by: ClinicalModeStateMachine (record symptoms)
     └─── Used by: AudioPlayer (generate TTS)

Legend:
├─── Direct dependency (owns/initializes)
└─── Uses (calls methods)
```

---

## Data Flow: Patient Load Example

```
User: "Hey MedSnap, start assessment Sarah Chen"
  │
  ↓ (Voice detected by Snap Spectacles)
  │
┌─────────────────────────────────────────────────────────┐
│ VoiceController (ASR)                                   │
│ • Transcribes: "start assessment Sarah Chen"           │
└─────────────────────────────────────────────────────────┘
  │
  ↓ (Transcription string)
  │
┌─────────────────────────────────────────────────────────┐
│ APIClient.extractIntent()                               │
│ POST /api/voice/command                                 │
│ → VoiceCommand {                                        │
│     intent: START_ASSESSMENT,                           │
│     parameters: { patientName: "Sarah Chen" }           │
│   }                                                      │
└─────────────────────────────────────────────────────────┘
  │
  ↓ (VoiceCommand object)
  │
┌─────────────────────────────────────────────────────────┐
│ ClinicalModeStateMachine (Dev 2 Task 2.3)              │
│ • Validates intent                                      │
│ • Calls APIClient.loadPatient("Sarah Chen")            │
└─────────────────────────────────────────────────────────┘
  │
  ↓ (HTTP request)
  │
┌─────────────────────────────────────────────────────────┐
│ Backend API                                             │
│ POST /api/clinical/patient/load                         │
│ → {                                                     │
│     success: true,                                      │
│     data: {                                             │
│       patient: { id, name, age, medications, ... },     │
│       audioUrl: "https://tts.../sarah-chen-greeting"    │
│     }                                                    │
│   }                                                      │
└─────────────────────────────────────────────────────────┘
  │
  ↓ (Response with patient data + TTS URL)
  │
┌─────────────────────────────────────────────────────────┐
│ ClinicalModeStateMachine                                │
│ • Stores patient in StateManager                        │
│ • Calls PatientCardRenderer.render(patient)            │
│ • Calls AudioPlayer.playFromUrl(audioUrl)              │
└─────────────────────────────────────────────────────────┘
  │
  ↓ (Parallel actions)
  │
  ├─→ ┌────────────────────────────────────────────────┐
  │   │ PatientCardRenderer (Dev 2 Task 2.2)          │
  │   │ • Uses OverlayManager.createOverlay()         │
  │   │ • Displays AR card:                           │
  │   │   "Sarah Chen, 34, Female                     │
  │   │    Allergies: Penicillin                      │
  │   │    Medications: Warfarin, Loratadine"         │
  │   └────────────────────────────────────────────────┘
  │
  └─→ ┌────────────────────────────────────────────────┐
      │ AudioPlayer                                    │
      │ • Loads TTS audio track                       │
      │ • Plays: "Sarah Chen, 34 years old, female.   │
      │          Allergies: Penicillin.               │
      │          Current medications: Warfarin..."    │
      └────────────────────────────────────────────────┘
```

---

## TypeScript Build Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT                             │
└─────────────────────────────────────────────────────────────┘

src/                            tsconfig.json
├── MedSnapARSystem.ts         {
├── lens-studio-entry.ts         "target": "ES2020",
├── types/                       "module": "commonjs",
│   ├── lens-studio.d.ts         "experimentalDecorators": true,
│   └── core.ts                  "removeComments": false,
├── AROverlays/                  "outDir": "./dist"
│   └── OverlayManager.ts      }
├── Voice/
│   ├── VoiceController.ts
│   └── AudioPlayer.ts
├── State/
│   ├── StateManager.ts
│   └── ModeManager.ts
├── Network/
│   └── APIClient.ts
└── Clinical/
    ├── PatientCardRenderer.ts
    ├── ClinicalModeStateMachine.ts
    └── PrescriptionUI.ts

         │
         ↓ npm run build (tsc)
         │

┌─────────────────────────────────────────────────────────────┐
│                      BUILD OUTPUT                           │
└─────────────────────────────────────────────────────────────┘

dist/
├── lens-studio-entry.js       ← Import this in Lens Studio
├── lens-studio-entry.d.ts
├── MedSnapARSystem.js
├── MedSnapARSystem.d.ts
├── types/
│   └── core.d.ts
├── AROverlays/
│   └── OverlayManager.js
├── Voice/
│   ├── VoiceController.js
│   └── AudioPlayer.js
├── State/
│   ├── StateManager.js
│   └── ModeManager.js
├── Network/
│   └── APIClient.js
└── Clinical/
    ├── PatientCardRenderer.js
    ├── ClinicalModeStateMachine.js
    └── PrescriptionUI.js

         │
         ↓ Import into Lens Studio
         │

┌─────────────────────────────────────────────────────────────┐
│                  LENS STUDIO PROJECT                        │
└─────────────────────────────────────────────────────────────┘

MedSnap.lsproj/
├── Resources/
│   └── lens-studio-entry.js   ← Imported build output
└── Scene Hierarchy
    ├── MedSnapSystem (Script: lens-studio-entry.js)
    ├── SceneRoot
    ├── RemoteServiceModule
    └── AudioPlayer

         │
         ↓ Run in Simulator
         │

    Snap Spectacles
```

---

## Marvin Pattern Reuse Visualization

```
┌──────────────────────────────────────────────────────────────┐
│              MARVIN REFERENCE IMPLEMENTATION                  │
│         /Users/jasonyi/snaplens-code/marvin/ar-core/         │
└──────────────────────────────────────────────────────────────┘

MarvinARSystem.ts (main.ts)
├── ObjectTracker ❌ NOT NEEDED (no CV in clinical mode)
├── GestureHandler ❌ NOT NEEDED (voice commands instead)
├── SpatialAnchors ❌ NOT NEEDED (fixed position overlays)
├── OverlayManager ✅ REUSE 90% (adapt colors/layouts)
└── Lifecycle pattern ✅ REUSE 100% (OnStart, Update, Destroy)

lens-studio-entry.ts
├── @input annotations ✅ REUSE 100% (change components)
├── Event binding ✅ REUSE 100% (same pattern)
└── Global debug API ✅ REUSE 100% (adapt for MedSnap)

types/lens-studio.d.ts
├── Core math (vec3, quat) ✅ REUSE 100%
├── Scene types ✅ REUSE 100%
├── ObjectTracking ❌ NOT NEEDED
├── HandTracking ❌ NOT NEEDED
└── Audio/Text types ⚠️ EXTEND (add missing definitions)

tsconfig.json
├── target: ES2020 ✅ REUSE 100%
├── module: commonjs ✅ REUSE 100%
└── experimentalDecorators ✅ REUSE 100%

         ↓ ADAPT FOR MEDSNAP ↓

┌──────────────────────────────────────────────────────────────┐
│              MEDSNAP TYPESCRIPT IMPLEMENTATION                │
│       /Users/jasonyi/snaplens-code/lens-studio/src/          │
└──────────────────────────────────────────────────────────────┘

MedSnapARSystem.ts
├── OverlayManager ← 90% from marvin
├── VoiceController ← NEW (inspired by GestureHandler structure)
├── AudioPlayer ← NEW (TTS playback)
├── StateManager ← NEW (mode + patient state)
├── ModeManager ← NEW (extends existing JS)
├── APIClient ← NEW (backend HTTP)
└── Lifecycle pattern ← 100% from marvin

Legend:
✅ Reuse as-is or with minimal changes
⚠️ Extend with new features
❌ Not needed for MedSnap
← Pattern inspiration (structure, not code)
```

---

## Scene Hierarchy in Lens Studio

```
Scene
│
├── MedSnapSystem (SceneObject)
│   └── MedSnapScript (Script Component)
│       ├── Script: dist/lens-studio-entry.js
│       └── Inspector Inputs:
│           ├── sceneRoot → SceneRoot (wired)
│           ├── remoteService → RemoteServiceModule component (wired)
│           └── audioComponent → AudioComponent component (wired)
│
├── SceneRoot (SceneObject)
│   └── Parent for all AR overlays
│       ├── PatientCard (created dynamically by PatientCardRenderer)
│       ├── PrescriptionUI (created dynamically by PrescriptionUI)
│       └── Notifications (created dynamically by OverlayManager)
│
├── RemoteServiceModule (SceneObject)
│   └── RemoteService (RemoteServiceModule Component)
│       └── Configuration:
│           └── API URL: http://localhost:3000 (dev)
│                        or https://medsnap.railway.app (prod)
│
└── AudioPlayer (SceneObject)
    └── AudioComponent (AudioComponent Component)
        ├── Volume: 1.0
        └── Audio tracks loaded dynamically from TTS URLs
```

---

## State Machine: Clinical Mode (Dev 2 Task 2.3)

```
┌─────────┐
│  IDLE   │ ← Initial state
└─────────┘
     │
     │ Voice: "start assessment [patient name]"
     ↓
┌──────────────────┐
│ LOADING_PATIENT  │ ← APIClient.loadPatient()
└──────────────────┘
     │
     │ Success: Patient data received
     ↓
┌──────────────────┐
│ PATIENT_LOADED   │ ← Display patient card + TTS greeting
└──────────────────┘
     │
     ├─→ Voice: "record symptom: [description]"
     │   ↓
     │   ┌─────────────────────┐
     │   │ RECORDING_SYMPTOM   │ ← APIClient.recordSymptom()
     │   └─────────────────────┘
     │       ↓
     │   [Return to PATIENT_LOADED]
     │
     ├─→ Voice: "show medications"
     │   ↓
     │   ┌──────────────────────┐
     │   │ SHOWING_MEDICATIONS  │ ← Display medication list
     │   └──────────────────────┘
     │       ↓
     │   [Return to PATIENT_LOADED after timeout]
     │
     ├─→ Voice: "show allergies"
     │   ↓
     │   ┌──────────────────────┐
     │   │ SHOWING_ALLERGIES    │ ← Display allergy list (RED)
     │   └──────────────────────┘
     │       ↓
     │   [Return to PATIENT_LOADED after timeout]
     │
     └─→ Voice: "prescribe [medication] [dosage]"
         ↓
         ┌──────────────┐
         │ PRESCRIBING  │ ← APIClient.createPrescription()
         └──────────────┘
             │
             ├─→ Success: No interactions
             │   ↓
             │   Display: "Prescription created" (GREEN)
             │   TTS: "Prescription for [med] created successfully"
             │
             └─→ Blocked: Drug interaction (e.g., Warfarin + Ibuprofen)
                 ↓
                 Display: "BLOCKED: High severity warning" (RED)
                 TTS: "Cannot prescribe. [Med] interacts with Warfarin.
                       Suggest Acetaminophen instead."
             ↓
         [Return to PATIENT_LOADED]

     Inactivity timeout (120s) → Return to IDLE
     Voice: "end assessment" → Return to IDLE
```

---

## Type Hierarchy

```
TypeScript Types (src/types/)
│
├── lens-studio.d.ts (Lens Studio API)
│   ├── Core Math
│   │   ├── vec3 (x, y, z)
│   │   ├── vec2 (x, y)
│   │   ├── vec4 (x, y, z, w)
│   │   ├── quat (w, x, y, z)
│   │   └── mat4 (4x4 matrix)
│   │
│   ├── Scene
│   │   ├── Script (global entry point)
│   │   ├── SceneObject (nodes in scene)
│   │   ├── Component (base class)
│   │   └── Transform (position, rotation, scale)
│   │
│   ├── Rendering
│   │   ├── Text (AR text display)
│   │   ├── ScreenTransform (UI positioning)
│   │   └── BackgroundSettings (card backgrounds)
│   │
│   ├── Audio
│   │   ├── AudioComponent (playback)
│   │   ├── AudioTrack (audio asset)
│   │   └── AsrModule (speech recognition)
│   │
│   ├── Networking
│   │   ├── RemoteServiceModule (HTTP client)
│   │   ├── Request (HTTP request)
│   │   └── Response (HTTP response)
│   │
│   └── Events
│       ├── UpdateEvent (every frame)
│       ├── SceneEvent.OnStart (initialization)
│       ├── SceneEvent.OnDestroy (cleanup)
│       └── DelayedCallbackEvent (timers)
│
└── core.ts (MedSnap Domain)
    ├── Application State
    │   ├── AppMode (enum: IDLE, TRAINING, CLINICAL)
    │   └── ClinicalState (enum: IDLE, LOADING_PATIENT, ...)
    │
    ├── Patient Data
    │   ├── PatientData (interface)
    │   ├── VitalSigns (interface)
    │   ├── Medication (interface)
    │   └── Diagnosis (interface)
    │
    ├── Prescription Data
    │   ├── PrescriptionData (interface)
    │   ├── PrescriptionStatus (type)
    │   └── DrugInteractionWarning (interface)
    │
    ├── Voice Commands
    │   ├── VoiceCommand (interface)
    │   └── VoiceIntent (enum)
    │
    ├── AR Configuration
    │   ├── AROverlayConfig (interface)
    │   ├── OverlayStyle (interface)
    │   └── AR_COLORS (const: CYAN, YELLOW, RED, GREEN)
    │
    ├── System Configuration
    │   └── MedSnapConfig (interface)
    │
    └── API Responses
        ├── APIResponse<T> (generic interface)
        ├── PatientLoadResponse (interface)
        ├── SymptomRecordResponse (interface)
        └── PrescriptionResponse (interface)
```

---

## Performance Monitoring Flow

```
UpdateEvent (every frame ~60 FPS)
     │
     ↓
MedSnapARSystem.update()
     │
     ├─→ OverlayManager.updateBillboards()
     │   └── Rotate all overlays to face camera
     │
     ├─→ OverlayManager.checkExpiredOverlays()
     │   └── Remove overlays past TTL
     │
     ├─→ checkInactivityTimeout()
     │   └── If 120s elapsed → exit clinical mode
     │
     └─→ checkPerformance() (if enabled, throttled to 1/sec)
         ├── Calculate FPS
         ├── Measure render latency
         ├── Measure audio latency
         ├── Measure HTTP latency
         └── Validate against targets:
             • FPS ≥ 30 (FR-41)
             • Voice response < 3s (FR-42)
             • TTS latency < 1.5s (FR-44)
```

---

## Error Handling Architecture

```
try {
  // Any subsystem operation
} catch (error) {
  ↓
  MedSnapError (custom error class)
  ├── type: MedSnapErrorType
  ├── message: string
  └── context: Record<string, unknown>

  Error Types:
  ├── INITIALIZATION_FAILED
  ├── API_REQUEST_FAILED
  ├── TTS_PLAYBACK_FAILED
  ├── PATIENT_NOT_FOUND
  └── INVALID_MODE_TRANSITION

  Error Handlers:
  ├── Log to console (always)
  ├── Display error overlay (user-facing)
  ├── Play error TTS (if audio available)
  └── Graceful degradation (continue running)
}
```

---

**END OF ARCHITECTURE DOCUMENTATION**
