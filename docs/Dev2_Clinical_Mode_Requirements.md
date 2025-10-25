# Dev 2: Clinical Mode Requirements (Extracted from PRD)

**Source**: MedSnap_PRD.md Sections 4.3, 4.4, 4.5, 4.6, 6.1, 4.9
**Version**: 1.0
**Date**: October 24, 2025
**Developer**: Dev 2 - Clinical Mode & Prescription UI

---

## Overview

This document extracts all functional requirements relevant to Dev 2's scope from the MedSnap PRD. These requirements cover Clinical Mode patient assessment, clinical decision support, prescription writing with drug safety checks, and AR visual design specifications.

**Your Responsibilities (Dev 2 Tasks Only)**:
- Clinical Mode state machine (clinicalMode.js)
- Patient Card Renderer (patientCardRenderer.js)
- Prescription UI (prescriptionUI.js)
- Mode Manager (modeManager.js)

---

## 4.3 Clinical Mode - Patient Assessment

### FR-12: Clinical Mode Activation
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Activate clinical mode via voice command with patient name/ID.

**Voice Command**: "Hey MedSnap, start assessment [patient name or ID]"

**Specifications**:
- Wake word "Hey MedSnap" required for session initiation
- Patient name/ID parsed from voice command
- Triggers patient data load from backend

**Acceptance Criteria**:
- ✅ Voice command recognized with "Hey MedSnap" wake word
- ✅ Patient name extracted correctly
- ✅ Backend API called: POST `/api/clinical/patient/load`

**Test Scenarios**:
1. Say "Hey MedSnap, start assessment Sarah Chen" → Clinical mode activates, Sarah Chen data loads
2. Say "start assessment Sarah Chen" (no wake word) → Command ignored (wake word required)

**Dependencies**:
- Dev 1: Wake word detection (handoff at Hour 12)
- Dev 3: Backend patient load API (handoff at Hour 24)

---

### FR-12a: Clinical Mode Exit
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Exit clinical mode via voice or inactivity timeout.

**Exit Methods**:
1. **Voice exit**: "Hey MedSnap, end assessment"
2. **Auto-exit**: 2 minutes (120 seconds) of inactivity

**Specifications**:
- Clear patient data from AR overlays
- Return to idle state
- Voice confirmation: "Assessment complete."

**Acceptance Criteria**:
- ✅ Voice exit command works immediately
- ✅ Inactivity timer triggers after 120s
- ✅ Patient data cleared from memory
- ✅ TTS confirmation played

**Test Scenarios**:
1. Say "Hey MedSnap, end assessment" → Immediate exit with voice confirmation
2. Load patient, wait 120s → Auto-exit with confirmation

---

### FR-12b: Mode Switching
**Priority**: P1 (Should Have)
**Complexity**: Low

**Description**: Switch between modes without explicit exit.

**Voice Command**: "Hey MedSnap, start [mode]"

**Specifications**:
- Automatically end current mode
- Start new mode
- No explicit exit command required

**Example**:
- User in Training Mode → Says "Hey MedSnap, start assessment Sarah Chen" → Training Mode exits, Clinical Mode starts

**Acceptance Criteria**:
- ✅ Direct mode switching works without manual exit
- ✅ Previous mode data cleared
- ✅ New mode activates successfully

---

### FR-13: Patient Card Display
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Display patient information card in AR overlay.

**Display Priority Order**:
1. Patient name, age, sex
2. Chief complaint (reason for current visit)
3. Current symptoms
4. Diagnosis history (last 3 visits)
5. Current vital signs (latest readings)
6. Medication list
7. **Allergies** (prominently displayed in RED)

**AR Positioning** (per AR-3):
- Location: Top 1/3 of visual field
- Alignment: Centered horizontally
- Purpose: Avoid obstructing patient view

**Specifications**:
- Font: Sans-serif, minimum 18pt (per AR-2)
- **Allergies**: Red text (#FF0000 per AR-1)
- Background: Semi-transparent dark overlay
- Animation: Fade in 300ms (per AR-4)
- Auto-hide: After 10 seconds (configurable in ar_config)
- Manual recall: Voice command "Show allergies" or "Show medications"

**Acceptance Criteria**:
- ✅ Card renders within 500ms of patient load
- ✅ Allergies displayed prominently in red
- ✅ Auto-dismisses after 10s
- ✅ Recalls on voice command

**Test Scenarios**:
1. Load Sarah Chen → Card shows "Allergies: Penicillin" in red at top 1/3
2. Wait 10s → Card auto-hides
3. Say "Show allergies" → Card reappears with allergies highlighted

**Reference Implementation**:
- See: `Spectacles-Sample/AI Playground/` for AR text rendering
- File: `lens-studio/Public/Scripts/ui/patientCardRenderer.js` (Task 2.2)

---

### FR-14: Patient Lookup Error Handling
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Handle patient not found scenario.

**Voice Response**: "Patient not found. Please repeat patient name."

**Acceptance Criteria**:
- ✅ Unknown patient name → Error message via TTS
- ✅ User can retry immediately

**Test Scenarios**:
1. Say "Hey MedSnap, start assessment Unknown Person" → TTS: "Patient not found. Please repeat patient name."

---

### FR-14a: Patient Lookup Retry Logic
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Retry logic for failed patient lookups.

**Retry Behavior**:
- Allow up to **3 attempts** for patient name
- After 3 failures: Offer patient list or cancel assessment

**Voice Response After 3 Failures**:
"Unable to find patient after 3 attempts. Would you like to hear the patient list, or cancel the assessment?"

**Acceptance Criteria**:
- ✅ 3 failed attempts → Offer patient list
- ✅ Patient list voice command available

**Test Scenarios**:
1. Fail patient lookup 3x → System offers patient list

---

### FR-15: Clinical Mode Voice Commands
**Priority**: P0 (Must Have)
**Complexity**: High

**Description**: Voice command processing for clinical workflow.

**Command Categories**:

#### Session-Initiating (Requires Wake Word "Hey MedSnap"):
1. "Hey MedSnap, start assessment [patient name]" - Load patient record
2. "Hey MedSnap, end assessment" - Exit clinical mode

#### In-Session (No Wake Word Required):
1. "Record symptom: [description]" - Add symptom to patient notes
2. "Show patient history" - Display diagnosis history (default if ambiguous)
3. "Show medications" - Display current medication list
4. "Show allergies" - Display allergy information
5. "Prescribe [medication] [dosage]" - Initiate prescription workflow
6. "Repeat instructions" - Replay last voice prompt

**ASR Configuration**:
- Mode: HighAccuracy (for medical terminology)
- Language: English (US)
- Confidence threshold: 0.8 minimum

**Specifications**:
- Wake word distinguishes session start/end from in-session commands
- In-session commands processed immediately (no wake word)
- All responses via Fish Audio TTS
- Response time target: <3s (FR-42)

**Acceptance Criteria**:
- ✅ Wake word required for session commands
- ✅ No wake word for in-session commands
- ✅ Medical terms transcribed accurately (≥90%)
- ✅ TTS confirmation within 1.5s (FR-44)

**Test Scenarios**:
1. Say "Hey MedSnap, start assessment Sarah Chen" → Session starts (wake word)
2. Say "Show medications" (in-session) → Medications displayed (no wake word)
3. Say "Record symptom: chest pain" → Symptom recorded

**Dependencies**:
- Dev 1: Wake word detection + voice router (Hour 12 handoff)
- Dev 3: Backend command routing (Hour 24 handoff)

**Reference Implementation**:
- See: `Spectacles-Sample/Voice Playback/` for ASR integration
- File: `lens-studio/Public/Scripts/clinical/clinicalMode.js` (Task 2.3)

---

### FR-16: Vital Sign Monitor Reading (Out of Scope for Dev 2)
**Priority**: P1 (Should Have)
**Complexity**: High

**Note**: This is **Dev 4's responsibility** (Computer Vision). Dev 2 will receive vital sign data from backend API.

**What Dev 2 Needs**:
- API endpoint: GET `/api/clinical/vitals/:patient_id`
- Response format:
```json
{
  "bp": "118/76",
  "hr": 88,
  "o2": 97,
  "temp": 101.5
}
```

---

### FR-17 & FR-17a: Vital Sign Retry Logic (Out of Scope for Dev 2)
**Note**: Computer vision retry handled by Dev 4. Dev 2 will handle API timeout/retry for backend calls.

---

## 4.4 Clinical Decision Support

### FR-18: Clinical Suggestions
**Priority**: P1 (Should Have)
**Complexity**: High

**Description**: Analyze symptoms and vitals to provide clinical suggestions.

**Input**: Symptoms + vital signs
**Output**:
- Possible diagnoses with confidence
- Recommended next steps or protocols
- Relevant warnings or alerts

**Specifications**:
- Powered by Gemini API (via Letta wrapper)
- Context window: 20 turns / 4000 tokens (FR-4a)
- TTS delivery via Fish Audio
- Response time: <3s (FR-42)

**Acceptance Criteria**:
- ✅ Symptom analysis returns suggestions
- ✅ Suggestions delivered via TTS
- ✅ Response within 3s

**Test Scenarios**:
1. Record symptom "chest tightness, fever 101.5" → System suggests upper respiratory infection

**Dependencies**:
- Dev 3: Gemini + Letta integration (Hour 24+ handoff)

**Note**: For Task 2.0-2.4, Dev 2 will use **demo mode** with mock responses. Real AI integration happens post-Hour 24.

---

### FR-19: Clinical Decision Scenarios
**Priority**: P1 (Should Have)
**Complexity**: High

**Pre-Defined Scenarios for MVP**:

#### Scenario 1 - Respiratory Infection
- **Input**: Fever 101.5°F, dry cough, fatigue, chest tightness
- **Output**: "Symptoms suggest upper respiratory infection. Recommend: chest auscultation, check for wheezing. Monitor O2 saturation. Consider viral vs bacterial - if persistent beyond 7 days or worsening, consult for possible antibiotic therapy."

#### Scenario 2 - Hypertension Alert
- **Input**: BP 148/94, patient on Lisinopril 10mg
- **Output**: "Elevated blood pressure detected. Patient history shows hypertension diagnosis. Current medication: Lisinopril 10mg daily. Recommendation: Verify medication compliance, consider dosage adjustment. Recheck BP in 15 minutes. If remains elevated, consult physician for treatment modification."

#### Scenario 3 - Drug Interaction Warning
- **Input**: Patient on Warfarin, nurse attempts to prescribe Ibuprofen
- **Output**: "WARNING: Drug interaction detected. Ibuprofen increases bleeding risk with Warfarin. Recommend acetaminophen instead. Dosage: 500mg every 6 hours as needed for pain. Consult physician before prescribing NSAIDs."

**Implementation Note**: These scenarios are handled by backend AI. Dev 2 displays the TTS + AR UI only.

---

### FR-20: TTS Delivery for Clinical Suggestions
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Deliver clinical suggestions via Fish Audio TTS.

**Voice Characteristics**:
- Professional, calm tone
- Clear enunciation for medical terms
- Moderate speaking pace

**Specifications**:
- API: Fish Audio TTS
- Latency target: <1.5s (FR-44)
- Caching: Pre-generate common responses for <500ms playback (FR-44a)

**Acceptance Criteria**:
- ✅ TTS audio plays within 1.5s
- ✅ Medical terms pronounced correctly

**Dependencies**:
- Dev 3: Fish Audio API integration (Hour 18+ handoff)

**Demo Mode**: Use local MP3 files for TTS simulation

---

## 4.5 Prescription Writing & Drug Safety

### FR-21: Prescription Voice Command
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Log prescriptions via voice command.

**Voice Command**: "Prescribe [medication name] [dosage]"

**Examples**:
- "Prescribe Amoxicillin 500mg"
- "Prescribe Acetaminophen 500 milligrams"
- "Prescribe Lisinopril 10mg"

**Specifications**:
- In-session command (no wake word required)
- Triggers drug safety check (FR-23)
- API call: POST `/api/clinical/prescription/create`

**Request Body**:
```json
{
  "patient_id": "DEMO_001",
  "medication": "Amoxicillin",
  "dosage": "500mg"
}
```

**Acceptance Criteria**:
- ✅ Voice command parsed correctly
- ✅ Medication name + dosage extracted
- ✅ API called with correct payload

**Test Scenarios**:
1. Say "Prescribe Acetaminophen 500mg" → Prescription logged successfully
2. Say "Prescribe Ibuprofen 200mg" (patient on Warfarin) → Blocked with warning

**Reference Implementation**:
- File: `lens-studio/Public/Scripts/clinical/clinicalMode.js` (Task 2.3)

---

### FR-22: Medication Database
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Maintain database of 5-10 common medications.

**Supported Medications** (per KISS principle):
1. Amoxicillin (antibiotic)
2. Azithromycin (antibiotic)
3. Acetaminophen (pain reliever)
4. Ibuprofen (NSAID)
5. Lisinopril (hypertension)
6. Metformin (diabetes)
7. Omeprazole (acid reflux)
8. Warfarin (anticoagulant)

**Storage**:
- Backend: Hardcoded list in `/backend/src/data/medications.js`
- No external drug database API (YAGNI)

**Acceptance Criteria**:
- ✅ 8 medications supported
- ✅ Case-insensitive matching

**Test Scenarios**:
1. Prescribe "amoxicillin" → Matched to "Amoxicillin"
2. Prescribe "tylenol" → Not found (use "Acetaminophen")

---

### FR-22a: Unknown Medication Handling
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Handle requests for medications not in database.

**Voice Response**: "Medication not found in database. Please verify spelling or select from available medications."

**Follow-up Command**: "Show available medications" → Lists 8 supported drugs

**Acceptance Criteria**:
- ✅ Unknown medication → Error message
- ✅ "Show available medications" lists all 8

**Test Scenarios**:
1. Say "Prescribe Aspirin 81mg" → Not found error (Aspirin not in database)
2. Say "Show available medications" → TTS reads list of 8 drugs

---

### FR-23: Drug Safety Checks
**Priority**: P0 (Must Have)
**Complexity**: High

**Description**: Check for safety concerns before confirming prescription.

**Safety Checks**:
1. **Drug interactions** with patient's current medications
2. **Allergy matches** (e.g., Penicillin allergy + Amoxicillin)
3. **Contraindications** based on patient history

**Example - Warfarin + Ibuprofen Interaction**:
- Patient: Sarah Chen (on Warfarin 5mg daily)
- Attempted prescription: Ibuprofen 200mg
- **Result**: BLOCKED
- **Reason**: NSAIDs increase bleeding risk with anticoagulants

**Response Format**:
```json
{
  "blocked": true,
  "warnings": [
    {
      "severity": "HIGH",
      "type": "drug_interaction",
      "message": "Ibuprofen interacts with Warfarin. Risk of severe bleeding."
    }
  ],
  "alternatives": [
    {
      "medication": "Acetaminophen",
      "dosage": "500mg",
      "rationale": "No interaction with Warfarin."
    }
  ]
}
```

**Acceptance Criteria**:
- ✅ Drug interactions detected
- ✅ Allergy matches detected
- ✅ Prescription blocked if safety concern exists
- ✅ Alternatives suggested

**Test Scenarios**:
1. Sarah Chen (Warfarin) + Ibuprofen → BLOCKED (drug interaction)
2. Sarah Chen (Penicillin allergy) + Amoxicillin → BLOCKED (allergy)
3. Robert Martinez + Acetaminophen → SUCCESS (no concerns)

**Dependencies**:
- Dev 3: Drug interaction logic in backend (Hour 24+ handoff)

**Demo Mode**: Use `config/demo_api_responses.json` for mock responses

**Reference**: See PRD line 764 - AC-P3

---

### FR-24: Safety Concern Warning
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Block prescription and warn if safety concern detected.

**Warning UI** (Task 2.4):
- Red X icon (#FF0000 per AR-1)
- Warning message text
- Alternative medications listed
- TTS explanation

**Specifications**:
- AR position: Center of screen
- Display duration: 5s (per ar_config)
- Animation: Fade in 300ms (per AR-4)
- Voice: Warning message + alternatives via TTS

**Acceptance Criteria**:
- ✅ Prescription blocked (not logged)
- ✅ Warning UI displayed
- ✅ TTS explains risk
- ✅ Alternatives provided

**Test Scenarios**:
1. Sarah Chen + Ibuprofen → Red X, "Drug interaction detected", TTS explains, suggests Acetaminophen

**Reference Implementation**:
- File: `lens-studio/Public/Scripts/ui/prescriptionUI.js` (Task 2.4)

---

### FR-25: Prescription Logging Format
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Log prescription in structured format if no safety concerns.

**Format**: "[Medication] [Dosage], Take [frequency] for [duration]"

**Example**: "Amoxicillin 500mg, Take 1 tablet 3x daily for 10 days"

**Acceptance Criteria**:
- ✅ Prescription logged to database
- ✅ Structured format maintained

**Test Scenarios**:
1. Prescribe Acetaminophen → Logged as "Acetaminophen 500mg, Take every 6 hours as needed"

---

### FR-26: Prescription Success UI
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Display visual confirmation when prescription logged successfully.

**Success UI**:
- **Green checkmark icon** (#00FF00 per AR-1)
- **Text**: "Prescription logged: [medication] [dosage]"
- **Badge**: "PENDING" (pending physician approval per FR-26a)
- **Voice**: "Prescription logged for physician review"

**AR Specifications**:
- Position: Center of screen
- Duration: 5s display
- Animation: Fade in 300ms (per AR-4)
- Background: Semi-transparent

**Acceptance Criteria**:
- ✅ Green checkmark displayed
- ✅ Medication + dosage shown
- ✅ "PENDING" badge visible
- ✅ TTS confirmation played
- ✅ Auto-dismiss after 5s

**Test Scenarios**:
1. Prescribe Acetaminophen to Sarah Chen → Green checkmark + "Prescription logged: Acetaminophen 500mg" + PENDING badge
2. UI auto-dismisses after 5s

**Reference Implementation**:
- File: `lens-studio/Public/Scripts/ui/prescriptionUI.js` (Task 2.4)
- See: `Spectacles-Sample/AI Playground/` for UI rendering patterns

---

### FR-26a: Pending Status (Terminal for MVP)
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: "Pending" status is terminal for MVP demo.

**Note**: No physician approval workflow implemented. Future versions will integrate with EHR systems.

**Acceptance Criteria**:
- ✅ Prescription status remains "PENDING"
- ✅ No approval/rejection workflow

---

## 4.6 Voice Interaction (Relevant to Dev 2)

### FR-27: Wake Word Activation
**Priority**: P0 (Must Have)
**Complexity**: High

**Description**: Use wake word "Hey MedSnap" for session-initiating commands.

**Wake Word**: "Hey MedSnap"

**Session-Initiating Commands**:
- "Hey MedSnap, start assessment [patient name]"
- "Hey MedSnap, end assessment"
- "Hey MedSnap, start [mode]"

**Acceptance Criteria**:
- ✅ Wake word recognized reliably (≥90% accuracy)
- ✅ Session commands require wake word

**Dependencies**:
- Dev 1: Wake word detection implementation (Hour 12 handoff)

**Demo Mode**: Simulate wake word detection for testing

---

### FR-27a: In-Session Active Listening
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: Active listening mode for in-session commands (no wake word).

**Behavior**:
- After session starts, remain in active listening
- No wake word required for in-session commands
- Listening ends when:
  - Session ends (exit command or timeout)
  - 30 seconds of silence

**Acceptance Criteria**:
- ✅ In-session commands work without wake word
- ✅ 30s silence timeout triggers listening pause

**Test Scenarios**:
1. Start assessment → Say "Show medications" (no wake word) → Works
2. 30s silence → Listening pauses → Requires wake word to resume

---

### FR-29: TTS via Fish Audio
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Description**: All system responses delivered via Fish Audio TTS.

**Specifications**:
- API: Fish Audio
- Voice: Professional, calm
- Language: English (US)

**Acceptance Criteria**:
- ✅ All responses use Fish Audio TTS
- ✅ Voice quality acceptable

**Dependencies**:
- Dev 3: Fish Audio API integration (Hour 18+ handoff)

**Demo Mode**: Use local MP3 files

---

### FR-30: Voice vs Visual Feedback Priority
**Priority**: P0 (Must Have)
**Complexity**: Low

**Description**: Prioritize voice for critical info, visual for reference data.

**Voice Feedback** (TTS):
- Errors (patient not found, medication not found)
- Warnings (drug interactions, allergies)
- Clinical suggestions
- Confirmations (prescription logged, symptom recorded)

**Visual Feedback** (AR):
- Patient cards
- Vital signs
- Medication lists
- Prescription UI

**Acceptance Criteria**:
- ✅ Critical info has voice feedback
- ✅ Reference data shown visually

---

### FR-31: Audio Beep Confirmation
**Priority**: P1 (Should Have)
**Complexity**: Low

**Description**: Audio beep confirms session-initiating command reception.

**Specifications**:
- Beep duration: 100-200ms
- Timing: Immediately after wake word detection
- Purpose: User feedback that command was heard

**Acceptance Criteria**:
- ✅ Beep plays within 200ms of wake word

**Dependencies**:
- Dev 1: Wake word detection (Hour 12 handoff)

---

## 6.1 AR Visual Design Specifications

### AR-1: Color Coding
**Priority**: P0 (Must Have)
**Complexity**: Low

**Color Specifications**:
- **Pulse point overlay**: Cyan (#00FFFF), 50% opacity (Dev 4 - CV)
- **Directional arrows**: Yellow (#FFFF00) (Dev 4 - CV)
- **Warnings/errors**: Red (#FF0000)
- **Success confirmations**: Green (#00FF00)
- **Allergy text**: Red (#FF0000)

**Dev 2 Usage**:
- Allergy text in patient card: Red (#FF0000)
- Prescription warning UI: Red (#FF0000) for X icon
- Prescription success UI: Green (#00FF00) for checkmark

**Acceptance Criteria**:
- ✅ Colors match specification exactly
- ✅ High contrast in various lighting

---

### AR-2: Typography
**Priority**: P0 (Must Have)
**Complexity**: Low

**Specifications**:
- **Font**: Sans-serif (Roboto or system default)
- **Minimum size**: 18pt
- **Purpose**: Readability at arm's length

**Dev 2 Usage**:
- Patient card text: 18pt minimum
- Prescription UI text: 18pt minimum

**Acceptance Criteria**:
- ✅ All text ≥18pt
- ✅ Sans-serif font used

---

### AR-3: Layout Positioning
**Priority**: P0 (Must Have)
**Complexity**: Low

**Specifications**:
- **Patient card**: Top 1/3 of screen, centered horizontally
- **Prescription UI**: Center of screen
- **Warnings**: Center, overlaying other content

**Purpose**: Avoid obstructing patient view

**Acceptance Criteria**:
- ✅ Patient card at top 1/3
- ✅ Prescription UI centered
- ✅ Patient view not obstructed

**Reference Implementation**:
- Use `Component.ScreenTransform` with anchors
- Patient card: `anchors.setCenter(0.5, 0.9)` (top center)
- Prescription UI: `anchors.setCenter(0.5, 0.5)` (center)

---

### AR-4: Animations
**Priority**: P1 (Should Have)
**Complexity**: Low

**Specifications**:
- **Fade in**: 300ms ease-in
- **Fade out**: 300ms ease-out
- **Auto-dismiss timings**:
  - Patient card: 10s
  - Prescription UI: 5s

**Acceptance Criteria**:
- ✅ Smooth fade animations
- ✅ Auto-dismiss timers work correctly

---

## 4.9 Performance Requirements

### FR-41: AR Frame Rate
**Priority**: P0 (Must Have)
**Complexity**: High

**Target**: ≥30 FPS during AR overlay rendering

**Test Scenario**: Measure FPS with patient card + prescription UI active simultaneously

**Acceptance Criteria**:
- ✅ FPS ≥30 with all UI elements visible

---

### FR-42: API Response Time
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Target**: <3s for all API calls (end-to-end)

**Timing**: Wake word completion → System response (TTS playback start)

**Acceptable**: 3s max
**Target**: 2s

**Acceptance Criteria**:
- ✅ Patient load <3s
- ✅ Prescription check <3s
- ✅ Symptom recording <3s

**Test Scenarios**:
1. "Hey MedSnap, start assessment Sarah Chen" → Patient card appears within 3s
2. "Prescribe Ibuprofen 200mg" → Warning UI appears within 3s

---

### FR-44: TTS Latency
**Priority**: P0 (Must Have)
**Complexity**: Medium

**Target**: <1.5s from command completion to audio playback start

**Acceptable**: 1.5s max
**Target**: <500ms

**Acceptance Criteria**:
- ✅ TTS audio starts within 1.5s

**Test Scenarios**:
1. "Prescribe Acetaminophen" → TTS "Prescription logged" starts within 1.5s

---

### FR-44a: Response Caching
**Priority**: P1 (Should Have)
**Complexity**: Low

**Description**: Pre-generate and cache common voice responses.

**Common Responses to Cache**:
- "Patient loaded"
- "Recording symptom"
- "Prescription logged"
- "Patient not found"
- "Medication not found"

**Target**: <500ms playback for cached responses

**Acceptance Criteria**:
- ✅ Cached responses play <500ms

**Implementation**: Pre-generate MP3 files, store locally

---

## Out of Scope for Dev 2 (YAGNI Principle)

The following are **NOT** your responsibility:

### ❌ Computer Vision (Dev 4)
- Pulse point detection
- Throat detection
- Vital sign monitor OCR
- Hand/wrist landmark detection

### ❌ Wake Word Detection (Dev 1)
- ASR integration for wake word
- Voice command routing
- Training mode implementation

### ❌ Backend API Implementation (Dev 3)
- Patient database queries
- Drug interaction logic (backend)
- Gemini + Letta integration
- Fish Audio TTS API calls
- Supabase database setup

### ❌ Out of Hackathon Scope
- HIPAA compliance
- Encryption at rest
- Multi-user collaboration
- Offline mode
- Real EHR integration (Epic, Cerner)
- Physician approval workflow
- Real pharmacy transmission
- Advanced diagnostics beyond symptom mapping

---

## Demo Mode Implementation Notes

For Tasks 2.0-2.4, you will use **demo mode** with mock data:

### Mock Patient Data
- File: `config/demo_patient_data.json`
- Patients: Sarah Chen, Robert Martinez, Emily Watson
- Data matches PRD specifications exactly

### Mock API Responses
- File: `config/demo_api_responses.json`
- Responses:
  - `prescription_warfarin_interaction` (Ibuprofen + Warfarin)
  - `prescription_success` (Acetaminophen)
  - `allergy_check_blocked` (Penicillin allergy)
  - `patient_loaded` (Sarah Chen)
  - `symptom_recorded`

### When to Use Demo Mode
- **Tasks 2.0-2.2**: Use demo mode 100%
- **Task 2.3**: Use demo mode + integrate Dev 1's voice router (after Hour 12)
- **Task 2.4**: Use demo mode + integrate Dev 3's backend (after Hour 24)

---

## Summary: Dev 2 Task Mapping

### Task 2.1: Mode Manager (Hours 6-12)
**Requirements**: FR-12, FR-12a, FR-12b
**Files**: `modeManager.js`
**Testing**: Mode switching, state transitions

### Task 2.2: Patient Card Renderer (Hours 12-18)
**Requirements**: FR-13, FR-14, FR-14a, AR-1, AR-2, AR-3, AR-4
**Files**: `patientCardRenderer.js`
**Testing**: Card display, allergies in red, auto-hide, manual recall

### Task 2.3: Clinical Mode State Machine (Hours 18-30)
**Requirements**: FR-15, FR-21, FR-27, FR-27a
**Files**: `clinicalMode.js`
**Testing**: Voice commands, prescription initiation, session management

### Task 2.4: Prescription UI (Hours 30-36)
**Requirements**: FR-22, FR-22a, FR-23, FR-24, FR-25, FR-26, FR-26a
**Files**: `prescriptionUI.js`
**Testing**: Success UI (green checkmark), warning UI (red X), alternatives display

---

**Last Updated**: October 24, 2025
**Version**: 1.0 (Task 2.0 - Environment Setup)
**Next Step**: Begin Task 2.1 (Mode Manager TDD) at Hour 6
