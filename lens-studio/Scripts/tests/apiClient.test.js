/**
 * Tests for API Client
 * Dev 2 - Task Group 2: Backend Integration Client
 *
 * Following TDD: Tests written FIRST before implementation
 */

describe('ApiClient', () => {
    let ApiClient;
    let mockRemoteServiceModule;
    let mockConfig;

    beforeEach(() => {
        // Reset global state
        global.MedSnapConfig = {
            API_BASE_URL: 'http://localhost:3000',
            DEMO_MODE: false
        };

        // Mock RemoteServiceModule
        mockRemoteServiceModule = {
            createHttpRequest: jest.fn(() => ({
                url: '',
                method: '',
                headers: {},
                body: ''
            })),
            performHttpRequest: jest.fn(),
            HttpRequestMethod: {
                Post: 'POST'
            }
        };

        global.RemoteServiceModule = mockRemoteServiceModule;

        // Clear module cache and reload
        jest.resetModules();

        // Simulate script object for Lens Studio
        global.script = {
            remoteServiceModule: mockRemoteServiceModule
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('loadPatient', () => {
        it('should make POST request to /api/clinical/patient/load', (done) => {
            // Arrange
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            const patientName = 'Sarah Chen';
            const mockResponse = {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    patient: {
                        name: 'Sarah Chen',
                        age: 34
                    }
                })
            };

            mockRemoteServiceModule.performHttpRequest.mockImplementation((request, callback) => {
                // Assert request structure
                expect(request.url).toBe('http://localhost:3000/api/clinical/patient/load');
                expect(request.method).toBe('POST');
                expect(JSON.parse(request.body)).toEqual({
                    patient_name: patientName
                });

                callback(mockResponse);
            });

            // Act
            ApiClient.loadPatient(patientName).then(result => {
                // Assert
                expect(result.success).toBe(true);
                expect(result.patient.name).toBe('Sarah Chen');
                done();
            });
        });

        it('should return mock data in DEMO_MODE', async () => {
            // Arrange
            global.MedSnapConfig.DEMO_MODE = true;
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            // Act
            const result = await ApiClient.loadPatient('Sarah Chen');

            // Assert
            expect(result.success).toBe(true);
            expect(result.patient.name).toBe('Sarah Chen');
            expect(result.patient.medications).toContainEqual(
                expect.objectContaining({ name: 'Warfarin' })
            );
            expect(mockRemoteServiceModule.performHttpRequest).not.toHaveBeenCalled();
        });
    });

    describe('recordSymptom', () => {
        it('should make POST request to /api/clinical/symptom/record', (done) => {
            // Arrange
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            const symptomData = {
                patient_id: '123',
                symptom: 'chest tightness'
            };

            const mockResponse = {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Symptom recorded'
                })
            };

            mockRemoteServiceModule.performHttpRequest.mockImplementation((request, callback) => {
                expect(request.url).toBe('http://localhost:3000/api/clinical/symptom/record');
                callback(mockResponse);
            });

            // Act
            ApiClient.recordSymptom(symptomData).then(result => {
                // Assert
                expect(result.success).toBe(true);
                done();
            });
        });
    });

    describe('createPrescription', () => {
        it('should make POST request to /api/clinical/prescription/create', (done) => {
            // Arrange
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            const prescriptionData = {
                medication: 'Acetaminophen',
                dosage: '500mg'
            };

            const mockResponse = {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    status: 'pending_physician_approval'
                })
            };

            mockRemoteServiceModule.performHttpRequest.mockImplementation((request, callback) => {
                expect(request.url).toBe('http://localhost:3000/api/clinical/prescription/create');
                callback(mockResponse);
            });

            // Act
            ApiClient.createPrescription(prescriptionData).then(result => {
                // Assert
                expect(result.success).toBe(true);
                expect(result.status).toBe('pending_physician_approval');
                done();
            });
        });

        it('should return drug interaction warning for Warfarin + Ibuprofen in DEMO_MODE', async () => {
            // Arrange
            global.MedSnapConfig.DEMO_MODE = true;
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            const prescriptionData = {
                medication: 'Ibuprofen',
                dosage: '400mg'
            };

            // Act
            const result = await ApiClient.createPrescription(prescriptionData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.blocked).toBe(true);
            expect(result.warnings[0].severity).toBe('HIGH');
            expect(result.alternatives).toContain('Acetaminophen');
        });
    });

    describe('error handling', () => {
        it('should handle network failures gracefully', (done) => {
            // Arrange
            require('../apiClient.js');
            ApiClient = global.ApiClient;

            mockRemoteServiceModule.performHttpRequest.mockImplementation((request, callback) => {
                callback({
                    statusCode: 500,
                    body: 'Internal Server Error'
                });
            });

            // Act
            ApiClient.loadPatient('Test Patient').catch(error => {
                // Assert
                expect(error.error).toBe('Request failed');
                expect(error.statusCode).toBe(500);
                done();
            });
        });

        it('should handle timeout after 3 seconds', async () => {
            // Arrange
            jest.useFakeTimers();

            // Mock setTimeout and clearTimeout for the apiClient
            const originalSetTimeout = global.setTimeout;
            const originalClearTimeout = global.clearTimeout;

            let timeoutCallback;
            global.setTimeout = jest.fn((callback, delay) => {
                if (delay === 3000) {
                    timeoutCallback = callback;
                    return 'timeout-id';
                }
                return originalSetTimeout(callback, delay);
            });

            global.clearTimeout = jest.fn();

            require('../apiClient.js');
            ApiClient = global.ApiClient;

            // Mock performHttpRequest to not call callback (simulating network hang)
            mockRemoteServiceModule.performHttpRequest.mockImplementation(() => {
                // Don't call callback - simulate network hang
            });

            // Act
            const promise = ApiClient.loadPatient('Test Patient');

            // Trigger the timeout manually since we mocked setTimeout
            if (timeoutCallback) {
                timeoutCallback();
            }

            // Assert
            try {
                await promise;
                // Should not reach here
                expect(true).toBe(false);
            } catch (error) {
                expect(error.error).toBe('Request timeout');
            }

            // Cleanup
            global.setTimeout = originalSetTimeout;
            global.clearTimeout = originalClearTimeout;
            jest.useRealTimers();
        });
    });

    describe('demo mode fallback', () => {
        beforeEach(() => {
            global.MedSnapConfig.DEMO_MODE = true;
            require('../apiClient.js');
            ApiClient = global.ApiClient;
        });

        it('should provide mock responses for all endpoints in DEMO_MODE', async () => {
            // Test all endpoints work in demo mode
            const patientResult = await ApiClient.loadPatient('Sarah Chen');
            expect(patientResult.success).toBe(true);

            const symptomResult = await ApiClient.recordSymptom({ symptom: 'test' });
            expect(symptomResult.success).toBe(true);

            const decisionResult = await ApiClient.getDecisionSupport({});
            expect(decisionResult.success).toBe(true);

            const prescriptionResult = await ApiClient.createPrescription({ medication: 'Acetaminophen' });
            expect(prescriptionResult.success).toBe(true);

            const voiceResult = await ApiClient.processVoiceCommand('start assessment Sarah Chen');
            expect(voiceResult.success).toBe(true);
            expect(voiceResult.intent).toBe('load_patient');
        });
    });
});