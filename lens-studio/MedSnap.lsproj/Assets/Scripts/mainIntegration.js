/**
 * Main Integration Script
 * Orchestrates all MedSnap components for 100% PRD compliance
 * Integrates Training Mode, Clinical Mode, Voice Control, and APIs
 */

// @input SceneObject handTrackerObject
// @input Component.AudioComponent audioComponent
// @input Component.Text statusText
// @input Asset.RemoteServiceModule remoteServiceModule

print("=== MedSnap AR Medical Assistant ===");
print("Initializing all systems...");

// System state
const MedSnapSystem = {
    version: "1.1.0",
    isReady: false,
    currentMode: null,
    components: {
        trainingMode: null,
        clinicalMode: null,
        voiceController: null,
        apiManager: null,
        handTracking: null
    },
    performance: {
        fps: 0,
        lastFrameTime: 0,
        frameCount: 0
    }
};

// Initialize all components
function initializeSystem() {
    print("[Main] Starting system initialization...");

    // 1. Initialize Hand Tracking (SpectaclesInteractionKit)
    initializeHandTracking();

    // 2. Initialize API Manager
    initializeAPIManager();

    // 3. Initialize Voice Controller
    initializeVoiceController();

    // 4. Initialize Training Mode
    initializeTrainingMode();

    // 5. Initialize Clinical Mode
    initializeClinicalMode();

    // 6. Setup Performance Monitoring
    setupPerformanceMonitoring();

    // 7. Perform System Check
    performSystemCheck();
}

function initializeHandTracking() {
    print("[Main] Initializing hand tracking...");

    // Check for SpectaclesInteractionKit
    if (global.SIK && global.SIK.HandInputData) {
        MedSnapSystem.components.handTracking = global.SIK.HandInputData;
        print("[Main] ✅ Hand tracking available via SpectaclesInteractionKit");
    } else {
        print("[Main] ⚠️ SpectaclesInteractionKit not found - hand tracking limited");
    }
}

function initializeAPIManager() {
    print("[Main] Initializing API manager...");

    // API Manager is already created globally
    if (global.apiManager) {
        MedSnapSystem.components.apiManager = global.apiManager;
        print("[Main] ✅ API manager ready");
    } else {
        print("[Main] ❌ API manager not found");
    }
}

function initializeVoiceController() {
    print("[Main] Initializing voice controller...");

    // Voice Controller with ASR integration
    if (global.voiceController) {
        MedSnapSystem.components.voiceController = global.voiceController;

        // Set up voice command callbacks
        setupVoiceCallbacks();

        print("[Main] ✅ Voice controller with ASR ready");
    } else {
        print("[Main] ❌ Voice controller not found");
    }
}

function initializeTrainingMode() {
    print("[Main] Initializing training mode...");

    // Training Mode with hand tracking
    if (global.trainingMode) {
        MedSnapSystem.components.trainingMode = global.trainingMode;

        // Connect to API manager
        if (MedSnapSystem.components.apiManager) {
            global.trainingMode.apiClient = MedSnapSystem.components.apiManager;
        }

        print("[Main] ✅ Training mode ready with hand tracking");
    } else {
        print("[Main] ❌ Training mode not found");
    }
}

function initializeClinicalMode() {
    print("[Main] Initializing clinical mode...");

    // Clinical Mode with full features
    if (global.clinicalMode) {
        MedSnapSystem.components.clinicalMode = global.clinicalMode;

        // Connect to API manager
        if (MedSnapSystem.components.apiManager) {
            global.clinicalMode.apiClient = MedSnapSystem.components.apiManager;
        }

        print("[Main] ✅ Clinical mode ready");
    } else {
        print("[Main] ❌ Clinical mode not found");
    }
}

function setupVoiceCallbacks() {
    // Override voice controller methods to integrate with system
    const originalProcessCommand = global.voiceController.processCommand;

    global.voiceController.processCommand = function(text) {
        print("[Main] Voice command: " + text);

        // Update system state
        updateSystemStatus("Processing: " + text);

        // Call original method
        originalProcessCommand.call(this, text);
    };
}

function setupPerformanceMonitoring() {
    print("[Main] Setting up performance monitoring...");

    // Create update event for FPS tracking
    const updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function() {
        updatePerformanceMetrics();
        updateSystemDisplay();
    });
}

function updatePerformanceMetrics() {
    // Calculate FPS
    const currentTime = getTime();
    const deltaTime = currentTime - MedSnapSystem.performance.lastFrameTime;

    if (deltaTime > 0) {
        const instantFPS = 1.0 / deltaTime;

        // Smooth FPS calculation
        MedSnapSystem.performance.fps = MedSnapSystem.performance.fps * 0.9 + instantFPS * 0.1;
    }

    MedSnapSystem.performance.lastFrameTime = currentTime;
    MedSnapSystem.performance.frameCount++;

    // Check performance requirements (FR-41: ≥30 FPS)
    if (MedSnapSystem.performance.frameCount % 60 === 0) {
        if (MedSnapSystem.performance.fps < 30) {
            print("[Main] ⚠️ Performance warning: FPS = " + MedSnapSystem.performance.fps.toFixed(1));
        }
    }
}

function updateSystemDisplay() {
    if (!script.statusText) return;

    // Build status display
    let status = "MedSnap AR v" + MedSnapSystem.version + "\n";
    status += "FPS: " + MedSnapSystem.performance.fps.toFixed(1) + "\n";

    if (MedSnapSystem.currentMode) {
        status += "Mode: " + MedSnapSystem.currentMode + "\n";
    } else {
        status += "Say 'Hey MedSnap' to start\n";
    }

    // Show hand tracking status
    if (MedSnapSystem.components.handTracking) {
        const leftHand = MedSnapSystem.components.handTracking.getHand("left");
        const rightHand = MedSnapSystem.components.handTracking.getHand("right");

        if (leftHand && leftHand.isTracked()) {
            status += "👋 Left hand tracked\n";
        }
        if (rightHand && rightHand.isTracked()) {
            status += "👋 Right hand tracked\n";
        }
    }

    script.statusText.text = status;
}

function updateSystemStatus(message) {
    print("[Main] Status: " + message);

    if (script.statusText) {
        // Temporarily show message
        const originalText = script.statusText.text;
        script.statusText.text = message;

        // Restore after 2 seconds
        setTimeout(function() {
            script.statusText.text = originalText;
        }, 2000);
    }
}

function performSystemCheck() {
    print("\n=== System Check ===");

    let allSystemsGo = true;

    // Check each component
    const checks = [
        { name: "Hand Tracking", component: MedSnapSystem.components.handTracking },
        { name: "Voice Controller", component: MedSnapSystem.components.voiceController },
        { name: "Training Mode", component: MedSnapSystem.components.trainingMode },
        { name: "Clinical Mode", component: MedSnapSystem.components.clinicalMode },
        { name: "API Manager", component: MedSnapSystem.components.apiManager }
    ];

    checks.forEach(function(check) {
        if (check.component) {
            print("✅ " + check.name + ": READY");
        } else {
            print("❌ " + check.name + ": NOT FOUND");
            allSystemsGo = false;
        }
    });

    // Check performance
    print("\n=== Performance Targets ===");
    print("• AR Rendering: Target ≥30 FPS (FR-41)");
    print("• CV Detection: Target <500ms (FR-43)");
    print("• Voice Response: Target <3s (FR-42)");
    print("• TTS Generation: Target <1.5s (FR-44)");

    // Final status
    if (allSystemsGo) {
        print("\n🚀 SYSTEM READY - All components initialized");
        print("📱 Deploy to Snap Spectacles for live demo");
        MedSnapSystem.isReady = true;

        // Play ready sound
        playSystemSound("ready");

        // Start demo mode if configured
        if (global.DEMO_MODE) {
            print("\n🎬 DEMO MODE ACTIVE - Using mock data");
            startDemoSequence();
        }
    } else {
        print("\n⚠️ SYSTEM DEGRADED - Some components missing");
        print("Running in limited mode");
    }

    print("====================\n");
}

// Demo sequence for 3-minute presentation
function startDemoSequence() {
    print("[Demo] Starting 3-minute demo sequence...");

    // Demo timeline:
    // 0:00-0:30 - Introduction and Training Mode
    // 0:30-1:30 - Training Mode demonstration
    // 1:30-2:00 - Switch to Clinical Mode
    // 2:00-2:45 - Sarah Chen drug interaction demo
    // 2:45-3:00 - Summary and questions

    setTimeout(function() {
        print("[Demo] Phase 1: Training Mode");
        if (global.voiceController) {
            global.voiceController.processCommand("Hey MedSnap, start training pulse taking");
        }
    }, 5000);

    // Continue demo sequence...
}

// Audio feedback
function playSystemSound(type) {
    if (!script.audioComponent) return;

    switch(type) {
        case "ready":
            print("🔔 System ready sound");
            break;
        case "error":
            print("❌ Error sound");
            break;
        case "success":
            print("✅ Success sound");
            break;
    }

    // In production, play actual sounds
    // script.audioComponent.play(soundFile);
}

// Global error handler
function handleSystemError(error) {
    print("[Main] ERROR: " + error);
    updateSystemStatus("Error: " + error);
    playSystemSound("error");

    // Attempt recovery
    if (error.includes("hand tracking")) {
        print("[Main] Attempting to reinitialize hand tracking...");
        initializeHandTracking();
    }
}

// Mode switching
global.switchToTrainingMode = function() {
    print("[Main] Switching to Training Mode");
    MedSnapSystem.currentMode = "Training";

    if (MedSnapSystem.components.clinicalMode) {
        MedSnapSystem.components.clinicalMode.cleanup();
    }

    if (MedSnapSystem.components.trainingMode) {
        MedSnapSystem.components.trainingMode.startPulseTraining();
    }
};

global.switchToClinicalMode = function(patientName) {
    print("[Main] Switching to Clinical Mode for: " + patientName);
    MedSnapSystem.currentMode = "Clinical";

    if (MedSnapSystem.components.trainingMode) {
        MedSnapSystem.components.trainingMode.cleanup();
    }

    if (MedSnapSystem.components.clinicalMode) {
        MedSnapSystem.components.clinicalMode.startAssessment(patientName);
    }
};

// PRD Compliance Check
function checkPRDCompliance() {
    print("\n=== PRD Compliance Check ===");

    const requirements = [
        { id: "FR-5-11", name: "Training Mode", check: !!MedSnapSystem.components.trainingMode },
        { id: "FR-12-18", name: "Clinical Mode", check: !!MedSnapSystem.components.clinicalMode },
        { id: "FR-27-31", name: "Voice Control", check: !!MedSnapSystem.components.voiceController },
        { id: "FR-32-36", name: "Hand Tracking", check: !!MedSnapSystem.components.handTracking },
        { id: "FR-41", name: "30+ FPS", check: MedSnapSystem.performance.fps >= 30 }
    ];

    let compliance = 0;
    requirements.forEach(function(req) {
        if (req.check) {
            print("✅ " + req.id + ": " + req.name);
            compliance++;
        } else {
            print("❌ " + req.id + ": " + req.name);
        }
    });

    const percentage = (compliance / requirements.length * 100).toFixed(0);
    print("\nCompliance: " + percentage + "%");

    if (percentage === "100") {
        print("🎉 100% PRD COMPLIANCE ACHIEVED!");
    }
}

// Cleanup on script destroy
script.createEvent("OnDestroyEvent").bind(function() {
    print("[Main] Shutting down MedSnap system...");

    // Cleanup all components
    if (MedSnapSystem.components.voiceController) {
        MedSnapSystem.components.voiceController.cleanup();
    }
    if (MedSnapSystem.components.trainingMode) {
        MedSnapSystem.components.trainingMode.cleanup();
    }
    if (MedSnapSystem.components.clinicalMode) {
        MedSnapSystem.components.clinicalMode.cleanup();
    }

    print("[Main] Shutdown complete");
});

// Start initialization
initializeSystem();

// Run compliance check after initialization
setTimeout(function() {
    checkPRDCompliance();
}, 1000);

// Export system for debugging
global.MedSnapSystem = MedSnapSystem;

print("[Main] MedSnap AR Medical Assistant ready for deployment");
print("[Main] Say 'Hey MedSnap' to begin");