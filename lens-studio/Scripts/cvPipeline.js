/**
 * Computer Vision Pipeline - MedSnap CV Integration
 * Real-time hand detection and nursing guidance system
 * 
 * Features:
 * - MediaPipe Hands detection with 21-point landmarks
 * - Wrist and pulse point detection
 * - Finger placement validation
 * - Pressure detection via hand tension heuristics
 * - Real-time nursing guidance with textbox output
 * - Toggle button control for guidance sessions
 */

//@input Asset.MLModel handLandmarkerModel
//@input Component.Camera camera
//@input Component.Text guidanceTextBox
//@input Component.Button toggleButton
//@input Component.Text buttonText
//@input string onText = "STOP GUIDANCE"
//@input string offText = "START GUIDANCE"
//@input vec4 onColor = {1, 0, 0, 1}  // Red when active
//@input vec4 offColor = {0, 1, 0, 1} // Green when inactive

/**
 * CV Pipeline with Nursing Guidance System
 */
var CVPipeline = function () {
    this.isActive = false;
    this.mlComponent = null;
    this.currentStep = 0;
    this.stepStartTime = 0;
    this.lastMessage = "";
    this.isPressed = false;
    this.wristCallbacks = [];
    this.fingerCallbacks = [];

    // Step-by-step guidance messages
    this.guidanceSteps = [
        "Welcome to MedSnap Pulse Training. Position the patient's arm at heart level, palm down.",
        "Place your index and middle fingers on the radial pulse point, just below the thumb on the wrist.",
        "Apply gentle pressure to feel the pulse. You should feel a rhythmic throbbing sensation.",
        "Maintain consistent, gentle pressure. Too much pressure can occlude the pulse.",
        "Count the pulse for 30 seconds, then multiply by 2 for beats per minute.",
        "Excellent! You've completed the pulse assessment. Record the rate, rhythm, and strength."
    ];

    this.initializeSystem();
};

/**
 * Initialize the CV pipeline system
 */
CVPipeline.prototype.initializeSystem = function () {
    try {
        // Create ML Component for hand detection
        this.mlComponent = script.getSceneObject().createComponent("Component.MLComponent");
        this.mlComponent.model = script.handLandmarkerModel;

        // Configure ML Component
        var inputTexture = script.camera.renderTarget.getTexture();
        this.mlComponent.build([inputTexture]);

        this.mlComponent.onLoadingFinished = function () {
            print("[CVPipeline] Hand landmarker model loaded successfully!");
        };

        this.mlComponent.onRunningFinished = function (state, outputs) {
            if (state === MachineLearning.FrameState.Success) {
                var landmarks = parseLandmarks(outputs);
                if (landmarks && landmarks.length >= 21) {
                    processHandLandmarks(landmarks);
                }
            }
        };

        // Bind toggle button events
        this.bindToggleButton();

        print("[CVPipeline] CV Pipeline initialized successfully");
    } catch (error) {
        print("[CVPipeline] Failed to initialize: " + error);
    }
};

/**
 * Bind toggle button events
 */
CVPipeline.prototype.bindToggleButton = function () {
    var self = this;

    if (script.toggleButton) {
        script.toggleButton.onTouch = function (eventData) {
            self.toggleGuidance();
        };

        script.toggleButton.onTap = function (eventData) {
            self.toggleGuidance();
        };
    }
};

/**
 * Toggle guidance on/off
 */
CVPipeline.prototype.toggleGuidance = function () {
    this.isPressed = !this.isPressed;

    if (this.isPressed) {
        this.startGuidance();
    } else {
        this.stopGuidance();
    }

    this.updateButtonAppearance();
    print("[CVPipeline] Guidance " + (this.isPressed ? "STARTED" : "STOPPED"));
};

/**
 * Start the guidance session
 */
CVPipeline.prototype.startGuidance = function () {
    this.isActive = true;
    this.currentStep = 0;
    this.stepStartTime = getTime() * 1000;

    this.displayCurrentStep();
    print("[CVPipeline] Guidance session started");
};

/**
 * Stop the guidance session
 */
CVPipeline.prototype.stopGuidance = function () {
    this.isActive = false;
    this.currentStep = 0;
    this.lastMessage = "";

    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = "Guidance stopped. Press button to start again.";
    }

    print("[CVPipeline] Guidance session stopped");
};

/**
 * Update button appearance
 */
CVPipeline.prototype.updateButtonAppearance = function () {
    if (script.buttonText) {
        script.buttonText.text = this.isPressed ? script.onText : script.offText;
    }

    // Update button color if possible
    if (script.toggleButton && script.toggleButton.mainPass) {
        var color = this.isPressed ? script.onColor : script.offColor;
        script.toggleButton.mainPass.baseColor = color;
    }

    // Update button scale for visual feedback
    if (script.toggleButton) {
        var transform = script.toggleButton.getSceneObject().getTransform();
        var scale = this.isPressed ? 0.95 : 1.0;
        transform.setLocalScale(new vec3(scale, scale, scale));
    }
};

/**
 * Display current step
 */
CVPipeline.prototype.displayCurrentStep = function () {
    if (!this.isActive || this.currentStep >= this.guidanceSteps.length) {
        return;
    }

    var message = this.guidanceSteps[this.currentStep];
    this.lastMessage = message;

    // Update textbox
    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = message;
    }

    print("[CVPipeline] Step " + (this.currentStep + 1) + ": " + message);

    // Auto-advance after 5 seconds
    var self = this;
    script.createEvent("DelayedCallbackEvent").bind(function (eventData) {
        if (self.isActive) {
            self.advanceToNextStep();
        }
    });
    script.getSceneObject().enabled = true;
    script.getSceneObject().enabled = false;
};

/**
 * Advance to next step
 */
CVPipeline.prototype.advanceToNextStep = function () {
    if (!this.isActive) {
        return;
    }

    this.currentStep++;

    if (this.currentStep >= this.guidanceSteps.length) {
        // Completed all steps
        this.displayCompletionMessage();
    } else {
        this.displayCurrentStep();
    }
};

/**
 * Display completion message
 */
CVPipeline.prototype.displayCompletionMessage = function () {
    var message = "Training completed! Press button to start again.";
    this.lastMessage = message;

    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = message;
    }

    print("[CVPipeline] Training completed!");

    // Reset for next session
    var self = this;
    script.createEvent("DelayedCallbackEvent").bind(function (eventData) {
        self.currentStep = 0;
        self.isActive = false;
        self.isPressed = false;
        self.updateButtonAppearance();
    });
    script.getSceneObject().enabled = true;
    script.getSceneObject().enabled = false;
};

/**
 * Process hand landmarks and provide contextual feedback
 */
function processHandLandmarks(landmarks) {
    if (!cvPipeline.isActive) {
        return;
    }

    try {
        // Find wrist position
        var wrist = findWrist(landmarks);
        if (!wrist) {
            showNoHandsFeedback();
            return;
        }

        // Find pulse point
        var pulsePoint = findRadialPulsePoint(landmarks, 'Right');

        // Validate finger placement
        var validation = validateFingerPlacement(landmarks, landmarks);

        // Detect pressure
        var pressureDetection = detectPressure(landmarks, landmarks);

        // Provide contextual feedback based on current step
        var contextualMessage = getContextualFeedback(validation, pressureDetection);
        if (contextualMessage) {
            displayContextualFeedback(contextualMessage);
        }

        // Trigger callbacks
        triggerWristCallbacks(wrist);
        triggerFingerCallbacks(validation);

    } catch (error) {
        print("[CVPipeline] Error processing hand landmarks: " + error);
        showErrorFeedback();
    }
}

/**
 * Get contextual feedback based on CV analysis
 */
function getContextualFeedback(validation, pressureDetection) {
    var currentStep = cvPipeline.currentStep;

    // Step 2: Hand Positioning
    if (currentStep === 1) {
        if (!validation.isCorrect) {
            return "Adjust your finger position. " + validation.feedback;
        }
    }

    // Step 3: Pulse Detection
    if (currentStep === 2) {
        if (validation.isCorrect && pressureDetection.level === 'optimal') {
            return "Perfect! You're in the right position with good pressure.";
        }
    }

    // Step 4: Pressure Adjustment
    if (currentStep === 3) {
        if (pressureDetection.level === 'too_heavy') {
            return pressureDetection.feedback;
        } else if (pressureDetection.level === 'too_light') {
            return pressureDetection.feedback;
        }
    }

    return null;
}

/**
 * Display contextual feedback
 */
function displayContextualFeedback(feedback) {
    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = feedback;
    }
    print("[CVPipeline] Contextual Feedback: " + feedback);
}

/**
 * Show feedback when no hands are detected
 */
function showNoHandsFeedback() {
    var message = "I don't see any hands. Please ensure the patient's wrist is visible and well-lit.";
    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = message;
    }
    print("[CVPipeline] No hands detected: " + message);
}

/**
 * Show error feedback
 */
function showErrorFeedback() {
    var message = "I'm having trouble analyzing the hand position. Please ensure good lighting and try again.";
    if (script.guidanceTextBox) {
        script.guidanceTextBox.text = message;
    }
    print("[CVPipeline] Error feedback: " + message);
}

/**
 * Parse MediaPipe Hands output
 */
function parseLandmarks(outputs) {
    var landmarks = [];
    var landmarkData = outputs[0];

    for (var i = 0; i < 21; i++) {
        landmarks.push({
            x: landmarkData[i * 3],
            y: landmarkData[i * 3 + 1],
            z: landmarkData[i * 3 + 2]
        });
    }

    return landmarks;
}

/**
 * Find wrist position from landmarks
 */
function findWrist(landmarks) {
    if (!landmarks || landmarks.length < 21) {
        return null;
    }

    return {
        position: {
            x: landmarks[0].x,
            y: landmarks[0].y,
            z: landmarks[0].z
        }
    };
}

/**
 * Find radial pulse point
 */
function findRadialPulsePoint(landmarks, handedness) {
    var wrist = landmarks[0];
    var thumbTip = landmarks[4];

    var dx = thumbTip.x - wrist.x;
    var dy = thumbTip.y - wrist.y;

    var magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return null;

    dx /= magnitude;
    dy /= magnitude;

    var PULSE_POINT_OFFSET = 0.02;

    return {
        x: wrist.x + dx * PULSE_POINT_OFFSET,
        y: wrist.y + dy * PULSE_POINT_OFFSET,
        z: wrist.z
    };
}

/**
 * Validate finger placement
 */
function validateFingerPlacement(wristLandmarks, fingerLandmarks) {
    var pulsePoint = findRadialPulsePoint(wristLandmarks, 'Right');
    var indexTip = fingerLandmarks[8];
    var middleTip = fingerLandmarks[12];

    var avgFingerPos = {
        x: (indexTip.x + middleTip.x) / 2,
        y: (indexTip.y + middleTip.y) / 2,
        z: (indexTip.z + middleTip.z) / 2
    };

    var dx = avgFingerPos.x - pulsePoint.x;
    var dy = avgFingerPos.y - pulsePoint.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    var PLACEMENT_TOLERANCE = 0.015;

    if (distance <= PLACEMENT_TOLERANCE) {
        return {
            isCorrect: true,
            feedback: "Good position. Apply gentle, steady pressure."
        };
    }

    var distanceCm = distance * 100;
    var direction = calculateDirection(dx, dy);

    return {
        isCorrect: false,
        feedback: "Adjust your hand. Move " + Math.round(distanceCm) + " centimeters " + direction + "."
    };
}

/**
 * Calculate direction for feedback
 */
function calculateDirection(dx, dy) {
    var angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle >= -45 && angle < 45) return "right";
    if (angle >= 45 && angle < 135) return "down";
    if (angle >= 135 || angle < -135) return "left";
    return "up";
}

/**
 * Detect pressure level
 */
function detectPressure(fingerLandmarks, wristLandmarks) {
    var fingerCurvature = calculateFingerCurvature(fingerLandmarks);
    var visibilityScore = calculateVisibilityScore(fingerLandmarks);
    var depthCompression = calculateDepthCompression(fingerLandmarks);

    var pressureScore = (
        fingerCurvature * 0.5 +
        (1 - visibilityScore) * 0.25 +
        depthCompression * 0.25
    );

    var OPTIMAL_PRESSURE_MIN = 0.30;
    var OPTIMAL_PRESSURE_MAX = 0.65;
    var EXCESSIVE_PRESSURE_THRESHOLD = 0.70;
    var TOO_LIGHT_THRESHOLD = 0.25;

    if (pressureScore > EXCESSIVE_PRESSURE_THRESHOLD) {
        return {
            level: 'too_heavy',
            feedback: "You're pressing too hard. Lighten your touch."
        };
    } else if (pressureScore >= OPTIMAL_PRESSURE_MIN && pressureScore <= OPTIMAL_PRESSURE_MAX) {
        return {
            level: 'optimal',
            feedback: "Good pressure. Apply gentle, steady pressure."
        };
    } else if (pressureScore < TOO_LIGHT_THRESHOLD) {
        return {
            level: 'too_light',
            feedback: "Apply slightly more pressure."
        };
    } else {
        return {
            level: 'optimal',
            feedback: "Good pressure. Apply gentle, steady pressure."
        };
    }
}

/**
 * Calculate finger curvature
 */
function calculateFingerCurvature(landmarks) {
    var indexMCP = landmarks[5];
    var indexTip = landmarks[8];
    var middleMCP = landmarks[9];
    var middleTip = landmarks[12];

    var indexDistance = distance2D(indexMCP, indexTip);
    var middleDistance = distance2D(middleMCP, middleTip);
    var avgDistance = (indexDistance + middleDistance) / 2;

    var curvature = Math.max(0, Math.min(1, 1 - (avgDistance / 0.30)));
    return curvature;
}

/**
 * Calculate visibility score
 */
function calculateVisibilityScore(landmarks) {
    var depths = landmarks.map(function (lm) { return lm.z; });
    var avgDepth = depths.reduce(function (a, b) { return a + b; }, 0) / depths.length;

    var variance = 0;
    for (var i = 0; i < depths.length; i++) {
        variance += Math.pow(depths[i] - avgDepth, 2);
    }
    variance /= depths.length;

    return Math.min(1, variance * 10);
}

/**
 * Calculate depth compression
 */
function calculateDepthCompression(landmarks) {
    var depths = landmarks.map(function (lm) { return lm.z; });
    var maxDepth = Math.max.apply(null, depths);
    var minDepth = Math.min.apply(null, depths);
    var range = maxDepth - minDepth;

    var compression = 1 - Math.min(1, range / 0.10);
    return compression;
}

/**
 * Calculate 2D distance
 */
function distance2D(point1, point2) {
    var dx = point1.x - point2.x;
    var dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Trigger wrist detection callbacks
 */
function triggerWristCallbacks(wrist) {
    for (var i = 0; i < cvPipeline.wristCallbacks.length; i++) {
        try {
            cvPipeline.wristCallbacks[i](wrist);
        } catch (error) {
            print("[CVPipeline] Error in wrist callback: " + error);
        }
    }
}

/**
 * Trigger finger placement callbacks
 */
function triggerFingerCallbacks(validation) {
    for (var i = 0; i < cvPipeline.fingerCallbacks.length; i++) {
        try {
            cvPipeline.fingerCallbacks[i](validation);
        } catch (error) {
            print("[CVPipeline] Error in finger callback: " + error);
        }
    }
}

// Initialize the CV pipeline
var cvPipeline = new CVPipeline();

// Initialize when script starts
script.createEvent("OnStartEvent").bind(function (eventData) {
    cvPipeline.initializeSystem();
});

// Global CV Pipeline API
global.cvPipeline = {
    initialize: function () {
        return cvPipeline.initializeSystem();
    },

    startDetection: function () {
        cvPipeline.startGuidance();
    },

    stopDetection: function () {
        cvPipeline.stopGuidance();
    },

    onWristDetected: function (callback) {
        cvPipeline.wristCallbacks.push(callback);
    },

    onFingerPlacement: function (callback) {
        cvPipeline.fingerCallbacks.push(callback);
    },

    getWristPosition: function () {
        // Return current wrist position if available
        return { x: 0, y: 0, z: 0 }; // Will be updated by CV analysis
    },

    getFingerPositions: function () {
        // Return current finger positions if available
        return []; // Will be updated by CV analysis
    },

    toggleGuidance: function () {
        cvPipeline.toggleGuidance();
    },

    getState: function () {
        return cvPipeline.isPressed;
    },

    getCurrentStep: function () {
        return cvPipeline.currentStep;
    },

    getIsActive: function () {
        return cvPipeline.isActive;
    }
};

print("[CVPipeline] Real CV Pipeline loaded with nursing guidance system");