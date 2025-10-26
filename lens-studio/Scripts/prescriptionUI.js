/**
 * Prescription UI Component
 * Dev 2 - Task Group 7: Prescription UI
 *
 * CRITICAL: Handles Warfarin + Ibuprofen drug interaction demo
 * Following TDD - implementation to pass tests written in prescriptionUI.test.js
 */

// @input SceneObject prescriptionCard
// @input Component.Text prescriptionText
// @input Component.Text warningText
// @input Component.Text medicationListText
// @input Component.AudioComponent audioComponent
// @input Component.ScreenTransform screenTransform

const PrescriptionUI = (function() {
    // Dependencies
    const apiClient = global.ApiClient;
    const stateManager = global.StateManager;
    const config = global.MedSnapConfig;

    // UI states
    const UI_STATES = {
        HIDDEN: 'HIDDEN',
        SUCCESS: 'SUCCESS',
        WARNING: 'WARNING',
        MEDICATION_LIST: 'MEDICATION_LIST',
        ERROR: 'ERROR'
    };

    // Current state
    let currentUIState = UI_STATES.HIDDEN;
    let autoHideTimer = null;
    let warningAcknowledged = false;

    /**
     * Initialize prescription UI
     */
    function initialize() {
        hideAllUI();
        currentUIState = UI_STATES.HIDDEN;
        warningAcknowledged = false;
    }

    /**
     * Task 7.2: Parse prescription command from voice input
     * Extract medication name and dosage information
     */
    function parsePrescriptionCommand(command) {
        const result = {
            medication: null,
            dosage: '',
            ambiguous: false,
            error: null
        };

        // Clean and normalize command
        const cleanCommand = command.toLowerCase().trim();

        // Extract medication and dosage using regex
        const prescribeMatch = cleanCommand.match(/prescribe\s+([a-z]+)(?:\s+(.+))?/i);

        if (!prescribeMatch) {
            result.error = "Invalid prescription command";
            return result;
        }

        const medicationInput = prescribeMatch[1];
        const dosageInput = prescribeMatch[2] || '';

        // Find matching medication from database
        const medications = config.MEDICATIONS || [];
        let matchedMedication = null;

        // Try exact match first (case insensitive)
        for (let med of medications) {
            if (med.name.toLowerCase() === medicationInput.toLowerCase()) {
                matchedMedication = med;
                break;
            }
        }

        // If no exact match, try partial match
        if (!matchedMedication) {
            for (let med of medications) {
                if (med.name.toLowerCase().startsWith(medicationInput.toLowerCase())) {
                    matchedMedication = med;
                    result.ambiguous = true;
                    break;
                }
            }
        }

        if (matchedMedication) {
            result.medication = matchedMedication.name;
            result.dosage = normalizeDosage(dosageInput);
        } else {
            result.medication = null;
            result.error = config.ERROR_MESSAGES.MEDICATION_NOT_FOUND;
        }

        return result;
    }

    /**
     * Normalize dosage format (e.g., "400 mg" → "400mg")
     */
    function normalizeDosage(dosageString) {
        if (!dosageString) return '';

        let normalized = dosageString.toLowerCase().trim();

        // Replace common variations
        normalized = normalized
            .replace(/milligrams?/g, 'mg')
            .replace(/\s+mg/g, 'mg')
            .replace(/\s+/g, ' ')
            .trim();

        // Convert written numbers to digits (simple cases)
        const numberWords = {
            'two hundred': '200',
            'four hundred': '400',
            'five hundred': '500',
            'six hundred': '600',
            'eight hundred': '800'
        };

        for (let [word, digit] of Object.entries(numberWords)) {
            normalized = normalized.replace(word, digit);
        }

        // Extract just the dosage part (e.g., "5mg daily" → "5mg")
        const dosageMatch = normalized.match(/(\d+\s*mg)/);
        if (dosageMatch) {
            return dosageMatch[1].replace(/\s+/g, '');
        }

        return normalized;
    }

    /**
     * Task 7.3: Create prescription with API integration
     */
    function createPrescription(command) {
        return new Promise(async (resolve, reject) => {
            try {
                // Parse the command
                const parsed = parsePrescriptionCommand(command);

                if (parsed.error) {
                    showError(parsed.error);
                    resolve({ success: false, error: parsed.error });
                    return;
                }

                // Get current patient data
                const state = stateManager.getState();
                const patient = state.currentPatient;

                if (!patient) {
                    showError("No patient loaded");
                    resolve({ success: false, error: "No patient loaded" });
                    return;
                }

                // Call prescription API
                const requestData = {
                    patient_id: patient.id || 'mock_patient_id',
                    medication: parsed.medication,
                    dosage: parsed.dosage,
                    patient_medications: patient.medications || []
                };

                const response = await apiClient.createPrescription(requestData);

                // Handle response based on success/warning
                if (response.success) {
                    showSuccessUI(parsed.medication, parsed.dosage, response);
                } else if (response.blocked) {
                    showWarningUI(response);
                }

                // Play audio response if available
                if (response.audio_url && script.audioComponent) {
                    playAudio(response.audio_url);
                }

                resolve(response);

            } catch (error) {
                showError("Error creating prescription");
                reject(error);
            }
        });
    }

    /**
     * Task 7.4: Show success UI with green checkmark
     */
    function showSuccessUI(medication, dosage, response) {
        hideAllUI();
        currentUIState = UI_STATES.SUCCESS;

        if (script.prescriptionCard) {
            script.prescriptionCard.enabled = true;
        }

        if (script.prescriptionText) {
            // Green checkmark and success message
            script.prescriptionText.text = [
                "✓ Prescription Created",
                "",
                medication + " " + dosage,
                "",
                "PENDING PHYSICIAN APPROVAL",
                "",
                "ID: " + (response.prescription_id || "RX-001")
            ].join("\n");

            // Set green color
            const material = script.prescriptionText.getMaterial(0);
            if (material) {
                material.mainColor = new vec4(
                    config.AR_COLORS.SUCCESS.r,
                    config.AR_COLORS.SUCCESS.g,
                    config.AR_COLORS.SUCCESS.b,
                    config.AR_COLORS.SUCCESS.a
                );
            }

            script.prescriptionText.enabled = true;
        }

        // Position at center
        if (script.screenTransform) {
            script.screenTransform.anchors.setCenter(0.5, 0.5);
        }

        // Auto-hide after 5 seconds
        startAutoHideTimer(config.TIMEOUTS.PRESCRIPTION_UI_AUTO_HIDE);
    }

    /**
     * Task 7.5: Show warning UI with drug interaction alert
     * CRITICAL: Full-screen red border overlay for Warfarin demo
     */
    function showWarningUI(response) {
        hideAllUI();
        currentUIState = UI_STATES.WARNING;
        warningAcknowledged = false;

        if (script.prescriptionCard) {
            script.prescriptionCard.enabled = true;
        }

        if (script.warningText) {
            // Build warning message with red X icon
            let warningMessage = [
                "✗ PRESCRIPTION BLOCKED",
                "",
                config.ERROR_MESSAGES.DRUG_INTERACTION,
                ""
            ];

            // Add specific warnings
            if (response.warnings && response.warnings.length > 0) {
                response.warnings.forEach(warning => {
                    warningMessage.push("⚠ " + warning.message);
                });
            }

            // Add alternatives if available
            if (response.alternatives && response.alternatives.length > 0) {
                warningMessage.push("");
                warningMessage.push("Safe alternatives:");
                response.alternatives.forEach(alt => {
                    warningMessage.push("• " + alt);
                });
            }

            warningMessage.push("");
            warningMessage.push("Say 'acknowledged' to continue");

            script.warningText.text = warningMessage.join("\n");

            // Set red color for warning
            const material = script.warningText.getMaterial(0);
            if (material) {
                material.mainColor = new vec4(
                    config.AR_COLORS.WARNING.r,
                    config.AR_COLORS.WARNING.g,
                    config.AR_COLORS.WARNING.b,
                    config.AR_COLORS.WARNING.a
                );
            }

            script.warningText.enabled = true;
        }

        // Full-screen positioning for critical warning
        if (script.screenTransform) {
            script.screenTransform.anchors.setCenter(0.5, 0.5);
        }

        // Do NOT auto-hide - requires acknowledgment
        clearAutoHideTimer();
    }

    /**
     * Task 7.6: Show available medications list
     */
    function showAvailableMedications() {
        hideAllUI();
        currentUIState = UI_STATES.MEDICATION_LIST;

        if (script.prescriptionCard) {
            script.prescriptionCard.enabled = true;
        }

        if (script.medicationListText || script.prescriptionText) {
            const textComponent = script.medicationListText || script.prescriptionText;

            let medicationList = ["Available Medications:",""];

            const medications = config.MEDICATIONS || [];
            medications.forEach(med => {
                medicationList.push("• " + med.name + " (" + med.type + ")");
                if (med.dosages && med.dosages.length > 0) {
                    medicationList.push("  Dosages: " + med.dosages.join(", "));
                }
            });

            textComponent.text = medicationList.join("\n");
            textComponent.enabled = true;

            // Standard white color for list
            const material = textComponent.getMaterial(0);
            if (material) {
                material.mainColor = new vec4(1, 1, 1, 1);
            }
        }

        // Position at center
        if (script.screenTransform) {
            script.screenTransform.anchors.setCenter(0.5, 0.5);
        }

        // Auto-hide after 10 seconds for list view
        startAutoHideTimer(10000);
    }

    /**
     * Acknowledge warning to dismiss
     */
    function acknowledgeWarning() {
        if (currentUIState === UI_STATES.WARNING) {
            warningAcknowledged = true;
            hideAllUI();
        }
    }

    /**
     * Get warning border style for full-screen overlay
     */
    function getWarningBorderStyle() {
        return "border: 5px solid red; background-color: rgba(255, 0, 0, 0.1); padding: 20px;";
    }

    /**
     * Hide all UI elements
     */
    function hideAllUI() {
        if (script.prescriptionCard) {
            script.prescriptionCard.enabled = false;
        }
        if (script.prescriptionText) {
            script.prescriptionText.enabled = false;
        }
        if (script.warningText) {
            script.warningText.enabled = false;
        }
        if (script.medicationListText) {
            script.medicationListText.enabled = false;
        }
        currentUIState = UI_STATES.HIDDEN;
        clearAutoHideTimer();
    }

    /**
     * Show error message
     */
    function showError(errorMessage) {
        hideAllUI();
        currentUIState = UI_STATES.ERROR;

        if (script.prescriptionCard) {
            script.prescriptionCard.enabled = true;
        }

        if (script.prescriptionText) {
            script.prescriptionText.text = "Error: " + errorMessage;

            // Red color for errors
            const material = script.prescriptionText.getMaterial(0);
            if (material) {
                material.mainColor = new vec4(1, 0, 0, 1);
            }

            script.prescriptionText.enabled = true;
        }

        // Auto-hide after 5 seconds
        startAutoHideTimer(5000);
    }

    /**
     * Start auto-hide timer
     */
    function startAutoHideTimer(duration) {
        clearAutoHideTimer();
        autoHideTimer = script.createEvent("DelayedCallbackEvent");
        autoHideTimer.bind(function() {
            hideAllUI();
        });
        autoHideTimer.reset(duration / 1000); // Convert to seconds
    }

    /**
     * Clear auto-hide timer
     */
    function clearAutoHideTimer() {
        if (autoHideTimer) {
            script.removeEvent(autoHideTimer);
            autoHideTimer = null;
        }
    }

    /**
     * Play audio response
     */
    function playAudio(audioUrl) {
        if (script.audioComponent) {
            // In real implementation, would load audio from URL
            // For now, just trigger play
            script.audioComponent.play();
        }
    }

    /**
     * Reset module state
     */
    function reset() {
        hideAllUI();
        currentUIState = UI_STATES.HIDDEN;
        warningAcknowledged = false;
        clearAutoHideTimer();
    }

    /**
     * Handle voice command
     */
    function handleVoiceCommand(command) {
        const lowerCommand = command.toLowerCase();

        if (lowerCommand.includes('prescribe')) {
            return createPrescription(command);
        }

        if (lowerCommand.includes('show available medications')) {
            showAvailableMedications();
            return Promise.resolve({ success: true });
        }

        if (lowerCommand.includes('acknowledged') || lowerCommand.includes('okay') || lowerCommand.includes('understood')) {
            acknowledgeWarning();
            return Promise.resolve({ success: true });
        }

        return Promise.resolve({ success: false });
    }

    // Initialize on script start
    const initEvent = script.createEvent("OnStartEvent");
    initEvent.bind(function() {
        initialize();
        print("PrescriptionUI initialized - Ready for Warfarin demo");
    });

    // Public API
    return {
        initialize: initialize,
        parsePrescriptionCommand: parsePrescriptionCommand,
        normalizeDosage: normalizeDosage,
        createPrescription: createPrescription,
        showAvailableMedications: showAvailableMedications,
        acknowledgeWarning: acknowledgeWarning,
        handleVoiceCommand: handleVoiceCommand,
        getWarningBorderStyle: getWarningBorderStyle,
        reset: reset,
        hideUI: hideAllUI
    };
})();

// Export for use by other scripts
global.PrescriptionUI = PrescriptionUI;

print("PrescriptionUI loaded - Critical for Warfarin + Ibuprofen demo");