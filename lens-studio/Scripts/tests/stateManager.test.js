/**
 * Tests for State Manager
 * Dev 2 - Task Group 3: Application State Manager
 *
 * Following TDD: Tests written FIRST
 */

describe('StateManager', () => {
    let StateManager;

    beforeEach(() => {
        // Reset global state
        jest.resetModules();

        // Mock Date.now for consistent testing
        const mockTime = 1000000;
        jest.spyOn(Date, 'now').mockReturnValue(mockTime);

        // Load StateManager
        require('../stateManager.js');
        StateManager = global.StateManager;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('setState and getState operations', () => {
        it('should set and get individual state values', () => {
            // Act
            StateManager.setState('currentMode', 'CLINICAL');

            // Assert
            expect(StateManager.getState('currentMode')).toBe('CLINICAL');
        });

        it('should set multiple state values at once', () => {
            // Act
            StateManager.setState({
                currentMode: 'CLINICAL',
                patient: { name: 'Sarah Chen', age: 34 }
            });

            // Assert
            expect(StateManager.getState('currentMode')).toBe('CLINICAL');
            expect(StateManager.getState('patient')).toEqual({
                name: 'Sarah Chen',
                age: 34
            });
        });

        it('should return copy of entire state when no key provided', () => {
            // Arrange
            StateManager.setState('currentMode', 'CLINICAL');

            // Act
            const state = StateManager.getState();

            // Assert
            expect(state.currentMode).toBe('CLINICAL');
            // Ensure it's a copy, not reference
            state.currentMode = 'MODIFIED';
            expect(StateManager.getState('currentMode')).toBe('CLINICAL');
        });

        it('should update lastInteraction timestamp on any state change', () => {
            // Arrange
            const initialTime = Date.now();

            // Act
            Date.now.mockReturnValue(initialTime + 5000);
            StateManager.setState('test', 'value');

            // Assert
            expect(StateManager.getState('lastInteraction')).toBe(initialTime + 5000);
        });
    });

    describe('patient data storage and retrieval', () => {
        it('should store patient data correctly', () => {
            // Arrange
            const patientData = {
                id: '123',
                name: 'Sarah Chen',
                age: 34,
                sex: 'Female',
                allergies: ['Penicillin'],
                medications: [
                    { name: 'Warfarin', dosage: '5mg daily' }
                ]
            };

            // Act
            StateManager.setPatient(patientData);

            // Assert
            expect(StateManager.getState('patient')).toEqual(patientData);
        });

        it('should handle null patient data', () => {
            // Act
            StateManager.setPatient(null);

            // Assert
            expect(StateManager.getState('patient')).toBeNull();
        });
    });

    describe('symptom list management', () => {
        it('should add symptoms to the list with timestamps', () => {
            // Arrange
            const mockTime = 1000000;
            Date.now.mockReturnValue(mockTime);

            // Act
            StateManager.addSymptom('chest tightness');
            StateManager.addSymptom('coughing');

            // Assert
            const symptoms = StateManager.getState('symptoms');
            expect(symptoms).toHaveLength(2);
            expect(symptoms[0]).toEqual({
                description: 'chest tightness',
                timestamp: mockTime
            });
            expect(symptoms[1]).toEqual({
                description: 'coughing',
                timestamp: mockTime
            });
        });

        it('should initialize symptoms array if not exists', () => {
            // Arrange
            StateManager.clearState();

            // Act
            StateManager.addSymptom('headache');

            // Assert
            const symptoms = StateManager.getState('symptoms');
            expect(symptoms).toHaveLength(1);
            expect(symptoms[0].description).toBe('headache');
        });
    });

    describe('prescription history management', () => {
        it('should add prescriptions with timestamps', () => {
            // Arrange
            const mockTime = 1000000;
            Date.now.mockReturnValue(mockTime);

            const prescription = {
                medication: 'Acetaminophen',
                dosage: '500mg',
                status: 'pending_physician_approval'
            };

            // Act
            StateManager.addPrescription(prescription);

            // Assert
            const prescriptions = StateManager.getState('prescriptions');
            expect(prescriptions).toHaveLength(1);
            expect(prescriptions[0]).toEqual({
                ...prescription,
                timestamp: mockTime
            });
        });

        it('should maintain prescription order', () => {
            // Act
            StateManager.addPrescription({ medication: 'Med1' });
            StateManager.addPrescription({ medication: 'Med2' });
            StateManager.addPrescription({ medication: 'Med3' });

            // Assert
            const prescriptions = StateManager.getState('prescriptions');
            expect(prescriptions).toHaveLength(3);
            expect(prescriptions[0].medication).toBe('Med1');
            expect(prescriptions[2].medication).toBe('Med3');
        });
    });

    describe('state persistence during mode switches', () => {
        it('should preserve session data when switching modes', () => {
            // Arrange
            StateManager.setState('currentMode', 'CLINICAL');
            StateManager.setPatient({ name: 'Sarah Chen' });
            StateManager.addSymptom('test symptom');

            // Act
            StateManager.setState('currentMode', 'IDLE');

            // Assert - data should still be there
            expect(StateManager.getState('patient').name).toBe('Sarah Chen');
            expect(StateManager.getState('symptoms')).toHaveLength(1);
        });

        it('should clear all data when clearState is called', () => {
            // Arrange
            StateManager.setState('currentMode', 'CLINICAL');
            StateManager.setPatient({ name: 'Sarah Chen' });
            StateManager.addSymptom('test symptom');
            StateManager.addPrescription({ medication: 'Test' });

            // Act
            StateManager.clearState();

            // Assert
            const state = StateManager.getState();
            expect(state.currentMode).toBe('IDLE');
            expect(state.patient).toBeNull();
            expect(state.symptoms).toEqual([]);
            expect(state.prescriptions).toEqual([]);
        });
    });

    describe('inactivity tracking', () => {
        it('should calculate inactivity time in seconds', () => {
            // Arrange
            const initialTime = 1000000;
            Date.now.mockReturnValue(initialTime);
            StateManager.resetInactivity();

            // Act - simulate 15 seconds passing
            Date.now.mockReturnValue(initialTime + 15000);
            const inactivityTime = StateManager.getInactivityTime();

            // Assert
            expect(inactivityTime).toBe(15);
        });

        it('should reset inactivity timer', () => {
            // Arrange
            const initialTime = 1000000;
            Date.now.mockReturnValue(initialTime);
            StateManager.resetInactivity();

            // Move time forward
            Date.now.mockReturnValue(initialTime + 10000);

            // Act - reset timer
            StateManager.resetInactivity();

            // Assert
            Date.now.mockReturnValue(initialTime + 12000);
            const inactivityTime = StateManager.getInactivityTime();
            expect(inactivityTime).toBe(2); // Only 2 seconds since reset
        });

        it('should update lastInteraction on any state modification', () => {
            // Arrange
            const initialTime = 1000000;
            Date.now.mockReturnValue(initialTime);
            StateManager.resetInactivity();

            // Act - various state modifications
            Date.now.mockReturnValue(initialTime + 5000);
            StateManager.addSymptom('test');

            const time1 = StateManager.getInactivityTime();
            expect(time1).toBe(0); // Just updated

            Date.now.mockReturnValue(initialTime + 10000);
            StateManager.addPrescription({ medication: 'test' });

            const time2 = StateManager.getInactivityTime();
            expect(time2).toBe(0); // Just updated again
        });
    });

    describe('state integrity', () => {
        it('should maintain state structure after multiple operations', () => {
            // Arrange & Act
            StateManager.setState('currentMode', 'CLINICAL');
            StateManager.setPatient({ name: 'Test Patient' });
            StateManager.addSymptom('symptom1');
            StateManager.addSymptom('symptom2');
            StateManager.addPrescription({ medication: 'Med1' });
            StateManager.setState('sessionData', { test: 'value' });

            // Assert
            const state = StateManager.getState();
            expect(state).toHaveProperty('currentMode');
            expect(state).toHaveProperty('patient');
            expect(state).toHaveProperty('symptoms');
            expect(state).toHaveProperty('prescriptions');
            expect(state).toHaveProperty('sessionData');
            expect(state).toHaveProperty('lastInteraction');
        });

        it('should handle edge cases gracefully', () => {
            // Test undefined values
            StateManager.setState('test', undefined);
            expect(StateManager.getState('test')).toBeUndefined();

            // Test empty strings
            StateManager.addSymptom('');
            const symptoms = StateManager.getState('symptoms');
            expect(symptoms[symptoms.length - 1].description).toBe('');

            // Test complex objects
            const complexData = {
                nested: {
                    deep: {
                        value: 'test'
                    }
                }
            };
            StateManager.setState('complex', complexData);
            expect(StateManager.getState('complex')).toEqual(complexData);
        });
    });
});