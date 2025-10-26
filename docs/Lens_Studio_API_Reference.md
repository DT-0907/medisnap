# Lens Studio API Reference
**For Dev 2: Clinical Mode & Prescription UI Development**

This document contains extracted API documentation relevant to your Dev 2 tasks.

---

## Lens Scripting API (Runtime - Most Important for Dev 2)

### Audio & Voice Processing

#### AudioComponent
Manages audio playback for TTS responses.

**Key Methods**:
- `play()` - Start audio playback
- `pause()` - Pause playback
- `resume()` - Resume from pause
- `stop()` - Stop playback completely

**Properties**:
- Fade in/out timing support
- Spatial audio capabilities
- Volume control

**Usage for Dev 2**:
```javascript
// Play TTS audio from Fish Audio API
const audioComponent = sceneObject.getComponent("Component.AudioComponent");
audioComponent.audioTrack = ttsAudioTrack; // From API response
audioComponent.play();
```

---

#### AsrModule (Automatic Speech Recognition)
Enables voice transcription - **Critical for voice commands**.

**Key Methods**:
- `startTranscribing()` - Begin listening for voice input
- `stopTranscribing()` - Stop listening

**Modes**:
- `HighAccuracy` - Best for medical terminology
- `Balanced` - Default mode
- `HighSpeed` - Fastest, lower accuracy

**Events**:
- Transcription update events
- Error handling callbacks

**Usage for Dev 2**:
```javascript
// Start listening for in-session commands (no wake word)
const asr = global.asrModule;
asr.startTranscribing();

asr.onTranscriptionUpdate = function(transcription) {
    // Process voice command: "Record symptom: chest tightness"
    handleInSessionCommand(transcription);
};
```

---

### Text & UI Components

#### Text Component
Display patient information, symptoms, medications in AR.

**Key Properties**:
- `text` - String content to display
- `size` - Font size (use 18pt minimum per FR AR-2)
- `textFill` - Color (use TextFill object)
- `horizontalAlignment` - Left, Center, Right
- `verticalAlignment` - Top, Center, Bottom

**Advanced Features**:
- Rich formatting support
- Font selection
- Capitalization overrides

**Usage for Dev 2**:
```javascript
// Display patient name in AR card
const textComponent = sceneObject.getComponent("Component.Text");
textComponent.text = "Sarah Chen, 34, Female";
textComponent.size = 18; // Minimum per FR AR-2
textComponent.textFill.color = new vec4(1, 1, 1, 1); // White
```

---

#### BackgroundSettings
Create patient card backgrounds with styling.

**Key Properties**:
- `cornerRadius` - Rounded corners
- `fillColor` - Background color
- `margins` - Padding/spacing controls

**Usage for Dev 2**:
```javascript
// Style patient card background
const bg = textComponent.backgroundSettings;
bg.enabled = true;
bg.fillColor = new vec4(0.1, 0.1, 0.1, 0.8); // Semi-transparent dark
bg.cornerRadius = 10;
```

---

#### Canvas & ScreenTransform
Layout system for AR overlays - **Essential for patient card positioning**.

**Unit Types**:
- `Pixels` - Fixed pixel size
- `Points` - Device-independent points
- `World` - 3D world units

**ScreenTransform Properties**:
- `position` - vec3 position in chosen unit type
- `anchors` - Anchor points for responsive layout
- `offsets` - Margin offsets

**Usage for Dev 2**:
```javascript
// Position patient card at top center (per FR-13, AR-3)
const screenTransform = sceneObject.getComponent("Component.ScreenTransform");
screenTransform.anchors.setCenter(0.5, 0.9); // Top 1/3 of screen
```

---

### Animation & State Management

#### AnimationPlayer
Control AR overlay animations (fade in/out per AR-4).

**Key Methods**:
- `playClip(clipName)` - Start animation
- `pauseClip(clipName)` - Pause animation
- Clip event handling

**Usage for Dev 2**:
```javascript
// Fade in patient card (300ms per AR-4)
const animPlayer = sceneObject.getComponent("Component.AnimationPlayer");
animPlayer.playClip("fadeIn_300ms");
```

---

### Rendering & Visuals

#### Material & Mesh Rendering
Control visual appearance of AR elements.

**Blend Modes** (per FR AR-1):
- `Normal` - Standard rendering
- `Add` - Additive blending
- `Multiply` - Multiply colors
- `Screen` - Screen blending

**Usage for Dev 2**:
```javascript
// Set warning indicator to red (per FR AR-1)
const material = meshVisual.mainMaterial;
material.mainPass.baseColor = new vec4(1, 0, 0, 1); // Red #FF0000

// Set success checkmark to green
material.mainPass.baseColor = new vec4(0, 1, 0, 1); // Green #00FF00
```

---

### Data & Networking

#### Network (for Backend API Calls)
HTTP requests to Express backend.

**Common Pattern**:
```javascript
// POST to clinical API endpoint
const request = new Request(apiUrl + "/api/clinical/patient/load");
request.method = Request.HttpMethod.Post;
request.body = JSON.stringify({ patient_name: "Sarah Chen" });
request.headers = { "Content-Type": "application/json" };

remoteServiceModule.performHttpRequest(request, function(response) {
    if (response.statusCode === 200) {
        const patientData = JSON.parse(response.body);
        displayPatientCard(patientData);
    }
});
```

---

### Input & Device Access

#### CameraModule
Access device camera for future CV features.

**Properties**:
- Front/back camera selection
- Mono/stereo support
- Resolution configuration

---

## Editor Scripting API (Development Time)

### Key Modules

#### Network & WebSocket
For backend communication during development.

**WebSocket Module**:
```javascript
const ws = new WebSocket("ws://localhost:3000");
ws.onmessage = function(event) {
    console.log("Received:", event.data);
};
```

#### AssetLibrary
Manage and load assets programmatically.

#### HierarchyUtils
Manipulate scene hierarchy for dynamic UI creation.

---

## Critical API Patterns for Dev 2 Tasks

### Task 2.1: Mode Manager
```javascript
// Track mode state
let currentMode = "idle"; // "idle", "clinical", "training"
let lastActivityTime = Date.now();

function switchMode(newMode) {
    exitCurrentMode();
    currentMode = newMode;
    lastActivityTime = Date.now();

    if (newMode === "clinical") {
        startClinicalMode();
    }
}

function checkInactivity() {
    const timeout = (currentMode === "clinical") ? 120000 : 10000; // 120s clinical, 10s training
    if (Date.now() - lastActivityTime > timeout) {
        autoExitMode();
    }
}
```

### Task 2.2: Patient Card Renderer
```javascript
function renderPatientCard(patientData) {
    // Create card container
    const card = scene.createSceneObject("PatientCard");
    const screenTransform = card.createComponent("Component.ScreenTransform");
    screenTransform.anchors.setCenter(0.5, 0.9); // Top center per AR-3

    // Add text components for each field
    const nameText = createTextField(card, patientData.name, 0);
    const allergyText = createTextField(card, "Allergies: " + patientData.allergies.join(", "), 1);
    allergyText.textFill.color = new vec4(1, 0, 0, 1); // Prominent red per FR-13

    // Auto-hide after 10 seconds per ar_config
    script.createEvent("DelayedCallbackEvent").bind(function() {
        card.enabled = false;
    });
    delayedEvent.reset(10); // 10 seconds
}
```

### Task 2.3: Clinical Mode State Machine
```javascript
// State machine states
const ClinicalState = {
    IDLE: "idle",
    LOADING_PATIENT: "loading_patient",
    PATIENT_LOADED: "patient_loaded",
    RECORDING_SYMPTOM: "recording_symptom",
    ANALYZING: "analyzing",
    PRESCRIBING: "prescribing"
};

let clinicalState = ClinicalState.IDLE;
let retryCount = 0;

function startAssessment(patientName) {
    clinicalState = ClinicalState.LOADING_PATIENT;
    callAPI("/api/clinical/patient/load", { patient_name: patientName }, onPatientLoaded);
}

function onPatientLoaded(response) {
    if (response.success) {
        clinicalState = ClinicalState.PATIENT_LOADED;
        displayPatientCard(response.patient);
        retryCount = 0;
    } else {
        retryCount++;
        if (retryCount >= 3) {
            // Offer patient list per FR-14a
            offerPatientList();
        } else {
            speakTTS("Patient not found. Please repeat patient name.");
        }
    }
}
```

### Task 2.4: Prescription UI
```javascript
function handlePrescriptionCommand(medication, dosage) {
    // Show loading indicator
    showPrescriptionLoading();

    callAPI("/api/clinical/prescription/create", {
        patient_id: currentPatient.id,
        medication: medication,
        dosage: dosage
    }, function(response) {
        if (response.blocked) {
            // Show warning UI (red X, warning text)
            displayPrescriptionWarning(response.warnings, response.alternatives);
        } else {
            // Show success UI (green checkmark, PENDING badge)
            displayPrescriptionSuccess(response.prescription);
        }

        // Play TTS confirmation
        playTTSAudio(response.tts_url);
    });
}

function displayPrescriptionWarning(warnings, alternatives) {
    // Red X icon per FR-26
    const warningIcon = createIcon("warning", new vec4(1, 0, 0, 1)); // Red

    // Warning text
    const warningText = createTextField(warnings[0].message);

    // Alternative medications
    alternatives.forEach(alt => {
        createTextField("Alternative: " + alt.medication + " " + alt.dosage);
    });
}

function displayPrescriptionSuccess(prescription) {
    // Green checkmark per FR-26
    const checkmark = createIcon("checkmark", new vec4(0, 1, 0, 1)); // Green

    // Confirmation text with PENDING badge
    const confirmText = createTextField("Prescription logged: " + prescription.medication);
    const badge = createBadge("PENDING"); // Per FR-26a
}
```

---

## Color Reference (FR AR-1)

```javascript
const AR_COLORS = {
    PULSE_POINT: new vec4(0, 1, 1, 0.5),      // Cyan #00FFFF, 50% opacity
    ARROW: new vec4(1, 1, 0, 1),               // Yellow #FFFF00
    WARNING: new vec4(1, 0, 0, 1),             // Red #FF0000
    SUCCESS: new vec4(0, 1, 0, 1),             // Green #00FF00
    TEXT_WHITE: new vec4(1, 1, 1, 1),          // White
    CARD_BG: new vec4(0.1, 0.1, 0.1, 0.8)     // Semi-transparent dark
};
```

---

## Performance Best Practices

### FPS Optimization (FR-41: ≥30 FPS)
- Minimize draw calls by batching text elements
- Use object pooling for frequently created/destroyed UI
- Disable off-screen elements instead of destroying
- Limit animation updates to 30 FPS if needed

### Latency Optimization (FR-42: <3s response time)
- Cache API responses when possible
- Pre-load common TTS audio files
- Use async/await patterns for non-blocking operations
- Show loading indicators immediately on user action

---

## Error Handling Patterns

```javascript
// Graceful degradation for CV failures (FR-10a, FR-17a)
function attemptCVDetection(maxRetries = 3, timeout = 10000) {
    let retries = 0;
    const startTime = Date.now();

    const retryInterval = setInterval(function() {
        if (cvDetectionSucceeded()) {
            clearInterval(retryInterval);
            return;
        }

        retries++;
        if (retries >= maxRetries || (Date.now() - startTime) > timeout) {
            clearInterval(retryInterval);
            offerManualSkip(); // Don't block workflow
        }
    }, 2000);
}

// Unknown medication handling (FR-22a)
function handleUnknownMedication(medicationName) {
    speakTTS("Medication not found in database. Please verify spelling or select from available medications.");

    // Offer to show medication list
    showVoicePrompt("Say 'Show available medications' to see options.");
}
```

---

## Debugging Tips

### Console Logging
```javascript
print("Debug: Patient loaded - " + patientData.name); // Lens Studio console
```

### Performance Profiling
```javascript
const startTime = Date.now();
// ... operation ...
const elapsed = Date.now() - startTime;
print("Operation took: " + elapsed + "ms");
```

### Network Request Debugging
```javascript
request.onComplete = function(response) {
    print("Status: " + response.statusCode);
    print("Body: " + response.body);
    print("Headers: " + JSON.stringify(response.headers));
};
```

---

## Quick Reference: Component Access

```javascript
// Get component from scene object
const text = sceneObject.getComponent("Component.Text");
const audio = sceneObject.getComponent("Component.AudioComponent");
const screenTransform = sceneObject.getComponent("Component.ScreenTransform");
const image = sceneObject.getComponent("Component.Image");

// Create new component
const newText = sceneObject.createComponent("Component.Text");
```

---

**Last Updated**: October 24, 2025
**Source**: Snap Lens Studio API Documentation v5.13.0
