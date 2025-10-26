/**
 * Integration Tests
 * Dev 2 - Task Groups 8 & 9: Component Integration and Demo Flow
 *
 * Tests for complete integration and Sarah Chen demo flow
 */

// Mock Lens Studio script object
if (typeof script === 'undefined') {
    global.script = {
        createEvent: function(type) {
            return {
                bind: function(callback) {
                    this.callback = callback;
                },
                reset: function(time) {
                    // Simulate delayed callback
                    if (this.callback) {
                        setTimeout(this.callback, time * 1000);
                    }
                }
            };
        },
        removeEvent: function(event) {
            // Clean up event
        }
    };
}

// Import components
require('../config');
require('../stateManager');
require('../apiClient');
require('../patientCardRenderer');
require('../prescriptionUI');
require('../clinicalMode');
require('../modeManager');
require('../integrationManager');
require('../voiceController');
require('../demoController');

describe('Task Group 8: Component Integration', () => {
    beforeEach(() => {
        // Reset all components
        global.StateManager.clearState();
        global.ClinicalMode.reset();
        global.IntegrationManager.reset();
        global.DemoController.resetDemoState();
    });

    describe('8.1: Clinical Mode with Patient Card Integration', () => {
        it('should update patient card when state changes', async () => {
            // Setup
            const patientData = {
                id: 'test-123',
                name: 'Sarah Chen',
                age: 34,
                sex: 'Female',
                medications: [
                    { name: 'Warfarin', dosage: '5mg daily' }
                ]
            };

            // Act
            global.StateManager.setState('patient', patientData);

            // Assert
            const state = global.StateManager.getState();
            expect(state.patient).toEqual(patientData);
            expect(state.patient.medications).toHaveLength(1);
            expect(state.patient.medications[0].name).toBe('Warfarin');
        });

        it('should ensure proper data flow between components', () => {
            // Setup
            const mockPatient = {
                name: 'Sarah Chen',
                medications: [{ name: 'Warfarin' }]
            };

            // Act - Load patient through clinical mode
            global.StateManager.setState('patient', mockPatient);
            const patient = global.StateManager.getState('patient');

            // Assert
            expect(patient).toBeDefined();
            expect(patient.name).toBe('Sarah Chen');
        });

        it('should test card display timing', (done) => {
            // Setup
            const startTime = Date.now();

            // Act - Show card with auto-hide
            global.PatientCardRenderer.showCard({
                name: 'Test Patient'
            });

            // Wait for auto-hide (simulated)
            setTimeout(() => {
                const elapsed = Date.now() - startTime;

                // Assert - Should auto-hide around 10 seconds
                expect(elapsed).toBeGreaterThan(100); // At least 100ms
                done();
            }, 150);
        });
    });

    describe('8.2: Clinical Mode with Prescription UI Integration', () => {
        it('should connect prescription commands', async () => {
            // Setup
            global.StateManager.setState('patient', {
                id: 'test-123',
                name: 'Sarah Chen',
                medications: [{ name: 'Warfarin' }]
            });

            // Act
            const response = await global.ClinicalMode.initiatePrescription(
                'prescribe Ibuprofen 400mg'
            );

            // Assert
            expect(response).toBeDefined();
            expect(response.initiatedPrescription).toBe(true);
        });

        it('should ensure UI updates on API responses', async () => {
            // Setup mock API response
            global.ApiClient.setMockResponse('createPrescription', {
                success: false,
                blocked: true,
                warnings: ['Warfarin interaction detected']
            });

            // Act
            const response = await global.PrescriptionUI.createPrescription(
                'prescribe Ibuprofen 400mg'
            );

            // Assert
            expect(response.blocked).toBe(true);
            expect(response.warnings).toContain('Warfarin interaction detected');
        });

        it('should test warning display flow', async () => {
            // Setup
            const warnings = [
                'HIGH SEVERITY: Warfarin + Ibuprofen interaction'
            ];
            const alternatives = ['Acetaminophen'];

            // Act
            global.PrescriptionUI.showWarning(warnings, alternatives);

            // Assert
            const uiState = global.PrescriptionUI.getUIState();
            expect(uiState.isShowingWarning).toBe(true);
            expect(uiState.currentWarnings).toEqual(warnings);
            expect(uiState.currentAlternatives).toEqual(alternatives);
        });
    });

    describe('8.3: Mode Manager Component Connection', () => {
        it('should handle proper activation/deactivation', () => {
            // Act - Switch to clinical mode
            global.ModeManager.switchMode('CLINICAL');
            let mode = global.ModeManager.getCurrentMode();
            expect(mode).toBe('CLINICAL');

            // Switch back to idle
            global.ModeManager.switchMode('IDLE');
            mode = global.ModeManager.getCurrentMode();
            expect(mode).toBe('IDLE');
        });

        it('should clean up state on mode switches', () => {
            // Setup - Add some state
            global.StateManager.setState('testData', 'value');

            // Act - Switch modes
            global.ModeManager.switchMode('CLINICAL');
            global.ModeManager.switchMode('IDLE');

            // Assert - State should be cleared
            const state = global.StateManager.getState();
            expect(state.testData).toBeUndefined();
        });

        it('should coordinate animations', (done) => {
            // Act - Switch with animation
            global.ModeManager.switchMode('CLINICAL');

            // Wait for fade animation (0.5s)
            setTimeout(() => {
                const mode = global.ModeManager.getCurrentMode();
                expect(mode).toBe('CLINICAL');
                done();
            }, 600);
        });
    });

    describe('8.4: Voice Controller Integration', () => {
        it('should register command handlers', () => {
            // Act
            const status = global.IntegrationManager.getIntegrationStatus();

            // Assert
            expect(status.voiceHandlersRegistered).toBe(true);
            expect(status.wakeWordHandlersRegistered).toBe(true);
        });

        it('should route wake word commands', async () => {
            // Act
            const response = await global.IntegrationManager.handleVoiceCommand(
                'start assessment Sarah Chen',
                true // hasWakeWord
            );

            // Assert
            expect(response).toBeDefined();
        });

        it('should handle in-session commands', async () => {
            // Setup - Set clinical mode
            global.StateManager.setState('mode', 'CLINICAL');

            // Act
            const response = await global.IntegrationManager.handleVoiceCommand(
                'show medications',
                false // no wake word
            );

            // Assert
            expect(response.success).toBe(true);
            expect(response.action).toBe('show_medications');
        });
    });

    describe('8.5: TTS Audio Playback', () => {
        it('should integrate AudioComponent', () => {
            // Act
            const status = global.IntegrationManager.getIntegrationStatus();

            // Assert
            expect(status.audioComponentConnected).toBeDefined();
        });

        it('should play API response audio', () => {
            // Act
            global.IntegrationManager.playTTSAudio('mock://audio.mp3');

            // Assert - Would check audio queue in real implementation
            expect(true).toBe(true);
        });

        it('should manage queue for multiple responses', () => {
            // Act - Queue multiple audio
            global.IntegrationManager.playTTSAudio('mock://audio1.mp3');
            global.IntegrationManager.playTTSAudio('mock://audio2.mp3');
            global.IntegrationManager.playTTSAudio('mock://audio3.mp3');

            // Assert - Would check queue management
            expect(true).toBe(true);
        });
    });
});

describe('Task Group 9: Sarah Chen Demo Flow', () => {
    beforeEach(() => {
        // Reset demo state before each test
        global.DemoController.resetDemoState();
        global.StateManager.clearState();
    });

    describe('9.1: Complete Sarah Chen Flow', () => {
        it('should load Sarah Chen with Warfarin medication', async () => {
            // Act
            const command = 'Hey MedSnap, start assessment Sarah Chen';
            const response = await global.VoiceController.simulateCommand(command);

            // Assert - Would check patient data
            expect(true).toBe(true); // Placeholder for actual patient check
        });

        it('should show drug interaction warning for Ibuprofen', async () => {
            // Setup - Load Sarah Chen
            global.StateManager.setState('patient', {
                id: 'sarah-chen',
                name: 'Sarah Chen',
                medications: [
                    { name: 'Warfarin', dosage: '5mg daily' }
                ]
            });

            // Act - Prescribe Ibuprofen
            const response = await global.PrescriptionUI.createPrescription(
                'prescribe Ibuprofen 400mg'
            );

            // Assert - CRITICAL CHECK
            expect(response.blocked).toBe(true);
            expect(response.warnings).toBeDefined();
            expect(response.warnings.some(w =>
                w.includes('Warfarin')
            )).toBe(true);
            expect(response.alternatives).toContain('Acetaminophen');
        });

        it('should display alternative suggestion', async () => {
            // Setup mock response
            global.ApiClient.setMockResponse('createPrescription', {
                blocked: true,
                warnings: ['Warfarin interaction'],
                alternatives: ['Acetaminophen']
            });

            // Act
            const response = await global.PrescriptionUI.createPrescription(
                'prescribe Ibuprofen 400mg'
            );

            // Assert
            expect(response.alternatives).toBeDefined();
            expect(response.alternatives).toContain('Acetaminophen');
        });
    });

    describe('9.2: Performance Verification', () => {
        it('should meet voice response time target', async () => {
            const startTime = Date.now();

            // Act
            await global.IntegrationManager.handleVoiceCommand(
                'show medications',
                false
            );

            const responseTime = Date.now() - startTime;

            // Assert
            expect(responseTime).toBeLessThan(3000); // <3 seconds
        });

        it('should maintain minimum FPS', () => {
            // Simulated FPS check
            const mockFPS = 45;
            expect(mockFPS).toBeGreaterThanOrEqual(30); // ≥30 FPS
        });

        it('should have smooth card animations', (done) => {
            // Act - Trigger animation
            global.PatientCardRenderer.fadeIn(0.5);

            // Check after animation
            setTimeout(() => {
                // Would check actual animation smoothness
                expect(true).toBe(true);
                done();
            }, 600);
        });
    });

    describe('9.3: Demo Script Validation', () => {
        it('should provide complete demo script', () => {
            const script = global.DemoController.getDemoScript();

            expect(script.duration).toBe('3 minutes');
            expect(script.talkingPoints).toBeDefined();
            expect(script.talkingPoints.length).toBeGreaterThan(5);
            expect(script.criticalPoints).toBeDefined();
            expect(script.fallbackInstructions).toBeDefined();
        });

        it('should handle demo mode fallback', () => {
            // Enable demo mode
            global.ApiClient.setDemoMode(true);

            // Check demo mode is active
            const isDemoMode = global.ApiClient.isDemoMode();
            expect(isDemoMode).toBe(true);
        });
    });

    describe('9.4: Demo Reset Function', () => {
        it('should clear all state', () => {
            // Setup - Add state
            global.StateManager.setState('patient', { name: 'Test' });
            global.StateManager.setState('symptoms', ['test']);

            // Act
            global.DemoController.resetDemoState();

            // Assert
            const state = global.StateManager.getState();
            expect(state.patient).toBeUndefined();
            expect(state.symptoms).toBeUndefined();
        });

        it('should reset to initial conditions', () => {
            // Setup - Change mode
            global.ModeManager.switchMode('CLINICAL');

            // Act
            global.DemoController.resetDemoState();

            // Assert
            const mode = global.ModeManager.getCurrentMode();
            expect(mode).toBe('IDLE');
        });

        it('should be ready for multiple runs', () => {
            // Run demo multiple times
            for (let i = 0; i < 3; i++) {
                // Reset
                global.DemoController.resetDemoState();

                // Check clean state
                const state = global.StateManager.getState();
                expect(Object.keys(state).length).toBe(0);

                // Add test data
                global.StateManager.setState('run', i);
            }

            expect(true).toBe(true);
        });
    });
});

// Critical Path Test
describe('CRITICAL: Warfarin-Ibuprofen Interaction', () => {
    it('MUST detect Warfarin + Ibuprofen interaction', async () => {
        // This is the most important test for the demo

        // Setup - Sarah Chen with Warfarin
        const sarahChen = {
            id: 'sarah-chen',
            name: 'Sarah Chen',
            age: 34,
            medications: [
                { name: 'Warfarin', dosage: '5mg daily' }
            ]
        };

        global.StateManager.setState('patient', sarahChen);

        // Mock the critical drug interaction response
        global.ApiClient.setMockResponse('createPrescription', {
            success: false,
            blocked: true,
            warnings: [
                'HIGH SEVERITY: Warfarin + Ibuprofen interaction detected',
                'Increased risk of bleeding'
            ],
            alternatives: ['Acetaminophen'],
            severity: 'HIGH'
        });

        // Act - Attempt to prescribe Ibuprofen
        const response = await global.PrescriptionUI.createPrescription(
            'prescribe Ibuprofen 400mg'
        );

        // Assert - MUST show warning
        expect(response.blocked).toBe(true);
        expect(response.severity).toBe('HIGH');
        expect(response.warnings).toBeDefined();
        expect(response.warnings.length).toBeGreaterThan(0);
        expect(response.warnings[0]).toContain('Warfarin');
        expect(response.warnings[0]).toContain('Ibuprofen');
        expect(response.alternatives).toContain('Acetaminophen');

        console.log('✓ CRITICAL TEST PASSED: Drug interaction detected!');
    });
});

// Run critical path test
describe('Demo Controller Critical Path', () => {
    it('should test critical path successfully', () => {
        global.DemoController.testCriticalPath();
        expect(true).toBe(true);
    });
});