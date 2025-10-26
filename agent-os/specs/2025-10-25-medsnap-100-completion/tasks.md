# Task Breakdown: MedSnap 100% PRD Completion

## Overview
Total Tasks: 32
Current State: 75-80% complete
Completion Target: 100% PRD compliance in 8-12 hours

## Execution Summary

### Critical Path (Must Complete)
1. Training Mode Implementation (20% → 100%)
2. ASR Integration (Complete wake word detection)
3. External API Connections
4. Hardware Deployment & Testing

### Dependencies Flow
```
Hand Tracking Setup → Training Mode Logic → ASR Integration → API Connection → Hardware Deploy → Performance Testing
```

## Task List

### Training Mode Implementation

#### Task Group 1: Hand Tracking & CV Integration
**Priority:** HIGH | **Time:** 2-3 hours
**Dependencies:** SpectaclesInteractionKit.lspkg already available

- [ ] 1.0 Complete hand tracking integration for pulse training
  - [ ] 1.1 Write 3-5 focused tests for hand tracking integration
    - Test wrist detection with HandInputData provider
    - Test finger position validation
    - Test pressure detection heuristics
  - [ ] 1.2 Integrate HandInputData from SpectaclesInteractionKit
    - Use existing hand tracking asset (4.2MB)
    - Map 21 hand landmarks to wrist position (landmark #0)
    - Set confidence threshold to 0.7
  - [ ] 1.3 Implement wrist detection logic
    - Extract wrist position from hand landmarks
    - Calculate orientation for proper angle
    - Track approach velocity for pressure estimation
  - [ ] 1.4 Create AR overlay positioning
    - Position cyan circle (#00FFFF, 50% opacity) on radial pulse point
    - Add yellow directional arrow (#FFFF00) for finger guidance
    - Implement fade in/out animations (300ms)
  - [ ] 1.5 Run hand tracking tests
    - Verify wrist detection accuracy > 80%
    - Confirm overlay positioning correctness
    - Test with multiple hand positions

**Acceptance Criteria:**
- Hand tracking detects wrist with >80% accuracy
- AR overlays render at correct positions
- Smooth tracking at 30+ FPS

#### Task Group 2: Training Mode State Machine
**Priority:** HIGH | **Time:** 1-2 hours
**Dependencies:** Task Group 1

- [ ] 2.0 Complete training mode workflow logic
  - [ ] 2.1 Write 3-5 tests for training state machine
    - Test state transitions through all 7 steps
    - Test error handling and retry logic
    - Test auto-exit after 10 seconds
  - [ ] 2.2 Implement 7-step training sequence
    - Step 1: "Starting pulse taking training..."
    - Step 2: "Wrist detected. Position fingers..."
    - Step 3: "Good position. Apply gentle pressure..."
    - Step 4: "Count beats for 15 seconds..."
    - Step 5: "Time. What was your count?"
    - Step 6: Process BPM response and validate
    - Step 7: "Training complete" and auto-exit
  - [ ] 2.3 Add corrective feedback logic
    - "Move 2cm toward thumb" for position errors
    - "Lighten your touch" for excess pressure
    - "Try again with firmer pressure" for unusual readings
  - [ ] 2.4 Implement retry logic (FR-10a)
    - Auto-retry for 10 seconds on CV failure
    - Offer manual skip after retry timeout
    - Graceful degradation without blocking
  - [ ] 2.5 Run training mode tests
    - Verify all 7 steps execute correctly
    - Test error recovery paths
    - Confirm auto-exit timing

**Acceptance Criteria:**
- All 7 training steps execute in sequence
- Corrective feedback triggers appropriately
- Auto-exit works after 10 seconds of inactivity

### Voice Integration

#### Task Group 3: ASR & Wake Word Detection
**Priority:** HIGH | **Time:** 1-2 hours
**Dependencies:** ASRButtonRecorder.ts exists

- [ ] 3.0 Complete ASR integration with wake word
  - [ ] 3.1 Write 3-5 tests for wake word detection
    - Test "Hey MedSnap" recognition
    - Test session vs in-session command routing
    - Test audio beep confirmation timing
  - [ ] 3.2 Implement wake word detection
    - Configure ASR for "Hey MedSnap" keyword
    - Add 100-200ms audio beep on detection
    - Route to session initialization
  - [ ] 3.3 Configure in-session commands
    - Remove wake word requirement after session start
    - Keep active listening for 30 seconds
    - Add visual microphone indicator
  - [ ] 3.4 Connect ASR to mode managers
    - Wire ASR output to trainingMode.handleCommand()
    - Wire ASR output to clinicalMode.handleVoiceCommand()
    - Handle mode switching commands
  - [ ] 3.5 Run ASR integration tests
    - Test wake word detection accuracy
    - Verify command routing works
    - Confirm beep plays within 200ms

**Acceptance Criteria:**
- Wake word detection works reliably
- In-session commands don't require wake word
- Audio confirmation plays within 200ms

### Backend API Integration

#### Task Group 4: External API Connections
**Priority:** HIGH | **Time:** 1-2 hours
**Dependencies:** API keys available in .env

- [ ] 4.0 Connect external AI/TTS services
  - [ ] 4.1 Write integration tests for external APIs
    - Test Gemini API connection
    - Test Fish Audio TTS generation
    - Test Letta context management
  - [ ] 4.2 Configure Gemini API integration
    - Update GEMINI_API_KEY with real key
    - Implement geminiService.ts with actual API calls
    - Add error handling and retry logic
  - [ ] 4.3 Configure Fish Audio TTS
    - Update FISH_AUDIO_API_KEY with real key
    - Implement fishAudioService.ts
    - Add response caching for common phrases
  - [ ] 4.4 Configure Letta context wrapper
    - Set up 20-turn/4000-token window
    - Implement context compression
    - Test with multi-turn conversations
  - [ ] 4.5 Implement Supabase connection
    - Update SUPABASE_URL and SUPABASE_KEY
    - Test patient data queries
    - Verify prescription logging
  - [ ] 4.6 Run API integration tests
    - Verify all external APIs connect
    - Test error handling and fallbacks
    - Measure response times

**Acceptance Criteria:**
- All external APIs connect successfully
- Response times meet targets (<3s voice, <1.5s TTS)
- Error handling works gracefully

#### Task Group 5: Backend Endpoint Implementation
**Priority:** HIGH | **Time:** 1-2 hours
**Dependencies:** Task Group 4

- [ ] 5.0 Complete remaining API endpoints
  - [ ] 5.1 Implement training endpoints
    - POST /api/training/start
    - POST /api/training/feedback
    - Add mock responses for demo mode
  - [ ] 5.2 Implement clinical endpoints
    - POST /api/clinical/patient/load (enhance existing)
    - POST /api/clinical/symptom/record
    - POST /api/clinical/decision-support
  - [ ] 5.3 Implement utility endpoints
    - POST /api/voice/command (intent extraction)
    - POST /api/tts/generate (with caching)
    - Add performance monitoring
  - [ ] 5.4 Add drug interaction logic
    - Implement Warfarin + Ibuprofen check
    - Return HIGH severity warning
    - Suggest Acetaminophen alternative
  - [ ] 5.5 Test all endpoints
    - Run integration tests
    - Verify response formats
    - Check error handling

**Acceptance Criteria:**
- All 8 API endpoint families working
- Drug interaction checking returns correct warnings
- Response times meet performance targets

### Hardware Deployment

#### Task Group 6: Spectacles Deployment
**Priority:** CRITICAL | **Time:** 1-2 hours
**Dependencies:** Tasks 1-5 complete

- [ ] 6.0 Deploy to Snap Spectacles hardware
  - [ ] 6.1 Build Lens Studio project
    - Compile all scripts
    - Package assets
    - Generate deployment build
  - [ ] 6.2 Deploy to Spectacles
    - Connect Spectacles via Lens Studio
    - Upload build to device
    - Verify successful installation
  - [ ] 6.3 Configure network settings
    - Set backend URL to deployed server
    - Test API connectivity from device
    - Verify TTS audio playback
  - [ ] 6.4 Test core workflows on device
    - Training mode with hand tracking
    - Clinical mode with Sarah Chen
    - Voice commands with ASR
  - [ ] 6.5 Optimize for hardware constraints
    - Adjust CV frame rate if needed
    - Optimize AR rendering
    - Monitor battery usage

**Acceptance Criteria:**
- App runs on actual Spectacles hardware
- All features work on device
- Performance meets targets (30+ FPS)

### Integration Testing

#### Task Group 7: End-to-End Validation
**Priority:** HIGH | **Time:** 1-2 hours
**Dependencies:** Task Group 6

- [ ] 7.0 Complete integration testing
  - [ ] 7.1 Test training mode flow
    - Complete pulse taking procedure
    - Verify all 7 steps work
    - Test with 3 different users
  - [ ] 7.2 Test clinical mode flow
    - Load Sarah Chen patient
    - Record chest tightness symptom
    - Get AI clinical suggestions
  - [ ] 7.3 Test prescription workflow
    - Attempt Ibuprofen prescription
    - Verify drug interaction warning
    - Confirm Acetaminophen suggestion
  - [ ] 7.4 Test mode switching
    - Switch from training to clinical
    - Test auto-exit behaviors
    - Verify state cleanup
  - [ ] 7.5 Performance validation
    - Measure voice response times
    - Check AR rendering FPS
    - Verify TTS latency

**Acceptance Criteria:**
- All workflows complete successfully
- Performance meets PRD requirements
- No blocking bugs or crashes

### Demo Preparation

#### Task Group 8: Demo Optimization
**Priority:** HIGH | **Time:** 1 hour
**Dependencies:** Task Group 7

- [ ] 8.0 Prepare for live demonstration
  - [ ] 8.1 Run demo script 5+ times
    - Practice 3-minute presentation
    - Test all demo points
    - Identify potential issues
  - [ ] 8.2 Optimize demo flow
    - Cache common TTS responses
    - Pre-load Sarah Chen data
    - Minimize latency points
  - [ ] 8.3 Create fallback options
    - Record demo video backup
    - Prepare mock responses if APIs fail
    - Have backup Spectacles ready
  - [ ] 8.4 Final polish
    - Clean up debug output
    - Optimize visual transitions
    - Test in demo environment
  - [ ] 8.5 Team rehearsal
    - Practice handoffs
    - Coordinate presentation
    - Time each section

**Acceptance Criteria:**
- Demo runs smoothly in 3 minutes
- All key features demonstrated
- Fallback options ready

## Execution Order

### Phase 1: Core Implementation (Hours 0-4)
1. Task Group 1: Hand Tracking Integration
2. Task Group 2: Training Mode Logic
3. Task Group 3: ASR Integration (parallel)

### Phase 2: Backend Connection (Hours 4-6)
4. Task Group 4: External APIs
5. Task Group 5: Backend Endpoints

### Phase 3: Hardware Deploy (Hours 6-8)
6. Task Group 6: Spectacles Deployment
7. Task Group 7: Integration Testing

### Phase 4: Demo Ready (Hours 8-10)
8. Task Group 8: Demo Optimization

### Buffer Time (Hours 10-12)
- Bug fixes
- Performance tuning
- Additional rehearsals

## Success Metrics

### Must Have (100% Required)
- Training mode complete with hand tracking
- Voice commands working with wake word
- Sarah Chen demo flow executes perfectly
- Drug interaction warning displays correctly
- Runs on actual Spectacles hardware
- 3-minute demo ready

### Should Have (Target 90%)
- All 7 training steps with feedback
- TTS audio playing clearly
- AR overlays stable and positioned correctly
- Performance at 30+ FPS consistently
- Auto-exit behaviors working

### Nice to Have (If Time Permits)
- Multiple patient demos
- Additional drug interactions
- Performance optimizations
- Polish animations

## Risk Mitigation

### High Risks
1. **Hand tracking accuracy**: Use confidence threshold 0.7, add manual skip
2. **API latency**: Implement aggressive caching, use demo mode fallback
3. **Hardware issues**: Have backup Spectacles, record demo video
4. **Voice recognition**: Test in quiet environment, have manual triggers

### Medium Risks
1. **Integration bugs**: Allocate 2-hour buffer for fixes
2. **Performance issues**: Reduce CV to 15 FPS if needed
3. **Network issues**: Use local mock data if APIs unavailable

## Team Coordination

### Critical Handoffs
- Hand tracking to training mode (Hour 2)
- ASR to mode managers (Hour 3)
- Backend APIs ready (Hour 5)
- Hardware deployment (Hour 6)

### Communication Points
- Hourly status updates
- Immediate escalation of blockers
- Demo rehearsal at Hour 8
- Final run-through at Hour 10

## Definition of Done

### Feature Complete
- [ ] Training mode works end-to-end
- [ ] Clinical mode loads patients
- [ ] Prescription warnings display
- [ ] Voice commands execute
- [ ] Runs on Spectacles

### Demo Ready
- [ ] 3-minute script rehearsed
- [ ] All acceptance criteria met
- [ ] Fallback options prepared
- [ ] Team aligned on presentation

### PRD Compliance
- [ ] All FR requirements implemented
- [ ] Performance targets met
- [ ] Success metrics achieved
- [ ] Known issues documented