# Spec Index: Lens Studio TypeScript Integration

**Spec ID**: 2025-10-25-lens-studio-typescript-integration
**Status**: Ready for Implementation
**Created**: 2025-10-25
**Owner**: Dev 2
**Estimated Effort**: 12-18 hours
**Priority**: Critical (Blocking)

## Quick Navigation

### Start Here
1. **First time?** → [QUICKSTART.md](QUICKSTART.md) - Get running in 30 minutes
2. **Ready to implement?** → [CHECKLIST.md](CHECKLIST.md) - Step-by-step checklist
3. **Need context?** → [README.md](README.md) - Full specification

### Implementation
- [implementation-guide.md](implementation-guide.md) - Detailed phase-by-phase guide
- [marvin-to-medsnap-mapping.md](marvin-to-medsnap-mapping.md) - Reference patterns
- [test-plan.md](test-plan.md) - TDD test requirements

## Document Descriptions

### [README.md](README.md) (17KB)
**Purpose**: Main specification document

**Contents**:
- Problem statement and success criteria
- Architecture overview (directory structure, component hierarchy)
- Implementation plan (6 phases, 18 hours)
- Integration points with Dev 1, 3, 4
- Dependencies and file references
- Testing strategy and acceptance criteria
- Known constraints and risks
- Timeline and success metrics

**Read this for**: Understanding the "what" and "why" of this spec.

### [QUICKSTART.md](QUICKSTART.md) (8KB)
**Purpose**: 30-minute getting-started guide

**Contents**:
- Prerequisites checklist
- Step-by-step setup (0-30 minutes)
- Minimal working example
- Troubleshooting common issues
- Hot reload workflow
- Development loop

**Read this for**: Getting TypeScript building and running in Lens Studio ASAP.

### [CHECKLIST.md](CHECKLIST.md) (14KB)
**Purpose**: Implementation progress tracker

**Contents**:
- Phase-by-phase checkboxes (6 phases)
- TDD workflow reminders (test first, then implement)
- Validation steps for each phase
- Final acceptance criteria
- Sign-off section

**Read this for**: Tracking progress, ensuring nothing is missed.

### [implementation-guide.md](implementation-guide.md) (23KB)
**Purpose**: Detailed step-by-step implementation instructions

**Contents**:
- **Phase 1**: Build system setup (package.json, tsconfig.json)
- **Phase 2**: Type definitions (lens-studio.d.ts, core.ts)
- **Phase 3**: AR system core (MedSnapARSystem, lens-studio-entry)
- **Phase 4**: Components (OverlayManager, Voice, State, Mode)
- **Phase 5**: Network client (APIClient)
- **Phase 6**: Lens Studio integration (import, wire, test)
- Code examples for each file
- Validation steps
- Testing guide
- Troubleshooting

**Read this for**: "How" to implement each component, with code examples.

### [marvin-to-medsnap-mapping.md](marvin-to-medsnap-mapping.md) (22KB)
**Purpose**: Reference guide mapping marvin patterns to MedSnap needs

**Contents**:
- Directory structure comparison
- Component-by-component mapping
- What to copy vs. adapt vs. create from scratch
- Type definition patterns
- Build configuration comparison
- Event handling patterns
- Error handling patterns
- Performance monitoring patterns
- Quick reference table (reuse percentages)

**Read this for**: Understanding what to copy from marvin and what to create new.

### [test-plan.md](test-plan.md) (21KB)
**Purpose**: TDD test requirements and execution log

**Contents**:
- Testing strategy (type-level, build, integration)
- Phase-by-phase test requirements
- Unit test examples (TypeScript/Jest)
- Integration test checklists (Lens Studio)
- Acceptance criteria
- Test execution log templates

**Read this for**: What tests to write BEFORE implementing (TDD).

## Workflow Recommendations

### For First-Time Setup (30 minutes)
```
1. Read QUICKSTART.md
2. Follow steps 0-30
3. Validate system initializes in Lens Studio
4. You're ready to implement!
```

### For Full Implementation (12-18 hours)
```
1. Read README.md for context
2. Open CHECKLIST.md for tracking
3. For each phase:
   a. Read relevant section in implementation-guide.md
   b. Check marvin-to-medsnap-mapping.md for patterns
   c. Read test-plan.md for test requirements
   d. Write tests FIRST (TDD)
   e. Implement code
   f. Run tests until GREEN
   g. Check off items in CHECKLIST.md
4. Complete all 6 phases
5. Run all acceptance tests
6. Sign off in CHECKLIST.md
```

### For Reference During Implementation
```
- Stuck on a component? → marvin-to-medsnap-mapping.md
- Need code example? → implementation-guide.md
- Forgot TDD workflow? → test-plan.md
- Need to debug? → implementation-guide.md troubleshooting section
- Lost track of progress? → CHECKLIST.md
```

## File Locations

All files in: `/Users/jasonyi/snaplens-code/specs/2025-10-25-lens-studio-typescript-integration/`

```
2025-10-25-lens-studio-typescript-integration/
├── INDEX.md                          ← You are here
├── README.md                         ← Main spec
├── QUICKSTART.md                     ← 30-minute setup
├── CHECKLIST.md                      ← Progress tracker
├── implementation-guide.md           ← Step-by-step guide
├── marvin-to-medsnap-mapping.md     ← Pattern reference
└── test-plan.md                      ← TDD requirements
```

## Key Reference Paths

### Marvin Reference (Read-Only)
- Main system: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/main.ts`
- Entry point: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/lens-studio-entry.ts`
- Type defs: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/`
- Overlay manager: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/AROverlays/OverlayManager.ts`
- Build config: `/Users/jasonyi/snaplens-code/marvin/ar-core/tsconfig.json`
- Package config: `/Users/jasonyi/snaplens-code/marvin/ar-core/package.json`

### MedSnap Implementation (To Create)
- Working directory: `/Users/jasonyi/snaplens-code/lens-studio/`
- Source files: `/Users/jasonyi/snaplens-code/lens-studio/src/`
- Build output: `/Users/jasonyi/snaplens-code/lens-studio/dist/`
- Lens Studio project: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj/`

### Documentation
- MedSnap PRD: `/Users/jasonyi/snaplens-code/MedSnap_PRD.md`
- Task list: `/Users/jasonyi/snaplens-code/MedSnap_TaskList_Updated.md`
- Dev instructions: `/Users/jasonyi/snaplens-code/CLAUDE.md`
- Lens Studio API: `/Users/jasonyi/snaplens-code/docs/Lens_Studio_API_Reference.md`

## Success Metrics

When this spec is complete, you will have:

### Infrastructure ✓
- [x] TypeScript build system configured and working
- [x] Type definitions for Lens Studio API
- [x] Core MedSnap types defined
- [x] Build pipeline (tsconfig, package.json)

### Core System ✓
- [x] MedSnapARSystem main coordinator
- [x] Lens Studio entry point with @input wiring
- [x] Scene lifecycle management (OnStart, UpdateEvent, OnDestroy)
- [x] Debug API (global.medSnap)

### Components ✓
- [x] OverlayManager (AR rendering)
- [x] VoiceController (ASR foundation)
- [x] AudioPlayer (TTS playback)
- [x] StateManager (app state)
- [x] ModeManager (mode switching foundation)
- [x] APIClient (backend HTTP)

### Integration ✓
- [x] System initializes in Lens Studio
- [x] All @input components wire correctly
- [x] Update loop runs smoothly (≥30 FPS)
- [x] System disposes cleanly
- [x] Can make API requests

### Developer Experience ✓
- [x] Hot reload works (npm run dev)
- [x] Tests pass (npm test)
- [x] Debug tools accessible
- [x] Documentation complete

### Readiness ✓
- [x] Ready to implement Dev 2 Task 2.1 (Mode Manager)
- [x] Ready to implement Dev 2 Task 2.2 (Patient Card Renderer)
- [x] Ready to implement Dev 2 Task 2.3 (Clinical Mode State Machine)
- [x] Ready to implement Dev 2 Task 2.4 (Prescription UI)

## Estimated vs. Actual Time

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| 1. Build System | 2 hours | _____ | _____ |
| 2. Type Definitions | 2 hours | _____ | _____ |
| 3. AR System Core | 4 hours | _____ | _____ |
| 4. Components | 6 hours | _____ | _____ |
| 5. Network Client | 2 hours | _____ | _____ |
| 6. Integration | 2 hours | _____ | _____ |
| **Total** | **18 hours** | **_____** | **_____** |

## Next Steps After Completion

1. **Update CLAUDE.md**: Add TypeScript workflow section
2. **Create Task 2.1 spec**: Mode Manager full implementation
3. **Begin Dev 2 Task 2.1**: Extend ModeManager.ts
4. **Archive this spec**: Move to `specs/completed/`

## Questions or Issues?

Refer to troubleshooting sections in:
- implementation-guide.md (phase-specific issues)
- test-plan.md (testing issues)
- marvin-to-medsnap-mapping.md (pattern questions)
- QUICKSTART.md (setup issues)

If still stuck, review:
- Marvin reference code directly
- Lens Studio API documentation
- CLAUDE.md development principles (TDD, KISS, YAGNI)

## Sign-Off

**Spec Complete**: ☐ YES ☐ NO
**Date**: __________
**Developer**: __________

**Notes**: _______________________________________________________________

---

**Ready to start?** → [QUICKSTART.md](QUICKSTART.md)
