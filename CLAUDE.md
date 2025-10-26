# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## YOUR ROLE: Full Stack Lead - All Development

**YOU ARE THE LEAD DEVELOPER.** You are responsible for ALL development tasks (Dev 1-4) to achieve 100% PRD compliance for the MedSnap AR medical assistant.

### Your Complete Scope
- **Dev 1: Training Mode & AR Foundation** - Pulse-taking training with hand tracking
- **Dev 2: Clinical Mode & Voice UX** - Patient assessment and prescription workflow
- **Dev 3: Backend & AI Integration** - Express API, Gemini, Fish Audio, Letta
- **Dev 4: Database & CV Pipeline** - Supabase, MediaPipe Hands integration

### Current Status (75-80% Complete)
- ✅ Clinical Mode fully functional
- ✅ Backend APIs implemented
- ✅ Database and CV pipeline ready
- ✅ Hand tracking infrastructure (from delbert merge)
- ✅ ASR voice recognition available
- ⚠️ Training Mode needs implementation
- ⚠️ Components need integration
- ⚠️ External APIs need connection

### Reference Material: Spectacles Sample Code
**Location**: `./Spectacles-Sample/`

Use these sample projects as reference when working on specific Dev 2 tasks:

#### Task 2.1: Mode Manager (Hours 6-12)
- Review `Spectacles-Sample/Essentials/` for basic state management patterns
- Check how other samples handle mode switching and lifecycle management

#### Task 2.2: Patient Card Renderer (Hours 12-18)
- **Primary Reference**: `Spectacles-Sample/AI Playground/` for AI-driven UI components
- Look at AR text rendering and card positioning patterns
- Study how other samples handle dynamic content display in AR overlays

#### Task 2.3: Clinical Mode State Machine (Hours 18-30)
- **Voice Integration**: `Spectacles-Sample/Voice Playback/` for TTS audio playback patterns
- **AI Integration**: `Spectacles-Sample/Agentic Playground/` for agent-based interactions
- Study state machine patterns and async workflow handling

#### Task 2.4: Prescription UI (Hours 30-36)
- Combine patterns from `Voice Playback/` (audio feedback) and `AI Playground/` (dynamic UI)
- Reference any samples showing form input or command parsing

**How to Use**:
1. Before starting each task, browse the relevant sample project
2. Look for TypeScript/JavaScript patterns in `Scripts/` directories
3. Check individual sample `README.md` files for setup and architecture notes
4. Copy proven patterns, but adapt to MedSnap requirements (KISS principle)
5. Don't over-engineer - use simplest patterns that work

### Lens Studio API Documentation
**Location**: `./docs/`

Two comprehensive API reference documents are available:

#### 1. Lens_Studio_API_Reference.md (Primary - Dev 2 Focused)
**Essential reading** - Curated API documentation specifically for your Dev 2 tasks.

**Contains**:
- **Audio APIs**: AudioComponent, AsrModule for voice/TTS
- **Text/UI APIs**: Text Component, BackgroundSettings, ScreenTransform for patient cards
- **Animation APIs**: AnimationPlayer for fade in/out effects
- **Networking APIs**: HTTP Request patterns for backend calls
- **Code Examples**: Ready-to-use snippets for all major Dev 2 tasks
- **Color Reference**: AR_COLORS constants matching FR AR-1
- **Performance Tips**: FPS and latency optimization
- **Error Handling**: Patterns for graceful degradation

**Usage**: Reference this file when implementing each component. Code examples are ready to copy/adapt.

#### 2. Full_Lens_API_Comprehensive.md (Complete Reference)
Full Lens Studio API documentation for deep dives.

**Contains**:
- Complete API coverage (audio, rendering, physics, ML, etc.)
- All component types and properties
- Mathematical utilities (vec2, vec3, vec4, quat, mat4)
- Event system details
- Physics engine documentation
- Multiplayer/networking (for future features)

**Usage**: Consult when you need details beyond the Dev 2 focused guide.

### Quick API Reference for Common Tasks

**Play TTS Audio**:
```javascript
const audio = sceneObject.getComponent("Component.AudioComponent");
audio.audioTrack = ttsAudioTrack;
audio.play();
```

**Display Text in AR**:
```javascript
const text = sceneObject.getComponent("Component.Text");
text.text = "Sarah Chen, 34, Female";
text.size = 18; // Minimum per FR AR-2
```

**Position Patient Card (Top Center)**:
```javascript
const screenTransform = sceneObject.getComponent("Component.ScreenTransform");
screenTransform.anchors.setCenter(0.5, 0.9); // Top 1/3 of screen
```

**Call Backend API**:
```javascript
const request = new Request(apiUrl + "/api/clinical/patient/load");
request.method = Request.HttpMethod.Post;
request.body = JSON.stringify({ patient_name: "Sarah Chen" });
remoteServiceModule.performHttpRequest(request, callback);
```

### What You Should NOT Work On
- ❌ Training mode (Dev 1)
- ❌ AR overlay manager, voice controller, CV pipeline (Dev 1)
- ❌ Backend API endpoints, services, or database (Dev 3)
- ❌ Computer vision models or database schema (Dev 4)

**Always refer to MedSnap_TaskList_Updated.md for your specific tasks (Section: "Dev 2: Clinical Mode & Voice UX").**

---

## MANDATORY: Core Development Principles

### ⚠️ ALWAYS Follow These Principles

#### 1. **TDD (Test-Driven Development)** - NON-NEGOTIABLE
Every single piece of code you write MUST follow this exact workflow:

```
1. WRITE TESTS FIRST - Define expected behavior before ANY implementation
2. RUN TESTS - Confirm they FAIL (red)
3. COMMIT TESTS - `git commit -m "Add [component] tests"`
4. IMPLEMENT CODE - Write minimum code to pass tests
5. RUN TESTS - Iterate until all GREEN
6. COMMIT CODE - `git commit -m "Implement [component]"`
```

**Never write implementation code before tests exist. Never skip this workflow.**

#### 2. **KISS (Keep It Simple, Stupid)**
- Write the simplest code that passes tests
- No premature optimization
- No complex abstractions "just in case"
- Medication database: 7-10 drugs MAXIMUM (not a comprehensive medical database)
- Demo mode fallback: Simple mock responses, no elaborate simulation
- CV failures: Simple skip logic, not complex retry algorithms
- If you're debating between simple and clever, choose simple

#### 3. **YAGNI (You Aren't Gonna Need It)**
DO NOT implement anything not explicitly required in your Dev 2 tasks:
- ❌ No HIPAA compliance
- ❌ No offline mode
- ❌ No multi-user support
- ❌ No advanced error recovery beyond retry counts
- ❌ No analytics or logging beyond basic debugging
- ❌ No authentication/authorization
- ❌ No internationalization
- ❌ No accessibility features
- ❌ No performance monitoring dashboards
- ❌ No configuration UIs

**If it's not in MedSnap_TaskList_Updated.md Dev 2 tasks, DON'T BUILD IT.**

### Code Quality Checklist (Every Commit)
- [ ] Tests written BEFORE implementation?
- [ ] All tests passing (green)?
- [ ] Code is simplest solution possible?
- [ ] No features beyond task requirements?
- [ ] No code for "potential future needs"?

---

## Project Overview

**MedSnap** is a hands-free AR medical assistant for Snap Spectacles built for a 48-hour hackathon. It provides two modes:
1. **Training Mode**: Real-time AR guidance for learning medical procedures (pulse taking) - **Dev 1**
2. **Clinical Mode**: Voice-activated patient assessment with AI-powered clinical decision support - **YOUR RESPONSIBILITY (Dev 2)**

**Tech Stack**: Snap Spectacles (Lens Studio), Node.js/Express backend, Supabase, MediaPipe Hands CV, Gemini API (via Letta), Fish Audio TTS

## Development Commands

### Backend (Node.js/Express)
```bash
# Install dependencies
cd backend && npm install

# Run tests (TDD workflow)
npm test                    # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npx jest --watch            # Watch mode
npx jest --coverage         # Coverage report

# Development
npm run dev                 # Start dev server
npm run build              # TypeScript build
npm start                  # Production server

# Database
# Seed database with mock patients
psql $SUPABASE_URL -f db/seed.sql
```

### Frontend (Lens Studio)
- Open `lens-studio/` project in Lens Studio
- Deploy to Spectacles simulator for testing
- Live testing requires Snap Spectacles hardware

### Computer Vision Pipeline
```bash
cd cv-pipeline
npm install
npm test                   # Run CV tests
```

## Architecture

### System Components

```
[Snap Spectacles + Lens Studio Client]
        |
        | Voice: Snap ASR → Backend
        | CV: MediaPipe Hands (local processing)
        | AR: Overlay rendering (local)
        |
        v
[Express API on Railway] <----> [Supabase PostgreSQL]
        |
        | AI: Gemini API (via Letta context wrapper)
        | TTS: Fish Audio API
        | Logic: Drug interaction + Clinical decision engine
        |
        v
[Response: TTS audio + AR display config]
```

### Data Flow Example (Patient Assessment)
1. User: "Hey MedSnap, start assessment Sarah Chen"
2. Snap ASR transcribes → sends to Express `/api/clinical/patient/load`
3. Express queries Supabase for patient record
4. Letta maintains conversation context (20 turns / 4000 tokens)
5. Gemini generates clinical insights
6. Fish Audio converts response to speech (with caching)
7. Lens Studio displays AR patient card + plays TTS audio

### Critical Integration Points

**Voice Commands**:
- Session-initiating commands require "Hey MedSnap" wake word (audio beep confirmation)
- In-session commands skip wake word (visual indicator only)
- Intent extraction handled by backend `/api/voice/command`

**Modes**:
- Training mode: Auto-exits after 10s post-completion inactivity
- Clinical mode: Auto-exits after 120s inactivity
- Direct mode switching auto-exits current mode

**Context Management**:
- Letta wrapper maintains rolling window of last 20 conversation turns or 4000 tokens
- Older context is summarized and compressed

**Response Caching**:
- Common TTS phrases cached to achieve <500ms response time
- Target cache hit rate >50%

## Database Schema

### Key Tables

**patients** (embedded JSONB design per FR-37):
```sql
- id (UUID)
- name, age, sex (basic info)
- chief_complaint, current_symptoms (TEXT[])
- vital_signs (JSONB: {bp, hr, o2, temp})
- allergies (TEXT[])
- medications (JSONB[]: [{name, dosage, started}])
- diagnosis_history (JSONB[]: [{date, diagnosis, provider}])
```

**prescriptions**:
```sql
- id, patient_id (UUID)
- medication, dosage (TEXT)
- status (default: "pending_physician_approval")
- blocked (BOOLEAN: true if safety issue)
- warnings (JSONB[])
```

**Mock Data**: Sarah Chen patient must include Warfarin medication for drug interaction demo (Warfarin + Ibuprofen = HIGH severity warning).

## Development Principles

**Test-Driven Development (TDD)**:
1. Write tests FIRST defining expected behavior
2. Run tests - confirm they FAIL
3. Commit tests: `git commit -m "Add [component] tests"`
4. Implement code to pass tests
5. Run tests - iterate until GREEN
6. Commit code: `git commit -m "Implement [component]"`

**KISS (Keep It Simple)**:
- Medication database: 7-10 drugs max (not comprehensive)
- Demo mode: Mock responses when `DEMO_MODE=true` in .env
- CV failures: Graceful degradation (skip, don't block)

**YAGNI (You Aren't Gonna Need It)**:
- No HIPAA compliance (MVP demo only)
- No offline mode
- No multi-user support
- Single patient session at a time

## Key Constraints & Behaviors

### Performance Requirements
- AR rendering: ≥30 FPS (FR-41)
- CV detection latency: <500ms (FR-43)
- Voice command response: <3 seconds wake word → TTS (FR-42)
- TTS generation: <1.5 seconds, target <500ms with cache (FR-44)

### Error Handling
- **CV failure**: Auto-retry for 10 seconds, then offer manual skip (FR-10a)
- **Patient not found**: Allow 3 attempts, then offer patient list or cancel (FR-14a)
- **Vital sign OCR failure**: Auto-retry once with 2s delay, then skip (FR-17a)
- **Unknown medication**: Show "Medication not found" + suggest "Show available medications" command (FR-22a)

### Medication Database (FR-22)
Exactly 8 baseline medications required:
- Amoxicillin (antibiotic)
- Azithromycin (antibiotic)
- Acetaminophen (pain reliever)
- Ibuprofen (NSAID) ⚠️ Interacts with Warfarin
- Lisinopril (hypertension)
- Metformin (diabetes)
- Omeprazole (acid reflux)
- Warfarin (anticoagulant)

**Drug Interaction Rules**:
- Warfarin + Ibuprofen (or any NSAID) → HIGH severity (bleeding risk)
- Suggest Acetaminophen as safe alternative

### Voice Command Mapping (FR-15)
**Session-initiating** (require wake word):
- "Hey MedSnap, start training pulse taking"
- "Hey MedSnap, start assessment [patient name]"

**In-session** (no wake word):
- "Record symptom: [description]"
- "Show patient history" / "Show medications" / "Show allergies"
- "Prescribe [medication] [dosage]"
- "Show available medications"
- "Repeat instructions"

**Exit commands**:
- "Hey MedSnap, end training" / "end assessment"
- Auto-exit on inactivity (10s training, 120s clinical)

## File Structure

```
medsnap/
├── lens-studio/              # Snap Spectacles client
│   ├── Scripts/
│   │   ├── voiceController.js       # Snap ASR + wake word detection
│   │   ├── arOverlayManager.js      # AR rendering (circles, arrows, text)
│   │   ├── cvPipeline.js            # MediaPipe Hands wrapper
│   │   ├── trainingMode.js          # Training state machine
│   │   ├── clinicalMode.js          # Clinical assessment workflow
│   │   ├── patientCardRenderer.js   # AR patient info display
│   │   ├── prescriptionUI.js        # Prescription workflow UI
│   │   ├── modeManager.js           # Mode switching logic
│   │   ├── apiClient.js             # HTTP client for backend
│   │   └── stateManager.js          # Application state
│   └── Resources/config.json         # Backend API endpoints
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API endpoints (10 total)
│   │   │   ├── training.ts          # /api/training/*
│   │   │   ├── clinical.ts          # /api/clinical/*
│   │   │   ├── prescription.ts      # /api/clinical/prescription/*
│   │   │   ├── voice.ts             # /api/voice/command
│   │   │   └── tts.ts               # /api/tts/generate
│   │   ├── controllers/     # Business logic
│   │   ├── services/
│   │   │   ├── geminiService.ts            # Gemini API integration
│   │   │   ├── lettaService.ts             # Context management wrapper
│   │   │   ├── fishAudioService.ts         # TTS generation
│   │   │   ├── drugInteractionService.ts   # Medication safety
│   │   │   └── clinicalDecisionEngine.ts   # AI diagnosis support
│   │   ├── models/          # Data models (Patient, Prescription)
│   │   ├── db/supabase.ts   # Supabase client
│   │   └── utils/responseCache.ts   # TTS caching
│   ├── data/patients.json    # Mock patient seed data
│   └── tests/
│       ├── unit/            # Component tests
│       └── integration/     # E2E flow tests
│
└── cv-pipeline/             # Computer Vision
    ├── src/
    │   ├── mediapipeHands.ts        # MediaPipe Hands model
    │   ├── wristDetection.ts        # Wrist landmark detection
    │   └── vitalSignOCR.ts          # OCR for monitors (optional)
    └── tests/
```

## API Endpoints

### Training (2 endpoints)
- `POST /api/training/start` → Start pulse taking session
- `POST /api/training/feedback` → Process BPM reading + technique feedback

### Clinical (3 endpoints)
- `POST /api/clinical/patient/load` → Load patient by name
- `POST /api/clinical/symptom/record` → Add symptom to session
- `POST /api/clinical/decision-support` → Get AI diagnosis suggestions

### Prescription (1 endpoint)
- `POST /api/clinical/prescription/create` → Create prescription with safety checks

### Utilities (4 endpoints)
- `POST /api/voice/command` → Extract intent from transcription
- `POST /api/tts/generate` → Generate TTS audio (with caching)

All responses include `audio_url` field for Fish Audio TTS playback.

## Common Patterns

### TDD Test Structure
```typescript
describe('ComponentName', () => {
  it('should do expected behavior', () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  it('should handle error case gracefully', () => {
    // Test error handling
  });
});
```

### AR Overlay Colors (FR AR-1)
- Pulse point circle: Cyan (#00FFFF) at 50% opacity
- Direction arrows: Bright yellow (#FFFF00)
- Warnings: Red (#FF0000)
- Success confirmations: Green (#00FF00)

### Demo Mode Fallback
Set `DEMO_MODE=true` in `.env` to use mock responses without external APIs. Essential for:
- Development without API keys
- Testing in poor network conditions
- Emergency fallback during demo

## Critical Demo Flows

### Training Mode (Pulse Taking)
1. "Hey MedSnap, start training pulse taking" → TTS welcome
2. CV detects wrist → AR circle on radial pulse point
3. CV validates finger placement → corrective feedback if needed
4. 15-second timer → "Time. What was your count?"
5. User responds with BPM → Validates range → technique feedback
6. Auto-exit after 10s inactivity

### Clinical Mode (Sarah Chen Drug Interaction)
1. "Hey MedSnap, start assessment Sarah Chen" → Load patient
2. AR displays patient card (allergies: Penicillin, meds: Warfarin + Loratadine)
3. "Record symptom: chest tightness" → Add to context
4. Show vitals → AI suggests Upper Respiratory Infection
5. "Prescribe Ibuprofen 400mg" → **BLOCKED** (Warfarin interaction)
6. Display warning + suggest Acetaminophen alternative
7. Auto-exit after 120s inactivity

## Deployment

**Backend**: Railway auto-deploy from `main` branch
**Database**: Supabase hosted (connection string in Railway env vars)
**Frontend**: Build in Lens Studio → deploy to Spectacles

### Environment Variables (.env)
```bash
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
GEMINI_API_KEY=<google-gemini-api-key>
FISH_AUDIO_API_KEY=<fish-audio-api-key>
LETTA_API_KEY=<letta-api-key>
PORT=3000
DEMO_MODE=false  # Set true for mock responses
```

## Team Structure (48-hour hackathon)

- **Dev 1**: Training mode + AR foundation (Lens Studio)
- **Dev 2**: Clinical mode + prescription UI (Lens Studio)
- **Dev 3**: Backend API + AI integration (Express/TypeScript)
- **Dev 4**: Database + CV pipeline + integration testing

**Merge Points**:
- Hour 12: AR foundation + voice controller
- Hour 24: All API endpoints + clinical UI
- Hour 36: Full integration + testing
- Hour 42-48: Demo rehearsal + polish

## Known Limitations (Non-Goals)

- No HIPAA compliance or production security
- No EHR integration (Epic, Cerner)
- No offline mode
- No multi-user collaboration
- Single training procedure (pulse taking only)
- Limited medication database (7-10 drugs)
- CV focused on single person detection
- Prescription logging only (no pharmacy transmission)

## Testing Strategy

**Unit Tests**: 80%+ coverage for services and controllers
**Integration Tests**: 100% coverage for training, clinical, prescription flows
**Performance Tests**: Automated tests for FPS, latency, cache hit rate
**Acceptance Tests**: All PRD acceptance criteria (AC-T1-T6, AC-C1-C6, AC-P1-P5)

Run full test suite before merging to `main`:
```bash
npm test && npm run test:integration
```
