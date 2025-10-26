# Clinical Mode AR UI - Requirements Answers

## Design Decisions Based on MedSnap PRD Analysis

### 1. AR Patient Card Positioning
**Decision**: Top 1/3 of screen (top_center)
- Matches PRD specifications (FR-13, AR-3)
- Avoids obstructing patient view
- Consistent with API response configuration

### 2. Visual Theme
**Decision**: Standard AR color scheme per PRD (AR-1)
- Cyan (#00FFFF) at 50% opacity - interactive elements
- Yellow (#FFFF00) - directional indicators
- Red (#FF0000) - warnings
- Green (#00FF00) - success confirmations
- Semi-transparent background (50% opacity) for patient cards

### 3. Information Hierarchy
**Decision**: Prioritized display per FR-13
1. Allergies (red warning borders) - most prominent
2. Current medications
3. Chief complaint & symptoms
4. Vital signs
5. Diagnosis history (last 3 visits)

### 4. Prescription Warnings
**Decision**: Full safety system per FR-24
- Full-screen overlay with red borders
- Audio alert tone before TTS warning
- Require explicit voice acknowledgment ("Understood")
- Block prescription until acknowledged

### 5. Symptom Recording Feedback
**Decision**: Minimal confirmation per FR-15, FR-30
- Green checkmark animation (2 seconds)
- Voice confirmation: "Symptom recorded"
- No running list display (maintain clean interface)

### 6. Prescription Success State
**Decision**: Per FR-26
- Green checkmark with "PENDING PHYSICIAN APPROVAL" badge
- Auto-hide after 5 seconds
- Voice command "Show prescriptions" to review history

### 7. Mode Transitions
**Decision**: Per FR-5a, FR-12a
- 0.5 second fade animation
- Mode name displayed briefly (2 seconds)
- Persistent mode indicator (small icon, bottom-right corner)

### 8. Scope Exclusions
**Decision**: Per PRD Non-Goals (NG-1 through NG-12)
- No vital sign OCR (skip on failure per FR-17a)
- No multi-patient sessions
- No advanced visualizations
- No EHR integration
- No HIPAA compliance features
- No offline mode

## Code Reuse Strategy

### From Spectacles Samples
- `Voice Playback/ASRButtonRecorder.ts` - ASR integration pattern
- `AI Music Gen/HandDockedMenu.ts` - AR positioning logic
- `AI Playground/AIAssistantUIBridge.ts` - Backend API communication
- `SpectaclesInteractionKit/animate` - Transition animations

### From Current Project
- `Assets/Scripts/ASRButtonRecorder.ts` - Wake word detection
- `Assets/Scripts/SupabaseUploader.ts` - API patterns
- `Assets/Scripts/MicrophoneRecorder.ts` - Audio feedback

### Key Lens Studio APIs
- `Text Component` - AR text overlays (18pt minimum)
- `AudioComponent` - TTS playback
- `ScreenTransform` - Patient card positioning
- `RemoteServiceModule` - Backend API calls

## Implementation Principles

### KISS (Keep It Simple)
- 7-10 medication database only
- Simple mock responses for demo mode
- Graceful degradation on failures
- No over-engineering

### TDD (Test-Driven Development)
- Write tests BEFORE implementation
- Commit tests first
- Implement minimum code to pass tests
- No implementation without tests

### YAGNI (You Aren't Gonna Need It)
- Only implement FR-12 through FR-31 features
- No future-proofing
- No extra features beyond PRD scope
- If not in MedSnap_TaskList_Updated.md Dev 2 tasks, don't build it

## Performance Targets
- AR rendering: ≥30 FPS (FR-41)
- Voice response: <3 seconds (FR-42)
- CV detection: <500ms (FR-43)
- TTS generation: <1.5 seconds (FR-44)
- Cache hit rate: >50% for common phrases

## Demo Requirements
- Sarah Chen patient with Warfarin medication
- Warfarin + Ibuprofen interaction demo
- 3-minute presentation flow
- All core voice commands working
- Hands-free operation throughout