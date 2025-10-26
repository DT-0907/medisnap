# Spectacles Sample Patterns Reference
## For Dev 2: Clinical Mode & Prescription UI

This document provides patterns extracted from Spectacles sample projects relevant to Dev 2 tasks.

## Voice Playback Sample (TTS Integration)
**Location**: `Spectacles-Sample/Voice Playback/`

### Key Patterns:

1. **Audio Recording and Playback**:
```javascript
// From MicrophoneRecorder.ts
const audioComponent = sceneObject.getComponent("Component.AudioComponent");
audioComponent.audioTrack = recordedAudioTrack;
audioComponent.play(1);
```

2. **Microphone Access**:
```javascript
// Request microphone permission
const microphoneModule = require("MicrophoneModule");
microphoneModule.requestPermission((granted) => {
    if (granted) {
        // Start recording
        microphoneModule.startRecording();
    }
});
```

3. **Audio State Management**:
```javascript
// Store audio locally (temporary storage)
const audioBuffer = microphoneModule.stopRecording();
// Convert to audio track for playback
const audioTrack = AudioTrack.create(audioBuffer);
```

## AI Playground Sample (Backend Communication)
**Location**: `Spectacles-Sample/AI Playground/`

### Key Patterns:

1. **Remote Service Gateway Setup**:
```javascript
// HTTP request pattern
const RemoteServiceModule = require("RemoteServiceModule");
const request = RemoteServiceModule.createHttpRequest();
request.url = apiUrl;
request.method = "POST";
request.headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + apiToken
};
request.body = JSON.stringify(requestData);
```

2. **API Response Handling**:
```javascript
RemoteServiceModule.performHttpRequest(request, (response) => {
    if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        // Process response
        handleApiResponse(data);
    } else {
        // Error handling
        handleApiError(response);
    }
});
```

3. **Text-to-Speech Integration**:
```javascript
// TTS API pattern
const ttsRequest = {
    text: "Your prescription has been created",
    voice: "en-US-Standard-C",
    speed: 1.0
};

// Send to TTS service
sendTTSRequest(ttsRequest, (audioUrl) => {
    // Play returned audio
    playAudioFromUrl(audioUrl);
});
```

## Essentials Sample (State Management)
**Location**: `Spectacles-Sample/Essentials/`

### Key Patterns:

1. **State Machine Pattern**:
```javascript
const States = {
    IDLE: "idle",
    ACTIVE: "active",
    PROCESSING: "processing",
    COMPLETE: "complete"
};

let currentState = States.IDLE;

function transitionTo(newState) {
    // Exit current state
    exitState(currentState);

    // Enter new state
    currentState = newState;
    enterState(newState);
}
```

2. **Timer Management**:
```javascript
let inactivityTimer = null;

function resetInactivityTimer() {
    if (inactivityTimer) {
        script.clearTimeout(inactivityTimer);
    }

    inactivityTimer = script.setTimeout(() => {
        // Handle timeout
        onInactivityTimeout();
    }, TIMEOUT_DURATION);
}
```

## Agentic Playground Sample (Agent Interactions)
**Location**: `Spectacles-Sample/Agentic Playground/`

### Key Patterns:

1. **Conversation Context Management**:
```javascript
const conversationHistory = [];
const MAX_CONTEXT_LENGTH = 20;

function addToContext(role, message) {
    conversationHistory.push({ role, message });

    // Maintain rolling window
    if (conversationHistory.length > MAX_CONTEXT_LENGTH) {
        conversationHistory.shift();
    }
}
```

2. **AI Response Streaming**:
```javascript
function streamAIResponse(prompt, onChunk, onComplete) {
    const request = createAIRequest(prompt);

    RemoteServiceModule.performStreamingRequest(request, {
        onData: (chunk) => {
            const text = parseChunk(chunk);
            onChunk(text);
        },
        onEnd: () => {
            onComplete();
        },
        onError: (error) => {
            handleStreamError(error);
        }
    });
}
```

## UI Rendering Patterns (Common Across Samples)

### AR Text Display:
```javascript
// Create text component
const textComponent = sceneObject.createComponent("Component.Text");
textComponent.text = "Patient: Sarah Chen";
textComponent.size = 24; // Minimum 18pt for readability
textComponent.color = new vec4(1, 1, 1, 1);

// Position text in screen space
const screenTransform = sceneObject.getComponent("Component.ScreenTransform");
screenTransform.anchors.setCenter(0.5, 0.9); // Top center
screenTransform.anchors.setSize(400, 100);
```

### Fade Animations:
```javascript
// Fade in/out pattern
function fadeIn(sceneObject, duration = 0.5) {
    const material = sceneObject.getComponent("Component.RenderMeshVisual").mainMaterial;
    const startAlpha = 0;
    const endAlpha = 1;

    animateAlpha(material, startAlpha, endAlpha, duration);
}

function animateAlpha(material, from, to, duration) {
    const startTime = getTime();

    const updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(() => {
        const elapsed = getTime() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const alpha = lerp(from, to, progress);
        material.mainPass.baseColor = new vec4(1, 1, 1, alpha);

        if (progress >= 1) {
            script.removeEvent(updateEvent);
        }
    });
}
```

## Error Handling Patterns

### Network Retry Logic:
```javascript
function performRequestWithRetry(request, maxRetries = 3) {
    let retryCount = 0;

    function attemptRequest() {
        RemoteServiceModule.performHttpRequest(request, (response) => {
            if (response.statusCode === 200) {
                handleSuccess(response);
            } else if (retryCount < maxRetries) {
                retryCount++;
                print(`Retry attempt ${retryCount} of ${maxRetries}`);

                // Exponential backoff
                const delay = Math.pow(2, retryCount) * 1000;
                script.setTimeout(attemptRequest, delay);
            } else {
                handleFailure(response);
            }
        });
    }

    attemptRequest();
}
```

### Graceful Degradation:
```javascript
// Demo mode fallback
function loadPatientData(patientName) {
    if (global.MedSnapConfig.DEMO_MODE) {
        // Use mock data
        return getMockPatientData(patientName);
    }

    // Attempt API call
    apiClient.loadPatient(patientName, (error, data) => {
        if (error) {
            print("API failed, falling back to demo mode");
            return getMockPatientData(patientName);
        }
        return data;
    });
}
```

## Performance Optimization Patterns

### Object Pooling:
```javascript
const textPool = [];
const MAX_POOL_SIZE = 10;

function getTextComponent() {
    // Reuse from pool if available
    if (textPool.length > 0) {
        const text = textPool.pop();
        text.enabled = true;
        return text;
    }

    // Create new if pool empty
    return createTextComponent();
}

function releaseTextComponent(text) {
    if (textPool.length < MAX_POOL_SIZE) {
        text.enabled = false;
        text.text = "";
        textPool.push(text);
    } else {
        // Destroy if pool is full
        text.destroy();
    }
}
```

### Debouncing:
```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Usage for voice commands
const handleVoiceCommand = debounce((command) => {
    processCommand(command);
}, 500);
```

## Integration Tips

1. **Always check for component availability** before using:
```javascript
if (global.RemoteServiceModule) {
    // Use remote service
} else {
    // Fallback to demo mode
}
```

2. **Use proper event cleanup** to prevent memory leaks:
```javascript
const updateEvent = script.createEvent("UpdateEvent");
// ... use event ...
// Clean up when done
script.removeEvent(updateEvent);
```

3. **Respect platform limitations**:
- Keep text size ≥18pt for readability
- Maintain ≥30 FPS for smooth AR
- Respond to voice within 3 seconds
- Auto-hide UI elements after use

## References
- Voice Playback: Audio recording and TTS playback
- AI Playground: Backend API integration
- Essentials: Basic state management
- Agentic Playground: AI conversation handling
- SpectaclesInteractionKit: UI animations and interactions

These patterns should be adapted to MedSnap requirements while maintaining KISS principle.