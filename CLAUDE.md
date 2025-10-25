# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MedSnap** is a hands-free AR medical assistant for Snap Spectacles that serves two functions:
1. **Training Mode**: Real-time AR guidance for learning medical procedures (pulse-taking)
2. **Clinical Mode**: Voice-activated patient assessment with AI-powered decision support and drug interaction checking

**Timeline**: 48-hour hackathon project
**Tech Stack**: Snap Spectacles + Lens Studio (client), Node.js/Express (backend), Supabase (database), MediaPipe Hands (CV), Gemini API via Letta (AI), Fish Audio (TTS)

## Development Principles

### Test-Driven Development (TDD) - MANDATORY
All code in this repository follows strict TDD:
1. Write tests FIRST
2. Run tests to confirm they FAIL
3. Commit tests: `git commit -m "[TDD] Add [component] tests"`
4. Implement code to pass tests
5. Run tests until they PASS
6. Commit implementation: `git commit -m "[TDD] Implement [component]"`

**Never commit untested code. Never skip test-first approach.**

### KISS, YAGNI Principles
- Keep implementations simple and focused on MVP requirements
- Only build features explicitly required in PRD (MedSnap_PRD.md)
- Avoid premature optimization or over-engineering

### PRD Compliance
All functional requirements (FR-XX) in `MedSnap_PRD.md` are mandatory unless marked as "MAY". Always reference PRD sections when implementing features.

## Commands

### Testing
```bash
# Backend tests
cd backend
npm test                          # Run all tests
npm run test:unit                 # Unit tests only
npm run test:integration          # Integration tests only
npm run test:watch                # Watch mode
npm run test:coverage             # Coverage report

# Run specific test file
npx jest tests/unit/db/schema.test.ts
npx jest tests/integration/database-seed.test.ts
```

### Database Operations
```bash
# Set up database (run in order)
psql "$SUPABASE_DB_URL" -f backend/db/test-helpers.sql  # Helper functions
psql "$SUPABASE_DB_URL" -f backend/db/schema.sql        # Schema
psql "$SUPABASE_DB_URL" -f backend/db/seed.sql          # Seed data

# Verify critical data
psql "$SUPABASE_DB_URL" -c "SELECT name, medications FROM patients WHERE name = 'Sarah Chen';"
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM patients;"
```

### Development
```bash
cd backend
npm install            # Install dependencies
npm run dev            # Run dev server with ts-node
npm run build          # Compile TypeScript
npm start              # Run compiled server
```

## Architecture

### High-Level System Flow

```
[Snap Spectacles + Lens Studio Client]
        |
        | Voice Input (Snap ASR) → Text
        | CV Processing (MediaPipe Hands) → Hand/wrist landmarks
        | AR Rendering → Visual overlays
        |
        v
[Express API on Railway] ←→ [Supabase PostgreSQL Database]
        |
        | Gemini API (via Letta) → AI decision support
        | Fish Audio API → Text-to-speech
        | Drug Interaction Service → Safety checks
        |
        v
[Response: JSON + TTS audio URL] → Back to Spectacles
```

### Database Schema (PRD FR-37)

**Critical Design Decision**: Uses JSONB for nested data (medications, diagnosis_history) rather than relational tables to enable rapid MVP development and flexible queries.

```sql
patients (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL,
  chief_complaint TEXT,
  current_symptoms TEXT[],           -- Simple array
  vital_signs JSONB,                 -- {bp, hr, o2, temp}
  allergies TEXT[],                  -- Simple array
  medications JSONB,                 -- [{name, dosage, started}]
  diagnosis_history JSONB,           -- [{date, diagnosis, provider}]
  created_at TIMESTAMP
)

visits (
  id UUID,
  patient_id UUID FK → patients,
  date TIMESTAMP,
  symptoms_recorded TEXT[],
  notes TEXT
)

prescriptions (
  id UUID,
  patient_id UUID FK → patients,
  medication TEXT,
  dosage TEXT,
  status TEXT DEFAULT 'pending_physician_approval',
  blocked BOOLEAN DEFAULT FALSE,
  warnings JSONB
)
```

**Why JSONB for medications/diagnosis**:
- Enables flexible querying without JOIN overhead
- Simplifies seeding and testing
- Medications often have variable attributes
- Avoids normalization complexity for hackathon timeline

### Backend Structure

```
backend/
├── src/
│   ├── routes/         # API endpoint definitions (10 total endpoints)
│   ├── controllers/    # Business logic layer
│   ├── services/       # External API integrations (Gemini, Fish Audio, Letta)
│   ├── models/         # Data models & DB query functions
│   ├── db/             # Supabase client setup
│   └── utils/          # Helper functions (caching, etc)
├── tests/
│   ├── unit/           # Mirror src/ structure
│   └── integration/    # E2E flow tests (training, clinical, prescription)
├── data/
│   └── patients.json   # Mock patient seed data (5 patients)
└── db/
    ├── schema.sql      # Database schema
    ├── seed.sql        # Seed script
    └── test-helpers.sql # RPC functions for testing
```

### API Endpoints (10 Total)

1. `POST /api/training/start` - Initialize training session
2. `POST /api/training/feedback` - Process BPM reading and technique feedback
3. `POST /api/clinical/patient/load` - Load patient record by name
4. `POST /api/clinical/symptom/record` - Add symptom to session
5. `POST /api/clinical/decision-support` - Get AI diagnosis suggestions
6. `POST /api/clinical/prescription/create` - Create prescription with safety checks
7. `POST /api/voice/command` - Extract intent from voice transcription
8. `POST /api/tts/generate` - Generate TTS audio (with caching per FR-44a)

**All responses include `tts_url` field** pointing to Fish Audio TTS for voice feedback.

### Voice Command System

**Wake Word**: "Hey MedSnap" for session-initiating commands
**In-Session**: No wake word needed once mode is active

**Session-Initiating** (require wake word):
- "Hey MedSnap, start training pulse taking"
- "Hey MedSnap, start assessment [patient name]"

**In-Session** (no wake word):
- "Record symptom: [description]"
- "Show patient history"
- "Show medications"
- "Prescribe [medication] [dosage]"
- "Repeat instructions"
- "Show available medications"

**Mode Exit**:
- Explicit: "Hey MedSnap, end training" / "end assessment"
- Auto-exit: 10s inactivity (training), 120s inactivity (clinical)

## Critical Data Requirements

### Sarah Chen Patient (CRITICAL FOR DEMO)

Sarah Chen **must** have Warfarin medication for the drug interaction demo. This is verified in all test suites:

```typescript
// From tests/unit/data/patients.test.ts
it('CRITICAL: should have Warfarin medication for drug interaction demo', () => {
  const warfarin = sarahChen.medications.find(m => m.name === 'Warfarin');
  expect(warfarin).toBeDefined();
  expect(warfarin.dosage).toBe('5mg daily');
});
```

**Demo Flow**: User prescribes Ibuprofen → System blocks due to Warfarin interaction (bleeding risk) → Suggests Acetaminophen alternative

### Drug Database (FR-22)

8 baseline medications (allow 7-10 total):
- Amoxicillin (antibiotic)
- Azithromycin (antibiotic)
- Acetaminophen (pain reliever)
- Ibuprofen (NSAID)
- Lisinopril (ACE inhibitor)
- Metformin (antidiabetic)
- Omeprazole (PPI)
- Warfarin (anticoagulant)

**Known Interaction**: Warfarin + Ibuprofen (or any NSAID) → HIGH severity bleeding risk

## Performance Requirements (FR-41 through FR-44)

All implementations must meet these targets:

- **AR rendering**: ≥30 FPS (FR-41)
- **CV detection latency**: <500ms (FR-43)
- **API response time**: <3 seconds, target 2s (FR-42)
- **TTS generation**: <1.5 seconds, target <500ms (FR-44)
- **TTS cache hit rate**: >50% (FR-44a)

**Caching Strategy**: Pre-cache common voice responses at server startup. Cache uses in-memory LRU with 24-hour TTL and 100-entry limit.

## Computer Vision

**Primary Model**: MediaPipe Hands v0.9+ (FR-32)
**Configuration**: 640x480 RGB @ 15 FPS, confidence threshold ≥0.7, single person detection

**Graceful Degradation** (FR-36): CV failures should never block workflow. Implement 10-second retry timeout (FR-10a), then allow manual continuation or skip.

**Vital Sign OCR** (FR-16, FR-17, FR-17a): 2 retry attempts with 2-second delay. After failures, skip and allow manual entry.

## TypeScript Standards

```typescript
// Strict types - no 'any'
function loadPatient(name: string): Promise<Patient> {
  // Early returns for validation
  if (!name) {
    throw new Error('Patient name required');
  }
  // Explicit return types
  return queryDatabase(name);
}

// Use async/await, not .then()
async function processRequest() {
  try {
    const patient = await loadPatient('Sarah Chen');
    return { success: true, data: patient };
  } catch (error) {
    logger.error('Load failed', { error });
    return { success: false, error: error.message };
  }
}
```

## Testing Patterns

### Test Structure
```typescript
describe('DrugInteractionService', () => {
  describe('checkInteraction', () => {
    it('should detect HIGH severity interaction between Warfarin and Ibuprofen', () => {
      // Arrange
      const currentMeds = ['Warfarin'];
      const newMed = 'Ibuprofen';

      // Act
      const result = checkInteraction(currentMeds, newMed);

      // Assert
      expect(result.blocked).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'drug_interaction',
          message: expect.stringContaining('bleeding risk')
        })
      );
    });
  });
});
```

### Coverage Targets
- **Unit tests**: 80%+ for services/controllers
- **Integration tests**: 100% for critical paths (training, clinical, prescription flows)
- **E2E tests**: All demo scenarios must work

### Three Critical Integration Test Suites

1. **Training Flow** (`tests/integration/training-flow.test.ts`)
   - Complete pulse-taking training with CV detection
   - BPM feedback with normal/abnormal ranges
   - 10-second CV retry timeout
   - Auto-exit after completion + 10s inactivity

2. **Clinical Flow** (`tests/integration/clinical-flow.test.ts`)
   - Load patient (Sarah Chen with Warfarin)
   - Record symptoms
   - AI decision support suggestions
   - 3-retry patient lookup with list fallback
   - Auto-exit after 120s inactivity

3. **Prescription Flow** (`tests/integration/prescription-flow.test.ts`)
   - Safe prescription (Acetaminophen) → success
   - Unsafe prescription (Ibuprofen for Warfarin patient) → blocked with alternatives
   - Unknown medication → error message + "Show available medications" suggestion
   - Prescription logging even when blocked (for audit)

## Git Workflow

**Branch**: `CV` (all work goes here, never push directly to main)

**Commit Format**:
```
[TDD] Add [component] tests
[TDD] Implement [component]
[Integration] Connect [system A] with [system B]
[Fix] [description]
[Perf] Optimize [component] for [metric]
```

## Environment Variables

```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

GEMINI_API_KEY=your-gemini-key
FISH_AUDIO_API_KEY=your-fish-audio-key
LETTA_API_KEY=your-letta-key

PORT=3000
DEMO_MODE=false  # Set true for mock API responses
```

## Common Pitfalls to Avoid

1. ❌ Don't skip TDD - always write tests first
2. ❌ Don't use TypeScript `any` - use strict types
3. ❌ Don't modify Sarah Chen's Warfarin medication - it's demo-critical
4. ❌ Don't block workflow on CV failures - implement graceful degradation
5. ❌ Don't forget retry logic (CV: 10s, OCR: 2x with 2s delay)
6. ❌ Don't use `.then()` chains - use async/await
7. ❌ Don't commit without passing tests
8. ❌ Don't push to main branch - use CV branch

## Key Files

**Configuration**:
- `MedSnap_PRD.md` - Product requirements (source of truth)
- `MedSnap_TaskList_Updated.md` - Detailed task breakdown
- `.cursorrules` - AI development rules for this project

**Database**:
- `backend/db/schema.sql` - Database schema per PRD FR-37
- `backend/db/seed.sql` - Seed script with 5 patients
- `backend/db/test-helpers.sql` - RPC functions for testing
- `backend/data/patients.json` - Mock patient data source

**Testing**:
- `backend/tests/unit/db/schema.test.ts` - Schema validation
- `backend/tests/unit/data/patients.test.ts` - Patient data validation
- `backend/tests/integration/database-seed.test.ts` - Seed verification

**Configuration**:
- `backend/jest.config.js` - Jest test configuration
- `backend/tsconfig.json` - TypeScript compiler config
- `backend/package.json` - Dependencies and scripts

## Team Roles

**Dev 1**: Training Mode & AR Foundation (Lens Studio)
**Dev 2**: Clinical Mode & Voice UX (Lens Studio)
**Dev 3**: Backend & AI Integration (Express/Node.js) - You are working with this codebase
**Dev 4**: Data, CV & Integration (Database/CV/Testing)

**Current Role**: Dev 3 (Backend & AI Integration)

## Next Steps After Database Setup

1. Create `src/db/supabase.ts` - Supabase client wrapper
2. Create `src/models/patient.ts` - Patient CRUD operations
3. Create `src/services/geminiService.ts` - Gemini API integration
4. Create `src/services/lettaService.ts` - Letta context management
5. Create `src/services/fishAudioService.ts` - TTS generation with caching
6. Create `src/services/drugInteractionService.ts` - Drug safety checking
7. Create API routes and controllers for all 10 endpoints

## References

- Full requirements: `MedSnap_PRD.md`
- Task breakdown: `MedSnap_TaskList_Updated.md`
- Implementation plan: `docs/dev4-phase-4.0-implementation-plan.md`
- Backend README: `backend/README.md`
