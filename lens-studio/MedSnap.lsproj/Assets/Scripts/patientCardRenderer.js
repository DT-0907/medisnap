/**
 * Patient Card Renderer - Task Group 5
 * Dev 2 - AR Patient Card Display Component
 *
 * Minimal implementation to support Clinical Mode
 * Following KISS principle
 */

// @input Component.Text patientNameText
// @input Component.Text patientDetailsText
// @input Component.Text allergiesText
// @input Component.Text medicationsText
// @input Component.Text symptomsText
// @input Component.Text vitalsText
// @input SceneObject cardRootObject

const PatientCardRenderer = (function() {
    let isVisible = false;
    let autoHideTimer = null;
    let currentPatientData = null;
    let currentFilter = 'all';

    /**
     * Show patient card with data
     */
    function showCard(patientData) {
        if (!patientData) return false;

        currentPatientData = patientData;
        isVisible = true;

        // Enable card
        if (script.cardRootObject) {
            script.cardRootObject.enabled = true;
        }

        // Update text components
        updateCardContent(patientData);

        // Start auto-hide timer (10 seconds)
        startAutoHideTimer();

        return true;
    }

    /**
     * Hide the patient card
     */
    function hideCard() {
        isVisible = false;

        if (script.cardRootObject) {
            script.cardRootObject.enabled = false;
        }

        cancelAutoHideTimer();
    }

    /**
     * Update card content with patient data
     */
    function updateCard(patientData) {
        if (!isVisible) {
            return showCard(patientData);
        }

        currentPatientData = patientData;
        updateCardContent(patientData);

        // Reset auto-hide timer on update
        startAutoHideTimer();

        return true;
    }

    /**
     * Internal function to update text components
     */
    function updateCardContent(patientData) {
        if (script.patientNameText) {
            script.patientNameText.text = patientData.name || '';
        }

        if (script.patientDetailsText) {
            script.patientDetailsText.text = `Age ${patientData.age}, ${patientData.sex}`;
        }

        if (script.allergiesText && patientData.allergies) {
            script.allergiesText.text = `Allergies: ${patientData.allergies.join(', ')}`;
            // Set red color for allergies (if supported)
            if (script.allergiesText.textFill) {
                script.allergiesText.textFill.color = new vec4(1, 0, 0, 1); // Red
            }
        }

        if (script.medicationsText && patientData.medications) {
            let medText = "Medications:\n";
            patientData.medications.forEach(med => {
                medText += `  ${med.name} ${med.dosage}\n`;
            });
            script.medicationsText.text = medText;
        }

        if (script.symptomsText && patientData.current_symptoms) {
            script.symptomsText.text = `Symptoms: ${patientData.current_symptoms.join(', ')}`;
        }

        if (script.vitalsText && patientData.vital_signs) {
            const vitals = patientData.vital_signs;
            script.vitalsText.text = `Vitals: BP ${vitals.bp}, HR ${vitals.hr}, O2 ${vitals.o2}%, Temp ${vitals.temp}°F`;
        }
    }

    /**
     * Filter card to show only specific information
     */
    function filterToMedications() {
        currentFilter = 'medications';
        hideAllExcept(['medicationsText', 'patientNameText']);
    }

    function filterToAllergies() {
        currentFilter = 'allergies';
        hideAllExcept(['allergiesText', 'patientNameText']);

        // Enlarge allergy text for emphasis
        if (script.allergiesText) {
            script.allergiesText.size = 28;
        }
    }

    function filterToHistory() {
        currentFilter = 'history';
        // Show diagnosis history if available
        if (currentPatientData && currentPatientData.diagnosis_history) {
            // Update a text component with history
            hideAllExcept(['patientNameText']);
        }
    }

    function resetFilter() {
        currentFilter = 'all';
        showAll();

        // Reset text sizes
        if (script.allergiesText) {
            script.allergiesText.size = 18;
        }
    }

    /**
     * Hide all text components except specified
     */
    function hideAllExcept(keepVisible) {
        const allComponents = [
            'patientNameText', 'patientDetailsText', 'allergiesText',
            'medicationsText', 'symptomsText', 'vitalsText'
        ];

        allComponents.forEach(compName => {
            if (script[compName] && script[compName].getSceneObject) {
                const shouldShow = keepVisible.includes(compName);
                script[compName].getSceneObject().enabled = shouldShow;
            }
        });
    }

    /**
     * Show all text components
     */
    function showAll() {
        const allComponents = [
            'patientNameText', 'patientDetailsText', 'allergiesText',
            'medicationsText', 'symptomsText', 'vitalsText'
        ];

        allComponents.forEach(compName => {
            if (script[compName] && script[compName].getSceneObject) {
                script[compName].getSceneObject().enabled = true;
            }
        });
    }

    /**
     * Auto-hide timer management
     */
    function startAutoHideTimer() {
        cancelAutoHideTimer();

        autoHideTimer = script.createEvent("DelayedCallbackEvent");
        autoHideTimer.bind(function() {
            hideCard();
        });
        autoHideTimer.reset(10); // 10 seconds
    }

    function cancelAutoHideTimer() {
        if (autoHideTimer) {
            autoHideTimer.cancel();
            autoHideTimer = null;
        }
    }

    // Public API
    return {
        showCard: showCard,
        hideCard: hideCard,
        updateCard: updateCard,
        filterToMedications: filterToMedications,
        filterToAllergies: filterToAllergies,
        filterToHistory: filterToHistory,
        resetFilter: resetFilter,
        isVisible: function() { return isVisible; },
        getCurrentData: function() { return currentPatientData; }
    };
})();

// Export for use by other scripts
global.PatientCardRenderer = PatientCardRenderer;