# Task Breakdown: Clinical Mode AR UI

## Overview
Total Tasks: 32
Estimated Time: 36 hours (Dev 2 responsibilities)
Critical Path Focus: Sarah Chen drug interaction demo

## Task List

### Foundation & Setup

#### Task Group 1: Environment & Configuration
**Dependencies:** None
**Effort:** Small (2 hours)
**Integration Points:** Dev 1 (AR components), Dev 3 (Backend API)

- [ ] 1.0 Complete environment setup and configuration
  - [ ] 1.1 Verify config.js with API endpoints and constants
    - Confirm AR_COLORS, TIMEOUTS, CLINICAL_STATE enums
    - Update API_BASE_URL once Dev 3 provides Railway URL
    - Verify DEMO_MODE flag for fallback testing
  - [ ] 1.2 Create placeholder script files if not existing
    - clinicalMode.js, patientCardRenderer.js
    - prescriptionUI.js, modeManager.js
    - apiClient.js, stateManager.js
  - [ ] 1.3 Set up test infrastructure for Lens Studio scripts
    - Configure Jest or Lens Studio testing tools
    - Create test directory structure
  - [ ] 1.4 Review Spectacles sample code for patterns
    - Voice Playback sample for TTS integration
    - AI Playground for backend communication
    - SpectaclesInteractionKit for animations

**Acceptance Criteria:**
- All script files exist with proper exports
- Config constants accessible globally
- Test runner configured and working
- Sample patterns documented for reference

### API Communication Layer

#### Task Group 2: Backend Integration Client
**Dependencies:** Task Group 1
**Effort:** Medium (4 hours)
**Integration Points:** Dev 3 (All API endpoints)

- [ ] 2.0 Complete API client implementation
  - [ ] 2.1 Write 4-6 focused tests for API client
    - Test HTTP POST to /api/clinical/patient/load
    - Test HTTP POST to /api/clinical/symptom/record
    - Test HTTP POST to /api/clinical/prescription/create
    - Test error handling for network failures
    - Test timeout behavior (3 second limit)
    - Test demo mode fallback responses
  - [ ] 2.2 Implement apiClient.js using RemoteServiceModule
    - Create request builder with proper headers
    - Parse JSON responses
    - Handle network errors gracefully
    - Implement 3-second timeout per FR-42
  - [ ] 2.3 Add demo mode mock responses
    - Mock patient data for Sarah Chen
    - Mock prescription responses with drug interactions
    - Mock TTS audio URLs for testing
  - [ ] 2.4 Create response type definitions
    - PatientResponse interface
    - PrescriptionResponse interface
    - TTSResponse interface
  - [ ] 2.5 Run API client tests and verify pass

**Acceptance Criteria:**
- All 4-6 tests pass
- API calls work with demo mode enabled
- Error handling provides user-friendly messages
- Response parsing handles all expected formats

### State Management

#### Task Group 3: Application State Manager
**Dependencies:** Task Group 1
**Effort:** Small (3 hours)
**Integration Points:** All Dev 2 components

- [ ] 3.0 Complete state management system
  - [ ] 3.1 Write 3-4 focused tests for state manager
    - Test setState and getState operations
    - Test patient data storage and retrieval
    - Test symptom list management
    - Test state persistence during mode switches
  - [ ] 3.2 Implement stateManager.js
    - Global state object for patient data
    - Current mode tracking (IDLE/TRAINING/CLINICAL)
    - Symptom recording array
    - Prescription history
  - [ ] 3.3 Add state reset functionality
    - Clear patient data on mode exit
    - Reset timers and counters
    - Preserve necessary session data
  - [ ] 3.4 Run state manager tests and verify pass

**Acceptance Criteria:**
- All 3-4 tests pass
- State persists correctly during session
- State clears properly on mode exit
- No memory leaks from retained state

### Mode Management

#### Task Group 4: Mode Switching Logic
**Dependencies:** Task Group 3
**Effort:** Medium (4 hours)
**Integration Points:** Dev 1 (Training mode), Clinical components

- [ ] 4.0 Complete mode manager implementation
  - [ ] 4.1 Write 4-5 focused tests for mode manager
    - Test mode switching from IDLE to CLINICAL
    - Test auto-exit from CLINICAL to IDLE
    - Test mode persistence during operations
    - Test cleanup on mode transitions
    - Test concurrent mode prevention
  - [ ] 4.2 Implement modeManager.js
    - Track current mode state
    - Handle mode transition requests
    - Coordinate component activation/deactivation
    - Implement 0.5s fade animations
  - [ ] 4.3 Add auto-exit timers
    - 120-second timer for clinical mode (FR-12a)
    - Timer reset on user interaction
    - Proper cleanup on manual exit
  - [ ] 4.4 Integrate with Dev 1's voice controller
    - Register for wake word events
    - Route commands to appropriate mode
    - Handle mode-specific command filtering
  - [ ] 4.5 Run mode manager tests and verify pass

**Acceptance Criteria:**
- All 4-5 tests pass
- Mode transitions are smooth with fade effects
- Auto-exit works after 120 seconds
- No conflicts with training mode

### Patient Card UI

#### Task Group 5: Patient Card Renderer ⚡ ✅ COMPLETE
**Dependencies:** Task Groups 2, 3
**Effort:** Large (6 hours)
**Integration Points:** Dev 1 (AR overlay system)
**Critical Path:** Required for demo

- [x] 5.0 Complete patient card AR display
  - [x] 5.1 Write 5-6 focused tests for patient card
    - Test card positioning at top_center (0.5, 0.9)
    - Test allergy display with red borders
    - Test medication list rendering
    - Test auto-hide after 10 seconds
    - Test manual recall via voice command
    - Test information hierarchy display
  - [x] 5.2 Create AR text components
    - Text Component for patient name, age, sex
    - Text Component for allergies (red color)
    - Text Component for medications list
    - Text Component for symptoms/vitals
  - [x] 5.3 Implement card positioning
    - ScreenTransform anchors at top 1/3
    - Semi-transparent background (50% opacity)
    - Minimum 18pt font size (FR AR-2)
    - Proper padding and margins
  - [x] 5.4 Add visual styling
    - Red borders for allergy warnings
    - Color coding per AR_COLORS config
    - Fade in/out animations (0.5s)
    - Drop shadow for readability
  - [x] 5.5 Implement auto-hide timer
    - 10-second countdown after display
    - Reset timer on user interaction
    - Manual recall command support
  - [x] 5.6 Add information filtering
    - Show full data by default
    - Filter to medications only
    - Filter to allergies only
    - Filter to history only
  - [x] 5.7 Run patient card tests and verify pass

**Acceptance Criteria:**
- All 5-6 tests pass ✅
- Card displays at correct position ✅
- Allergies prominently shown in red ✅
- Auto-hide works after 10 seconds ✅
- Information hierarchy is clear ✅
- Text is readable at arm's length ✅

### Clinical Mode Core

#### Task Group 6: Clinical State Machine ⚡
**Dependencies:** Task Groups 2, 3, 4, 5
**Effort:** Large (8 hours)
**Integration Points:** All components, Dev 3 APIs
**Critical Path:** Core demo functionality

- [ ] 6.0 Complete clinical mode state machine
  - [ ] 6.1 Write 6-8 focused tests for clinical mode
    - Test patient loading with "start assessment" command
    - Test 3-retry logic for patient not found
    - Test symptom recording workflow
    - Test decision support request
    - Test prescription initiation
    - Test auto-exit after 120 seconds
    - Test voice command routing
    - Test error handling and recovery
  - [ ] 6.2 Implement patient loading workflow
    - Parse patient name from voice command
    - Call /api/clinical/patient/load
    - Handle success with card display
    - Handle failure with 3-retry logic (FR-14a)
    - Offer patient list after 3 failures
  - [ ] 6.3 Implement symptom recording
    - Parse symptom from voice input
    - Call /api/clinical/symptom/record
    - Show green checkmark confirmation
    - Play TTS confirmation
    - Update patient context
  - [ ] 6.4 Implement decision support
    - Aggregate recorded symptoms
    - Call /api/clinical/decision-support
    - Display AI recommendations via TTS
    - Update patient card if needed
  - [ ] 6.5 Implement voice command handlers
    - "Show patient history"
    - "Show medications"
    - "Show allergies"
    - "Repeat instructions"
    - "End assessment"
  - [ ] 6.6 Add state transitions
    - IDLE → LOADING_PATIENT → PATIENT_LOADED
    - PATIENT_LOADED → RECORDING_SYMPTOM
    - PATIENT_LOADED → PRESCRIBING
    - Proper cleanup on each transition
  - [ ] 6.7 Implement inactivity timer
    - 120-second countdown
    - Reset on any interaction
    - Auto-exit with TTS: "Assessment complete"
  - [ ] 6.8 Run clinical mode tests and verify pass

**Acceptance Criteria:**
- All 6-8 tests pass
- Patient loading works with retry logic
- All voice commands functional
- Symptom recording confirmed visually
- Auto-exit after 2 minutes inactivity
- Clean state transitions

### Prescription Workflow

#### Task Group 7: Prescription UI ⚡
**Dependencies:** Task Groups 2, 3, 6
**Effort:** Large (6 hours)
**Integration Points:** Dev 3 (Drug interaction API)
**Critical Path:** Required for Warfarin demo

- [ ] 7.0 Complete prescription UI implementation
  - [ ] 7.1 Write 5-6 focused tests for prescription UI
    - Test medication/dosage parsing from voice
    - Test success state with green checkmark
    - Test drug interaction warning display
    - Test alternative medication suggestions
    - Test "Show available medications" command
    - Test auto-hide after 5 seconds
  - [ ] 7.2 Implement voice parsing
    - Extract medication name
    - Extract dosage information
    - Handle ambiguous input
    - Validate against known medications
  - [ ] 7.3 Create prescription API integration
    - Call /api/clinical/prescription/create
    - Parse response for safety warnings
    - Extract alternative suggestions
    - Handle unknown medication errors
  - [ ] 7.4 Implement success UI
    - Green checkmark animation
    - "PENDING PHYSICIAN APPROVAL" badge
    - Auto-hide after 5 seconds
    - TTS confirmation playback
  - [ ] 7.5 Implement warning UI ⚡
    - Full-screen red border overlay
    - Red X icon
    - Warning message display
    - Alternative medication list
    - Require voice acknowledgment
  - [ ] 7.6 Add medication list display
    - Show 7-10 available medications
    - Triggered by voice command
    - Include dosage guidelines
    - Auto-hide after viewing
  - [ ] 7.7 Run prescription tests and verify pass

**Acceptance Criteria:**
- All 5-6 tests pass
- Warfarin + Ibuprofen shows warning ⚡
- Alternatives suggested (Acetaminophen)
- Success state shows pending badge
- Unknown medications handled gracefully
- Auto-hide works correctly

### Integration & Polish

#### Task Group 8: Component Integration
**Dependencies:** All previous groups
**Effort:** Medium (4 hours)
**Integration Points:** Dev 1 (Voice/AR), Dev 3 (Backend)

- [ ] 8.0 Complete component integration
  - [ ] 8.1 Integrate clinical mode with patient card
    - Connect state changes to card updates
    - Ensure proper data flow
    - Test card display timing
  - [ ] 8.2 Integrate clinical mode with prescription UI
    - Connect prescription commands
    - Ensure UI updates on API responses
    - Test warning display flow
  - [ ] 8.3 Connect mode manager to all components
    - Proper activation/deactivation
    - State cleanup on mode switches
    - Animation coordination
  - [ ] 8.4 Integrate with Dev 1's voice controller
    - Register command handlers
    - Route wake word commands
    - Handle in-session commands
  - [ ] 8.5 Add TTS audio playback
    - AudioComponent integration
    - Play API response audio
    - Queue management for multiple responses

**Acceptance Criteria:**
- All components communicate properly
- State flows correctly between components
- Voice commands trigger correct actions
- TTS audio plays at right times
- No race conditions or conflicts

### Demo Preparation

#### Task Group 9: Sarah Chen Demo Flow ⚡
**Dependencies:** Task Group 8
**Effort:** Small (2 hours)
**Critical Path:** Essential for hackathon presentation

- [ ] 9.0 Complete demo scenario testing
  - [ ] 9.1 Test complete Sarah Chen flow
    - "Hey MedSnap, start assessment Sarah Chen"
    - Patient card shows Warfarin medication
    - "Record symptom: chest tightness"
    - "Prescribe Ibuprofen 400mg"
    - Drug interaction warning appears
    - Alternative suggestion shown
  - [ ] 9.2 Verify timing and performance
    - <3 second voice response
    - ≥30 FPS during rendering
    - Smooth animations
    - Clear TTS audio
  - [ ] 9.3 Create fallback demo mode
    - Works without backend connection
    - Mock responses for all commands
    - Predictable demo flow
  - [ ] 9.4 Practice mode switching
    - Clinical to idle transitions
    - Recovery from errors
    - Graceful degradation

**Acceptance Criteria:**
- Complete demo runs without errors
- Drug interaction warning clearly visible
- All timings meet requirements
- Demo mode works as backup
- 3-minute presentation ready

## Execution Order

Recommended implementation sequence:
1. **Hours 0-2**: Task Group 1 (Setup)
2. **Hours 2-6**: Task Group 2 (API Client)
3. **Hours 6-9**: Task Group 3 (State Manager)
4. **Hours 9-13**: Task Group 4 (Mode Manager)
5. **Hours 13-19**: Task Group 5 (Patient Card) ⚡ ✅ COMPLETE
6. **Hours 19-27**: Task Group 6 (Clinical Mode) ⚡
7. **Hours 27-33**: Task Group 7 (Prescription UI) ⚡
8. **Hours 33-37**: Task Group 8 (Integration)
9. **Hours 37-39**: Task Group 9 (Demo Testing) ⚡

## Critical Success Factors

### Must-Have for Demo (⚡ marked tasks)
- Patient card displays Sarah Chen with Warfarin ✅
- Voice commands work for assessment and prescription
- Drug interaction warning shows for Ibuprofen
- Alternative medication suggested
- Clean mode transitions

### Performance Requirements
- Voice response: <3 seconds (FR-42)
- AR rendering: ≥30 FPS (FR-41)
- Patient card auto-hide: 10 seconds (FR-13) ✅
- Clinical auto-exit: 120 seconds (FR-12a)
- Prescription UI auto-hide: 5 seconds (FR-26)

### Integration Checkpoints
- **Hour 12**: Coordinate with Dev 1 on voice controller integration
- **Hour 24**: Test with Dev 3's backend APIs
- **Hour 36**: Full system integration test
- **Hour 42**: Demo rehearsal with all developers

## Testing Strategy

### Unit Testing (Per Component)
- 3-8 focused tests per component maximum
- Test critical paths only
- Skip edge cases unless demo-critical
- Run only component tests during development

### Integration Testing (Hour 33+)
- Test complete user workflows
- Verify component communication
- Check timing and performance
- Ensure demo scenario works

### Demo Testing (Hour 37+)
- Run through presentation script
- Test fallback/demo mode
- Verify all visual elements
- Practice error recovery

## Risk Mitigation

### High Risk Items
1. **Backend API availability**: Implement demo mode early
2. **Voice recognition accuracy**: Prepare scripted commands
3. **Drug interaction display**: Test Warfarin scenario thoroughly
4. **Timing/performance**: Profile and optimize critical paths

### Contingency Plans
- Demo mode with mock data if backend fails
- Pre-recorded demo video as ultimate backup
- Scripted voice commands for predictable flow
- Simplified UI if performance issues arise