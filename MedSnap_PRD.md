# Product Requirements Document: MedSnap
## AR Medical Assistant for Snap Spectacles

**Version:** 1.1  
**Date:** October 24, 2025  
**Project Duration:** 48 hours (Hackathon)  
**Team Size:** 4 developers

**Changelog:**
- v1.1 - October 24, 2025 - Implemented review recommendations, renamed to MedSnap
  - Clarified wake word usage for session vs. in-session commands (FR-27a)
  - Specified MediaPipe Hands as CV model with fallback (FR-32 updated)
  - Adjusted performance targets to realistic ranges with caching strategy (FR-42, FR-44 updated)
  - Enhanced prescription workflow UI feedback specifications (FR-26 updated)
  - Simplified demo script with updated Sarah Chen seed data for drug interaction demo
  - Refined audio confirmation strategy to avoid overload (FR-11 updated)
  - Added retry logic for CV, patient lookup, and vital sign reading (FR-10a, FR-14a, FR-17a added)
  - Specified mode switching and exit commands (FR-5a, FR-12a, FR-12b added)
  - Added Letta context size management (FR-4a added)
  - Defined behavior for unknown medication requests (FR-22a added)

---

## 1. Introduction/Overview

MedSnap is a hands-free augmented reality medical assistant designed for Snap Spectacles that serves two critical healthcare needs: training nurses on basic medical procedures and providing on-the-job clinical decision support. Healthcare workers face information overload, high cognitive load during patient care, and limited access to real-time guidance. MedSnap addresses these challenges by delivering contextual AR overlays, voice-activated patient information retrieval, and AI-powered clinical decision support—all without requiring nurses to touch a device or break focus from their patient.

**Problem Statement:** Nurses learning new procedures lack immersive, real-time feedback during training, while experienced nurses struggle to quickly access patient information and make decisions under time pressure in clinical settings.

**Solution:** A dual-mode AR application that provides step-by-step training with visual overlays and real-time technique feedback, plus a clinical mode that enables hands-free access to patient records, vital sign monitoring, and AI-powered clinical recommendations.

---

## 2. Goals

1. **Training Effectiveness:** Enable nurses to learn pulse-taking procedure with real-time AR guidance and corrective feedback, demonstrating faster skill acquisition compared to traditional methods.

2. **Clinical Efficiency:** Reduce time to retrieve patient information from 2-3 minutes to under 30 seconds through voice-activated, hands-free access.

3. **Error Reduction:** Decrease medication prescription errors through automated drug interaction checking and allergy verification.

4. **Hands-Free Operation:** Achieve 100% hands-free interaction using voice commands and AR visual displays to maintain sterile conditions and patient focus.

5. **Sponsor Integration:** Successfully demonstrate Fish Audio's TTS for natural medical voice guidance, Gemini API for AI-powered decision support, and Letta for conversation context management.

6. **MVP Completion:** Deliver a working demo of one complete training procedure (pulse taking) and one clinical scenario (patient assessment with prescription) within 48 hours.

---

## 3. User Stories

### Training Mode

**US-1:** As a nursing student, I want to see an AR overlay highlighting the exact location of the radial pulse on a patient's wrist, so that I can learn proper anatomical positioning without instructor intervention.

**US-2:** As a nurse learning pulse taking, I want real-time feedback on my finger placement, so that I can correct my technique immediately and build muscle memory.

**US-3:** As a trainee, I want voice-guided step-by-step instructions, so that I can keep my eyes on the patient while learning the procedure.

**US-4:** As a nurse practicing vital sign measurement, I want the system to validate my pulse reading and technique, so that I gain confidence before working with real patients.

### Clinical Mode

**US-5:** As a home healthcare nurse, I want to activate patient records using voice commands while my hands are occupied with patient care, so that I can access information without breaking sterile technique.

**US-6:** As a clinic nurse, I want to see a patient's allergies, medications, and diagnosis history displayed in my field of vision, so that I can make informed decisions quickly during patient assessment.

**US-7:** As a healthcare provider, I want the system to automatically read vital signs from digital monitors, so that I can document readings without manual transcription errors.

**US-8:** As a nurse recording symptoms, I want to use voice commands to add observations to the patient record, so that I can maintain eye contact and rapport with the patient while documenting.

**US-9:** As a prescribing nurse, I want the system to check drug interactions and allergies before confirming a prescription, so that I can prevent potentially harmful medication errors.

**US-10:** As a healthcare worker, I want AI-powered clinical decision support that suggests possible diagnoses and next steps based on symptoms, so that I can provide better care especially in ambiguous cases.

---

## 4. Functional Requirements

### 4.1 System Architecture

**FR-1:** The system SHALL consist of three main components: Snap Spectacles with Lens Studio app (client), Node.js/Express backend API (server), and Supabase database (data layer).

**FR-2:** The system SHALL integrate with the following external services:
- Snap AR Speech-to-Text for voice recognition
- Fish Audio API for text-to-speech synthesis
- Gemini API wrapped with Letta for conversational AI and context management
- HuggingFace pre-trained models for computer vision body landmark detection

**FR-3:** The system SHALL host backend services on Railway with automatic deployment.

**FR-4:** The system SHALL maintain conversation context per patient session using Letta context management wrapping Gemini API calls.

**FR-4a:** Letta context management SHALL maintain a rolling window of the last 20 conversation turns or 4000 tokens (whichever is smaller) per patient session. Older context SHALL be summarized and compressed to maintain performance.

### 4.2 Training Mode - Pulse Taking Procedure

**FR-5:** The system SHALL provide a "Training Mode" accessible via voice command: "Hey MedSnap, start training pulse taking."

**FR-5a:** To exit Training Mode, the user SHALL say "Hey MedSnap, end training" OR the system SHALL auto-exit after procedure completion plus 10 seconds of inactivity. The system SHALL confirm mode exit with voice: "Training complete."

**FR-6:** The system SHALL detect the patient's wrist in the camera view using computer vision and display the following AR overlays:
- A glowing circle highlighting the radial pulse point (thumb side of wrist)
- A directional arrow indicating optimal finger placement angle

**FR-7:** The system SHALL track the user's hand position in real-time using CV and provide corrective feedback such as: "Adjust your hand. Move two centimeters toward the thumb."

**FR-8:** The system SHALL guide the user through the pulse-taking procedure with the following voice prompts:
1. "Starting pulse taking training. Locate your patient's radial artery on the wrist."
2. "Wrist detected. Position your index and middle fingers on the highlighted area, thumb side of the wrist."
3. "Good position. Apply gentle, steady pressure. Do not press too hard."
4. "Count the beats for 15 seconds. I'll notify you when time is up."
5. "Time. What was your count?"
6. [After user responds] "Recording [X] beats per minute. [Normal/Abnormal] range. [Technique feedback]."
7. "Pulse taking training complete. You successfully located and measured the radial pulse."

**FR-9:** The system SHALL detect common errors and provide specific feedback:
- Incorrect finger placement: "Adjust your hand. Move two centimeters toward the thumb."
- Excessive pressure: "You're pressing too hard. Lighten your touch."
- Unusual reading: "That reading seems unusual. Try again with slightly firmer pressure and recount."

**FR-10:** If computer vision fails to detect the wrist, the system SHALL display: "Unable to detect wrist position. Please ensure the patient's wrist is visible and try again."

**FR-10a:** After the CV failure message, the system SHALL automatically retry detection for 10 seconds. If still unsuccessful, the system SHALL allow manual mode or skip to the next step without blocking workflow.

**FR-11:** The system SHALL confirm session-initiating voice commands with a quick audio beep (100-200ms). For in-session commands, the system SHALL use a subtle visual indicator (pulsing microphone icon) instead of audio to avoid interference with TTS responses.

### 4.3 Clinical Mode - Patient Assessment

**FR-12:** The system SHALL activate clinical mode via voice command: "Hey MedSnap, start assessment [patient name or ID]."

**FR-12a:** To exit Clinical Mode, the user SHALL say "Hey MedSnap, end assessment" OR the system SHALL auto-exit after 2 minutes of inactivity. The system SHALL confirm mode exit with voice: "Assessment complete."

**FR-12b:** Switching directly between modes: "Hey MedSnap, start [mode]" SHALL automatically end the current mode and start the new mode without requiring explicit exit commands.

**FR-13:** Upon patient lookup, the system SHALL display an AR patient information card showing (in priority order):
- Patient name, age, sex
- Chief complaint (reason for current visit)
- Current symptoms
- Diagnosis history (last 3 visits)
- Current vital signs (latest readings)
- Medication list
- Allergies (prominently displayed)

**FR-14:** If the spoken patient name/ID does not exist in the database, the system SHALL respond: "Patient not found. Please repeat patient name."

**FR-14a:** The system SHALL allow up to 3 patient name attempts. After 3 failures, the system SHALL offer to show a patient list or cancel the assessment.

**FR-15:** The system SHALL support the following voice commands in clinical mode:
- "Hey MedSnap, start assessment [patient name]" - Load patient record (session-initiating, requires wake word)
- "Record symptom: [description]" - Add symptom to patient notes (in-session, no wake word)
- "Show patient history" - Display diagnosis history (in-session, no wake word, default interpretation if ambiguous)
- "Show medications" - Display current medication list (in-session, no wake word)
- "Show allergies" - Display allergy information (in-session, no wake word)
- "Prescribe [medication] [dosage]" - Initiate prescription workflow (in-session, no wake word)
- "Repeat instructions" - Replay last voice prompt (in-session, no wake word)

**FR-16:** The system SHALL use computer vision to read digital vital sign monitors and automatically extract:
- Blood pressure (systolic/diastolic)
- Heart rate (BPM)
- Oxygen saturation (%)
- Temperature (°F)

**FR-17:** If vital sign monitor detection fails, the system SHALL skip automatic reading and allow the nurse to continue the assessment without blocking the workflow.

**FR-17a:** Vital sign reading SHALL retry automatically once after a 2-second delay. After 2 failures, the system SHALL skip and continue the workflow without blocking.

### 4.4 Clinical Decision Support

**FR-18:** After recording symptoms, the system SHALL analyze the symptom-vital sign combination and provide clinical suggestions including:
- Possible diagnoses with confidence indicators
- Recommended next steps or protocols
- Relevant warnings or alerts

**FR-19:** The system SHALL implement the following clinical decision scenarios (examples for MVP):

**Scenario 1 - Respiratory Infection:**
- Input: Fever 101.5°F, dry cough, fatigue, chest tightness
- Output: "Symptoms suggest upper respiratory infection. Recommend: chest auscultation, check for wheezing. Monitor O2 saturation. Consider viral vs bacterial - if persistent beyond 7 days or worsening, consult for possible antibiotic therapy."

**Scenario 2 - Hypertension Alert:**
- Input: BP 148/94, patient on Lisinopril 10mg
- Output: "Elevated blood pressure detected. Patient history shows hypertension diagnosis. Current medication: Lisinopril 10mg daily. Recommendation: Verify medication compliance, consider dosage adjustment. Recheck BP in 15 minutes. If remains elevated, consult physician for treatment modification."

**Scenario 3 - Drug Interaction Warning:**
- Input: Patient on Warfarin, nurse attempts to prescribe Ibuprofen
- Output: "WARNING: Drug interaction detected. Ibuprofen increases bleeding risk with Warfarin. Recommend acetaminophen instead. Dosage: 500mg every 6 hours as needed for pain. Consult physician before prescribing NSAIDs."

**FR-20:** Clinical suggestions SHALL be delivered via Fish Audio TTS with a professional, calm voice tone.

### 4.5 Prescription Writing & Drug Safety

**FR-21:** The system SHALL support prescription logging via voice command: "Prescribe [medication name] [dosage]."

**FR-22:** The system SHALL maintain a database of 5-10 common medications including:
- Amoxicillin (antibiotic)
- Azithromycin (antibiotic)
- Acetaminophen (pain reliever)
- Ibuprofen (NSAID)
- Lisinopril (hypertension)
- Metformin (diabetes)
- Omeprazole (acid reflux)
- Warfarin (anticoagulant)

**FR-22a:** If the requested medication is not in the database, the system SHALL respond: "Medication not found in database. Please verify spelling or select from available medications." The system SHALL offer the voice command "Show available medications" to list the 5-10 supported drugs.

**FR-23:** Before confirming a prescription, the system SHALL check:
- Drug interactions with patient's current medications
- Patient allergy matches
- Contraindications based on patient history

**FR-24:** If a safety concern is detected, the system SHALL block the prescription and provide a warning with recommended alternatives.

**FR-25:** If no safety concerns exist, the system SHALL log the prescription in the following structured format: "[Medication] [Dosage], Take [frequency] for [duration]" (e.g., "Amoxicillin 500mg, Take 1 tablet 3x daily for 10 days").

**FR-26:** Prescriptions SHALL be logged to the patient's record with status "pending_physician_approval". The system SHALL display a visual confirmation in AR:
- Green checkmark icon + "Prescription logged: [medication] [dosage]"
- Voice confirmation: "Prescription logged for physician review"
- Prescription appears in patient card with "PENDING" badge

**FR-26a:** For MVP demo purposes, the "pending" status is terminal (no approval workflow implemented). Future versions will integrate physician approval via EHR systems.

### 4.6 Voice Interaction

**FR-27:** The system SHALL use the wake word "Hey MedSnap" to activate voice command listening for session-initiating commands.

**FR-27a:** Once a session is initiated (training or clinical mode started), the system SHALL remain in active listening mode for subsequent in-session commands without requiring wake word repetition. The listening mode SHALL end when the session ends OR after 30 seconds of silence.

**FR-28:** The system SHALL require keywords in session-initiating voice commands to reduce false activations in noisy clinical environments.

**FR-29:** All system responses SHALL be delivered via Fish Audio TTS to meet sponsor requirements.

**FR-30:** The system SHALL prioritize voice feedback for critical information (errors, warnings, clinical suggestions) and use visual AR displays for reference data (patient cards, vital signs).

**FR-31:** The system SHALL confirm session-initiating command reception with a 100-200ms audio beep before processing.

### 4.7 Computer Vision

**FR-32:** The system SHALL use MediaPipe Hands v0.9+ (via HuggingFace Transformers) for hand detection and wrist landmark identification. Fallback: OpenPose Lite if MediaPipe is unavailable. Configuration:
- Model: MediaPipe Hands v0.9+
- Input: 640x480 RGB frames at 15 FPS
- Output: 21 hand landmarks including wrist position (landmark #0)
- Confidence threshold: 0.7 minimum for detection

**FR-33:** The system SHALL focus CV processing on one person at a time (multi-person detection is out of scope).

**FR-34:** For training mode, the system SHALL detect:
- Wrist position and orientation
- Hand approach and finger placement
- Approximate pressure (via hand tension heuristics)

**FR-35:** For clinical mode, the system SHALL detect and perform OCR on:
- Digital vital sign monitors
- Numeric displays on medical equipment

**FR-36:** If CV detection fails, the system SHALL gracefully degrade by continuing workflow without blocking (e.g., skip automatic vital sign reading, proceed with manual input).

### 4.8 Data Management

**FR-37:** The system SHALL store patient data in Supabase PostgreSQL database with the following schema:

```
patients table:
- id (UUID, primary key)
- name (text)
- age (integer)
- sex (text)
- allergies (text[])
- medications (JSONB array)
- diagnosis_history (JSONB array)

visits table:
- id (UUID, primary key)
- patient_id (UUID, foreign key)
- date (timestamp)
- chief_complaint (text)
- symptoms (text[])
- vital_signs (JSONB)
- notes (text)
- prescriptions (JSONB array)
```

**FR-38:** The system SHALL seed the database with 3-5 mock patient profiles for demonstration purposes.

**FR-39:** Patient data SHALL be loaded from `/data/patients.json` on startup for easy editing during development.

**FR-40:** The system SHALL maintain full patient records (not session-only) to demonstrate continuity of care.

### 4.9 Performance Requirements

**FR-41:** AR rendering SHALL maintain minimum 30 FPS for smooth visual experience.

**FR-42:** Voice command response time SHALL be under 3 seconds from wake word completion to system response (target: 2 seconds, acceptable: 3 seconds). This accounts for network latency across multiple API calls (Snap ASR → Express → Gemini/Letta → Fish Audio).

**FR-43:** Computer vision detection latency SHALL be under 500ms for acceptable real-time feedback.

**FR-44:** TTS audio generation SHALL achieve perceived real-time responsiveness (target: <500ms, acceptable: <1.5 seconds). Use streaming audio when possible to reduce perceived latency.

**FR-44a:** The system MAY pre-generate and cache common voice responses (e.g., "Patient loaded", "Recording symptom", "Pulse detected") to achieve sub-500ms response for frequent operations.

**FR-45:** The system SHALL support one simultaneous user for MVP demonstration.

---

## 5. Non-Goals (Out of Scope)

**NG-1:** Multi-user collaboration features (multiple nurses viewing same patient simultaneously)

**NG-2:** Offline mode or local-only operation without internet connectivity

**NG-3:** Integration with real Electronic Health Record (EHR) systems such as Epic or Cerner

**NG-4:** HIPAA compliance implementation, encryption at rest, or production-grade security measures

**NG-5:** Advanced diagnostic capabilities beyond basic symptom-diagnosis mapping

**NG-6:** Recording or playback of training sessions (to avoid latency issues)

**NG-7:** Multiple simultaneous patient tracking or split-attention scenarios

**NG-8:** Additional training procedures beyond pulse taking (future enhancement)

**NG-9:** Advanced body landmark detection beyond wrist/hand positioning (future enhancement)

**NG-10:** Accessibility features such as color-blind modes, font size adjustments, or screen reader compatibility

**NG-11:** Real prescription transmission to pharmacy systems (MVP is logging only)

**NG-12:** Formal medical protocol libraries or guideline databases (use general best practices)

---

## 6. Design Considerations

### 6.1 AR Visual Design

**AR-1:** Visual overlays SHALL use high-contrast colors for visibility in various lighting conditions:
- Glowing circle for pulse point: Cyan (#00FFFF) with 50% opacity
- Directional arrows: Bright yellow (#FFFF00)
- Warning indicators: Red (#FF0000)
- Success confirmations: Green (#00FF00)

**AR-2:** Text overlays SHALL use sans-serif font (minimum 18pt) for readability at arm's length.

**AR-3:** Patient information cards SHALL float at the top 1/3 of the visual field to avoid obstructing the patient view.

**AR-4:** AR elements SHALL have subtle animations (fade in/out, 300ms) to draw attention without distraction.

### 6.2 Voice Design

**Voice-1:** Fish Audio TTS SHALL use a professional, calm, female voice persona suitable for medical contexts.

**Voice-2:** Voice prompts SHALL be concise (under 15 words per sentence) for quick comprehension.

**Voice-3:** Critical warnings SHALL use a slightly elevated pitch and slower pace for emphasis.

### 6.3 User Experience

**UX-1:** All interactions SHALL be completable hands-free using voice commands and visual feedback only.

**UX-2:** The system SHALL provide clear state indicators (training mode vs. clinical mode) via AR icons or color coding.

**UX-3:** Error states SHALL be recoverable without restarting the application (graceful degradation).

---

## 7. Technical Considerations

### 7.1 Technology Stack

- **Client:** Snap Spectacles running Lens Studio application
- **Backend:** Node.js v18+ with Express.js framework
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Railway for backend API deployment
- **AI Services:**
  - Snap AR Speech-to-Text (built into Lens Studio)
  - Fish Audio API for text-to-speech synthesis
  - Gemini API (via Google AI Studio) for conversational AI
  - Letta wrapper for Gemini context management
- **Computer Vision:** HuggingFace Transformers with MediaPipe Hands v0.9+
- **Version Control:** Git/GitHub for collaboration

### 7.2 Architecture Overview

```
[Snap Spectacles + Lens Studio]
        |
        | (1) Voice Input via Snap ASR
        | (2) CV Processing (local) - MediaPipe Hands
        | (3) AR Rendering (local)
        |
        v
[Express API on Railway] <-----> [Supabase Database]
        |
        | (4) Gemini API (via Letta wrapper)
        | (5) Fish Audio TTS API
        | (6) Clinical decision logic
        |
        v
[Response back to Spectacles]
```

**Data Flow Example (Patient Assessment):**
1. User says "Hey MedSnap, start assessment Sarah Chen"
2. Snap ASR → text transcription sent to Express API
3. Express → Letta (wraps Gemini) extracts intent: "load_patient"
4. Express → Supabase query patient record
5. Express → formats response with patient data
6. Express → Gemini generates clinical context
7. Express → Fish Audio converts response to speech
8. Lens Studio receives audio + data, displays AR card + plays TTS

### 7.3 API Endpoints (Backend)

```
POST /api/training/start
  Body: { procedure: "pulse_taking", user_id: string }
  Response: { session_id, initial_instructions, ar_overlays }

POST /api/training/feedback
  Body: { session_id, cv_data: { hand_position, wrist_detected }, user_action }
  Response: { feedback_text, audio_url, corrective_instructions }

POST /api/clinical/patient/load
  Body: { patient_name: string }
  Response: { patient_data, ar_display_config }

POST /api/clinical/symptom/record
  Body: { patient_id, symptom_description, timestamp }
  Response: { success, updated_record }

POST /api/clinical/decision-support
  Body: { patient_id, symptoms, vital_signs }
  Response: { suggestions, diagnoses, warnings, audio_url }

POST /api/clinical/prescription/create
  Body: { patient_id, medication, dosage, frequency }
  Response: { success, warnings[], prescription_id, audio_url }

POST /api/voice/command
  Body: { transcription, context }
  Response: { intent, action, parameters }

POST /api/tts/generate
  Body: { text, voice_config }
  Response: { audio_url, duration }
```

### 7.4 Database Seeding

Mock patient data in `/data/patients.json`:

```json
[
  {
    "name": "Sarah Chen",
    "age": 34,
    "sex": "Female",
    "allergies": ["Penicillin"],
    "medications": [
      { "name": "Warfarin", "dosage": "5mg daily", "started": "2024-03-01" },
      { "name": "Loratadine", "dosage": "10mg daily", "started": "2024-01-15" }
    ],
    "diagnosis_history": [
      { "date": "2024-10-01", "diagnosis": "Seasonal allergies", "provider": "Dr. Smith" },
      { "date": "2024-08-15", "diagnosis": "Annual checkup - healthy", "provider": "Dr. Smith" },
      { "date": "2024-03-01", "diagnosis": "Atrial fibrillation", "provider": "Dr. Lee" }
    ],
    "current_vitals": {
      "bp": "118/76",
      "hr": 88,
      "o2": 97,
      "temp": 101.5
    },
    "chief_complaint": "Persistent cough and fever"
  },
  {
    "name": "Robert Martinez",
    "age": 58,
    "sex": "Male",
    "allergies": [],
    "medications": [
      { "name": "Lisinopril", "dosage": "10mg daily", "started": "2023-06-10" },
      { "name": "Metformin", "dosage": "500mg twice daily", "started": "2023-06-10" }
    ],
    "diagnosis_history": [
      { "date": "2024-09-20", "diagnosis": "Hypertension (controlled)", "provider": "Dr. Johnson" },
      { "date": "2024-09-20", "diagnosis": "Type 2 Diabetes (controlled)", "provider": "Dr. Johnson" },
      { "date": "2024-07-10", "diagnosis": "Routine medication check", "provider": "Dr. Johnson" }
    ],
    "current_vitals": {
      "bp": "148/94",
      "hr": 76,
      "o2": 99,
      "temp": 98.4
    },
    "chief_complaint": "Routine checkup"
  },
  {
    "name": "Emily Watson",
    "age": 45,
    "sex": "Female",
    "allergies": ["Sulfa drugs"],
    "medications": [
      { "name": "Metoprolol", "dosage": "50mg twice daily", "started": "2024-03-01" }
    ],
    "diagnosis_history": [
      { "date": "2024-03-01", "diagnosis": "Atrial fibrillation", "provider": "Dr. Lee" },
      { "date": "2024-01-15", "diagnosis": "Deep vein thrombosis (resolved)", "provider": "Dr. Lee" }
    ],
    "current_vitals": {
      "bp": "125/80",
      "hr": 72,
      "o2": 98,
      "temp": 98.6
    },
    "chief_complaint": "Joint pain"
  }
]
```

**NOTE:** Sarah Chen has been updated to include Warfarin in her medication list to support the drug interaction demo scenario within a single patient flow.

### 7.5 Development Environment Setup

**Required Software:**
1. Lens Studio (latest version) - Download from Snap website
2. Node.js v18+ and npm
3. Git for version control
4. Supabase account (free tier)
5. Railway account for deployment
6. API keys:
   - Fish Audio API key
   - Google Gemini API key
   - Letta API key (if using hosted version)

**Environment Variables (.env):**
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
GEMINI_API_KEY=<your-gemini-key>
FISH_AUDIO_API_KEY=<your-fish-audio-key>
LETTA_API_KEY=<your-letta-key>
PORT=3000
```

### 7.6 Testing Strategy

**Critical Path Testing (Priority 1):**
1. Voice command → Patient load → AR display
2. Training mode → AR overlay rendering → Feedback delivery
3. Prescription creation → Drug interaction check → Warning display

**Unit Tests:**
- Patient database queries (CRUD operations)
- Drug interaction checking logic
- Voice command intent extraction
- Clinical decision support rule engine

**End-to-End Integration Tests:**
- Complete pulse taking training flow
- Complete patient assessment flow
- Prescription workflow with interaction warning

**Manual Testing (Demo Preparation):**
- Run through complete demo script 10+ times
- Test in various lighting conditions
- Verify audio quality and timing
- Confirm AR overlays align correctly

### 7.7 Known Risks & Mitigations

**Risk 1: Lens Studio Learning Curve**
- Mitigation: Assign most experienced developer to Lens Studio (Dev 1)
- Fallback: Use Lens Studio simulator if hardware issues occur

**Risk 2: Computer Vision Accuracy**
- Mitigation: Use high-confidence pre-trained MediaPipe Hands model, avoid custom training
- Fallback: Implement "demo mode" with color marker detection instead of anatomical landmarks

**Risk 3: API Integration Complexity**
- Mitigation: Build and test API endpoints independently before Lens Studio integration
- Fallback: Use mock API responses (JSON files) if external services fail

**Risk 4: Voice Recognition in Noisy Environments**
- Mitigation: Require clear wake word + high confidence threshold
- Fallback: Visual confirmation prompts before executing critical actions

**Risk 5: Real-time Performance**
- Mitigation: Optimize CV processing (reduce frame rate to 15 FPS), implement response caching
- Fallback: Accept 3-second latency for MVP demo (within acceptable range)

### 7.8 Deployment Plan

**Development Phase (Hours 0-36):**
- Set up repositories and development environments
- Build core features in parallel
- Integrate components progressively

**Integration Phase (Hours 36-42):**
- Connect Lens Studio frontend to Express backend
- End-to-end testing of both demo scenarios
- Fix critical bugs and integration issues

**Polish Phase (Hours 42-48):**
- Refine AR visual elements
- Optimize voice feedback timing
- Rehearse demo presentation
- Prepare fallback demo video

**Deployment:**
- Backend: Deploy to Railway via GitHub integration (auto-deploy on push)
- Database: Supabase hosted (always available)
- Frontend: Build Lens Studio project, install on Snap Spectacles

---

## 8. Success Metrics

### 8.1 Demo Success Criteria (Must-Have)

**DM-1:** Successfully demonstrate one complete pulse taking training session with visible AR overlays and voice feedback (2 minutes).

**DM-2:** Successfully demonstrate one complete patient assessment including patient load, symptom recording, and clinical suggestion (2 minutes).

**DM-3:** Successfully demonstrate prescription creation with drug interaction warning (1 minute).

**DM-4:** All core voice commands ("Hey MedSnap, start assessment...", "Record symptom...", "Prescribe...") work reliably in demo environment.

**DM-5:** AR overlays render correctly and remain stable throughout demo (no jitter or misalignment).

**DM-6:** Fish Audio TTS delivers clear, natural-sounding voice responses.

### 8.2 Technical Success Metrics

**TM-1:** Voice command recognition accuracy ≥ 90% in quiet environment.

**TM-2:** AR overlay rendering at ≥ 30 FPS during demo.

**TM-3:** End-to-end latency (voice command → system response) ≤ 3 seconds (target: 2 seconds).

**TM-4:** Drug interaction checking identifies all 3 demo scenarios correctly (100% accuracy on test cases).

**TM-5:** Computer vision detects wrist position with ≥ 80% success rate in good lighting.

### 8.3 User Experience Metrics (Qualitative)

**UX-1:** Demo viewers understand the value proposition within 30 seconds of presentation start.

**UX-2:** AR overlays are clearly visible and do not obscure the patient/subject.

**UX-3:** Voice interactions feel natural and conversational (not robotic or command-line style).

**UX-4:** Clinical suggestions are medically plausible and useful (validated by any medical professionals in audience).

### 8.4 Sponsor Technology Showcase

**ST-1:** Fish Audio TTS is prominently featured in both training and clinical modes (minimum 10 spoken phrases in demo).

**ST-2:** Gemini API integration is mentioned in presentation as the AI decision engine.

**ST-3:** Letta context management is highlighted as maintaining conversation continuity across patient interactions.

**ST-4:** Snap Spectacles AR capabilities are showcased with impressive visual overlays and real-world alignment.

### 8.5 Hackathon Judging Alignment

**Judge-1:** **Technical Complexity:** Multi-modal system with AR, CV, voice, and AI integration.

**Judge-2:** **Real-World Impact:** Addresses critical healthcare challenges (training efficiency, error reduction, time savings).

**Judge-3:** **Innovation:** Novel use of AR for medical training and clinical support; hands-free interaction paradigm.

**Judge-4:** **Completeness:** End-to-end working prototype demonstrating both use cases.

**Judge-5:** **Presentation Quality:** Clear 3-minute demo following the provided narrative structure.

---

## 9. Future Enhancements (Post-Hackathon)

**Future-1:** Add additional training procedures: IM injections, wound care, CPR, IV insertion.

**Future-2:** Expand CV capabilities: Detect more anatomical landmarks, recognize medical equipment types, read handwritten charts.

**Future-3:** Integrate with real EHR systems: HL7 FHIR API support, Epic/Cerner connectors.

**Future-4:** Implement HIPAA compliance: End-to-end encryption, audit logs, access controls, BAA agreements.

**Future-5:** Advanced diagnostics: Machine learning models for differential diagnosis, symptom-checker integration.

**Future-6:** Multi-user support: Team collaboration features, shared patient views, instructor oversight mode.

**Future-7:** Offline mode: Local caching of patient data, offline AI inference for critical scenarios.

**Future-8:** Accessibility features: Voice customization, color-blind modes, font size adjustments.

**Future-9:** Training analytics: Performance tracking, skill progression dashboards, certification workflows.

**Future-10:** Expanded prescription capabilities: Real pharmacy integration, e-prescribing, prior authorization automation.

---

## 10. Open Questions

**Q1:** ~~What specific HuggingFace model should be used for hand/pose detection?~~ **RESOLVED:** MediaPipe Hands v0.9+ specified in FR-32.

**Q2:** Should the system store audio recordings of voice commands for debugging? (Recommend: No, privacy concerns even for demo)

**Q3:** How should the system handle multiple patients with similar names? (Recommend: Ask for date of birth or patient ID as confirmation)

**Q4:** Should vital sign anomalies trigger automatic alerts even if not part of current assessment? (Recommend: Yes for critical values, display warning icon)

**Q5:** What happens if Fish Audio API rate limit is reached during demo? (Recommend: Implement local TTS fallback using browser speech synthesis)

**Q6:** Should the training mode track performance over time/multiple sessions? (Recommend: Out of scope for MVP, add to future enhancements)

**Q7:** ~~How should the system handle prescription requests for medications not in the database?~~ **RESOLVED:** FR-22a specifies behavior.

**Q8:** Should the AR patient card be dismissible or always-on during clinical mode? (Recommend: Auto-dismiss after 10 seconds, re-summon with "Show patient history")

**Q9:** What visual indicator should show the system is listening after wake word? (Recommend: Pulsing microphone icon in corner of view)

**Q10:** Should the system provide any disclaimers about medical advice? (Recommend: Yes, display "For training and assistance purposes only. Not a substitute for professional medical judgment" on app launch)

---

## 11. Acceptance Criteria

### Training Mode Acceptance

**AC-T1:** User can initiate pulse taking training via voice command "Hey MedSnap, start training pulse taking."

**AC-T2:** AR overlay displays glowing circle on detected wrist and directional arrow for finger placement.

**AC-T3:** System provides corrective feedback when hand position is incorrect (tested with 5 different positions).

**AC-T4:** System guides user through all 7 steps of pulse taking procedure with voice prompts.

**AC-T5:** System validates pulse reading and provides technique assessment.

**AC-T6:** User can exit training mode via "Hey MedSnap, end training" or system auto-exits after completion + 10 seconds.

### Clinical Mode Acceptance

**AC-C1:** User can load patient record via voice command "Hey MedSnap, start assessment [patient name]."

**AC-C2:** AR displays complete patient card with all required fields (name, age, chief complaint, allergies, medications, diagnosis history, vitals).

**AC-C3:** User can record symptoms via voice: "Record symptom: [description]" (no wake word required in-session) and system confirms recording.

**AC-C4:** System provides clinical decision support for at least 3 different symptom combinations (respiratory infection, hypertension alert, drug interaction).

**AC-C5:** User can trigger prescription workflow via voice: "Prescribe [medication] [dosage]" (no wake word required in-session).

**AC-C6:** User can exit clinical mode via "Hey MedSnap, end assessment" or system auto-exits after 2 minutes of inactivity.

### Prescription System Acceptance

**AC-P1:** System checks drug interactions against patient's current medications before confirming prescription.

**AC-P2:** System checks allergies before confirming prescription.

**AC-P3:** System blocks prescription and provides warning + alternative when interaction is detected (test with Sarah Chen + Ibuprofen scenario, as she takes Warfarin).

**AC-P4:** System logs prescription in structured format when no safety concerns exist, displays green checkmark + "Prescription logged for physician review."

**AC-P5:** System handles unknown medications gracefully per FR-22a.

### Voice Interaction Acceptance

**AC-V1:** Wake word "Hey MedSnap" activates voice command listening for session-initiating commands (tested 10 times with 100% success rate).

**AC-V2:** In-session commands work without wake word after session is initiated (tested with "Record symptom", "Show medications", "Prescribe").

**AC-V3:** System confirms session-initiating command reception with audio beep within 200ms.

**AC-V4:** All core commands (start assessment, record symptom, show history, show medications, prescribe) work reliably.

**AC-V5:** System defaults to patient history when command is ambiguous ("Show history").

### Computer Vision Acceptance

**AC-CV1:** System detects wrist in camera view with ≥80% success rate in good lighting conditions using MediaPipe Hands (tested with 10 different subjects).

**AC-CV2:** System detects hand position and provides spatial feedback ("Move 2cm toward thumb").

**AC-CV3:** System gracefully handles CV failures without crashing or blocking workflow, auto-retries per FR-10a and FR-17a.

### Performance Acceptance

**AC-P1:** AR rendering maintains ≥30 FPS throughout demo.

**AC-P2:** Voice command response time ≤3 seconds measured from wake word completion to TTS playback start (target: 2 seconds).

**AC-P3:** System supports one simultaneous user without performance degradation.

**AC-P4:** Common voice responses are cached and respond in <500ms when possible (FR-44a).

### Integration Acceptance

**AC-I1:** Lens Studio app successfully communicates with Express backend API.

**AC-I2:** Express backend successfully queries Supabase database.

**AC-I3:** Gemini API (via Letta) provides contextually appropriate responses with context management per FR-4a.

**AC-I4:** Fish Audio TTS generates natural-sounding audio for all system prompts.

---

## 12. Team Task Recommendations

Based on 48-hour hackathon timeline with 4 developers, recommended team structure:

### Dev 1 - Training Mode Owner (Frontend Focus)
**Responsibilities:**
- Set up Lens Studio project and Spectacles development environment
- Implement AR overlay rendering (glowing circles, arrows, text)
- Integrate Snap ASR for voice input
- Implement training mode workflow and state management
- Computer vision integration for hand/wrist detection (MediaPipe Hands)
- Testing of complete training mode flow

**Key Deliverables:**
- Functional pulse taking training mode with AR guidance
- Voice-activated training initiation with wake word support
- Real-time technique feedback

**Estimated Hours:** 20 hours development, 4 hours integration/testing

**Critical Handoffs:**
- Hour 12: AR component library ready for Dev 2
- Hour 24: Voice input handler ready for Dev 2's clinical mode
- Hour 36: Complete training mode ready for demo

---

### Dev 2 - Clinical Mode Owner (Frontend Focus)
**Responsibilities:**
- Implement clinical mode UI/AR displays (patient cards, vital sign overlays)
- Voice command routing for clinical actions
- Integration with backend API for patient data retrieval
- Symptom recording interface
- Prescription workflow UI
- Mode switching and session management

**Key Deliverables:**
- Functional patient assessment workflow
- Voice-activated patient information retrieval (with and without wake word per FR-15)
- AR patient information cards
- Prescription UI with visual confirmations

**Estimated Hours:** 20 hours development, 4 hours integration/testing

**Dependencies:** Dev 1's AR components (hour 12), Dev 3's backend APIs (hour 24)

---

### Dev 3 - AI & Backend Infrastructure (Backend Focus)
**Responsibilities:**
- Set up Node.js/Express server on Railway
- Implement all API endpoints (patient CRUD, decision support, prescription)
- Integrate Gemini API with Letta context wrapper (with context size management per FR-4a)
- Integrate Fish Audio TTS API (with response caching per FR-44a)
- Build clinical decision support logic (rule engine for symptom-diagnosis mapping)
- Implement drug interaction checking engine
- Create API documentation

**Key Deliverables:**
- Working REST API with all 8 endpoint families
- AI-powered clinical suggestions (3 scenarios working)
- TTS audio generation with caching
- Drug safety checking (interaction + allergy validation)

**Estimated Hours:** 24 hours development, 4 hours integration/testing

**Critical Handoffs:**
- Hour 12: Patient load endpoint working
- Hour 24: Training feedback endpoint working
- Hour 30: Clinical decision support endpoint working
- Hour 36: Prescription endpoint working

---

### Dev 4 - Data & CV & Integration Owner (Full-Stack Focus)
**Responsibilities:**
- Set up Supabase database and schema
- Create seed data (3-5 mock patients with updated Sarah Chen data)
- Build patient database CRUD operations
- Integrate MediaPipe Hands CV model (deliver to Dev 1)
- End-to-end integration testing (all developers' work)
- Performance monitoring and optimization
- Create fallback/demo mode implementations

**Key Deliverables:**
- Functional database with updated seed data (Sarah Chen has Warfarin)
- CV pipeline for hand/wrist detection
- Stable system integration
- Demo-ready environment

**Estimated Hours:** 22 hours development, 6 hours integration/testing

**Critical Handoffs:**
- Hour 6: Database schema + seed data ready
- Hour 24: CV model pipeline ready for Dev 1
- Hour 36: Integration testing complete
- Hour 42: All systems tested and stable

---

### Shared Responsibilities (All Devs)
- Daily standups at hour 0, 12, 24, 36
- Code reviews for critical integration points
- Demo rehearsal and presentation preparation (final 4 hours)
- Documentation updates

---

## Appendix A: Three-Minute Demo Script

**0:00-0:30 - Hook & Problem Statement**
- "Hi everyone, I'm presenting MedSnap - a hands-free AR medical assistant built for Snap Spectacles."
- "Healthcare workers face information overload and need both better training and on-the-job support."

**0:30-1:15 - Training Mode Demo**
- "First, let me show you training mode." [Puts on Spectacles]
- "Hey MedSnap, start training pulse taking."
- [System guides through pulse taking with AR overlays showing exact finger placement]
- "Notice the AR overlay highlighting the exact pulse point, and real-time feedback on my hand position—all completely hands-free using voice and computer vision."
- [Complete procedure with voice guidance]

**1:15-2:15 - Clinical Mode Demo**
- "Now let me show the real power—clinical assistance."
- "Hey MedSnap, start assessment patient Sarah Chen."
- [AR displays patient card with history, allergies, current symptoms]
- "The system pulls up her complete profile. I can see she's here for a persistent cough and fever."
- "Record symptom: chest tightness." [Note: No wake word needed in-session]
- [System reads vital sign monitor using CV, displays readings]
- "It automatically reads the vital signs monitor—BP 118 over 76, heart rate 88, O2 sat 97%."
- [System provides clinical decision support]
- "Based on her symptoms and vitals, it suggests this is likely an upper respiratory infection and gives me specific recommendations for next steps."

**2:15-2:50 - Prescription & Safety Demo**
- "But wait, there's the best part. Show medications." [Display Sarah's medication list - includes Warfarin]
- "I see she's on Warfarin for her atrial fibrillation. Let me prescribe something for her cough pain."
- "Prescribe Ibuprofen 400mg." [No wake word needed]
- [System checks drug interactions]
- "WARNING: Drug interaction detected with Warfarin. The system prevents a potentially dangerous error and suggests a safer alternative - acetaminophen instead."
- "This is the power of AI-driven safety checks happening in real-time, hands-free."

**2:50-3:00 - Closing Value Prop**
- "MedSnap combines Snap Spectacles' AR capabilities, Fish Audio's natural text-to-speech, and Gemini's AI to create a completely hands-free assistant that reduces errors, saves time, and helps healthcare workers make better decisions."
- "Thank you!"

---

## Appendix B: API Response Examples

### Patient Load Response
```json
{
  "success": true,
  "patient": {
    "id": "uuid-123",
    "name": "Sarah Chen",
    "age": 34,
    "sex": "Female",
    "chief_complaint": "Persistent cough and fever",
    "current_symptoms": ["fever", "cough", "fatigue", "chest tightness"],
    "vital_signs": {
      "bp": "118/76",
      "hr": 88,
      "o2": 97,
      "temp": 101.5
    },
    "allergies": ["Penicillin"],
    "medications": [
      {
        "name": "Warfarin",
        "dosage": "5mg daily",
        "started": "2024-03-01"
      },
      {
        "name": "Loratadine",
        "dosage": "10mg daily",
        "started": "2024-01-15"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-10-01",
        "diagnosis": "Seasonal allergies",
        "provider": "Dr. Smith"
      },
      {
        "date": "2024-08-15",
        "diagnosis": "Annual checkup - healthy",
        "provider": "Dr. Smith"
      },
      {
        "date": "2024-03-01",
        "diagnosis": "Atrial fibrillation",
        "provider": "Dr. Lee"
      }
    ]
  },
  "ar_config": {
    "display_duration": 10000,
    "card_position": "top_center",
    "priority_fields": ["allergies", "medications"]
  }
}
```

### Clinical Decision Support Response
```json
{
  "success": true,
  "analysis": {
    "primary_diagnosis": "Upper Respiratory Infection",
    "confidence": 0.85,
    "reasoning": "Combination of fever (101.5°F), productive cough, fatigue, and chest tightness consistent with URI. Normal O2 saturation rules out lower respiratory involvement.",
    "recommendations": [
      "Perform chest auscultation to check for wheezing or crackles",
      "Monitor O2 saturation over next 24 hours",
      "Consider chest X-ray if symptoms worsen or persist beyond 7 days",
      "Supportive care: rest, fluids, over-the-counter symptom relief"
    ],
    "warnings": [],
    "follow_up": "If fever persists beyond 3 days or shortness of breath develops, escalate to physician for possible bacterial infection and antibiotic consideration."
  },
  "tts_url": "https://fish-audio.example.com/audio/xyz123.mp3"
}
```

### Prescription Safety Check Response (Warning)
```json
{
  "success": false,
  "blocked": true,
  "warnings": [
    {
      "type": "drug_interaction",
      "severity": "high",
      "message": "Ibuprofen increases bleeding risk when combined with Warfarin (anticoagulant).",
      "explanation": "NSAIDs like Ibuprofen can potentiate the effects of anticoagulants, increasing risk of serious bleeding complications."
    }
  ],
  "alternatives": [
    {
      "medication": "Acetaminophen",
      "dosage": "500mg every 6 hours as needed",
      "rationale": "Safer pain relief option with no anticoagulant interaction"
    }
  ],
  "tts_url": "https://fish-audio.example.com/audio/warning456.mp3"
}
```

### Prescription Success Response
```json
{
  "success": true,
  "blocked": false,
  "prescription": {
    "id": "rx-789",
    "medication": "Acetaminophen",
    "dosage": "500mg every 6 hours as needed",
    "status": "pending_physician_approval",
    "created_at": "2025-10-24T10:30:00Z"
  },
  "ar_display": {
    "icon": "checkmark_green",
    "message": "Prescription logged: Acetaminophen 500mg",
    "badge": "PENDING"
  },
  "tts_url": "https://fish-audio.example.com/audio/prescription-logged.mp3"
}
```

---

## Document Control

**Version History:**
- v1.0 - October 24, 2025 - Initial PRD created for 48-hour hackathon
- v1.1 - October 24, 2025 - Implemented review recommendations, renamed to MedSnap

**Approvals:**
- Product Owner: [Name] - [Date]
- Technical Lead: [Name] - [Date]
- Project Sponsor: [Name] - [Date]

**Related Documents:**
- Technical Architecture Diagram: `0001-architecture-medsnap.md`
- PRD Review & Task Split Recommendations: `prd-review-and-recommendations.md`
- Task Breakdown: To be created by team

**Contact:**
- Product Manager: [Contact info]
- Technical Questions: [Dev lead contact]
- Demo Coordination: [Team lead contact]

---

**END OF DOCUMENT**
