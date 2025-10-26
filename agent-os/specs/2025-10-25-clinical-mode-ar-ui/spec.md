# Specification: Clinical Mode AR UI

## Goal
Enable hands-free patient assessment for healthcare providers through voice-activated AR interface with real-time clinical decision support and prescription safety checking.

## User Stories
- As a healthcare provider, I want to start a patient assessment by voice so that I can maintain sterile technique
- As a clinician, I want to see patient allergies prominently displayed so that I can avoid adverse reactions
- As a doctor, I want to record symptoms hands-free so that I can document during examination
- As a prescriber, I want drug interaction warnings so that I can ensure patient safety
- As a user, I want automatic mode switching so that the interface adapts to my workflow

## Core Requirements
- Voice-activated patient loading with "Hey MedSnap, start assessment [name]"
- AR patient card display at top 1/3 of screen with allergies in red
- Symptom recording with voice confirmation feedback
- AI-powered diagnostic suggestions from recorded symptoms
- Prescription safety checking with drug interaction warnings
- Auto-exit after 120 seconds of inactivity
- Manual card recall via "Show patient history" command
- TTS audio responses for all interactions

## Visual Design
- Patient card positioned at top_center (0.5, 0.9 anchors)
- Semi-transparent background (50% opacity dark)
- Red borders and text for allergy warnings
- Green checkmark for success states
- Red X icon for drug interaction warnings
- 0.5 second fade animations for transitions
- Minimum 18pt font size for readability

## Reusable Components
### Existing Code to Leverage
- Components: config.js constants (AR_COLORS, TIMEOUTS, CLINICAL_STATE)
- Services: Placeholder functions in clinicalMode.js, patientCardRenderer.js, prescriptionUI.js
- Patterns: Voice Playback sample for TTS integration, AI Playground for backend communication

### New Components Required
- HTTP client for backend API calls (apiClient.js)
- State management for session data (stateManager.js)
- Animation utilities for fade effects
- Timer management for auto-hide and inactivity

## Technical Approach
- Use Lens Studio Text Components for AR overlays with ScreenTransform positioning
- Implement state machine pattern for clinical workflow (IDLE → LOADING_PATIENT → PATIENT_LOADED)
- Backend integration via RemoteServiceModule for API calls to Express server
- AudioComponent for TTS playback with Fish Audio responses
- Event-driven architecture for voice command processing
- Timer-based auto-hide for patient cards (10s) and prescription UI (5s)

## Out of Scope
- Vital sign OCR (skip on failure per FR-17a)
- Multi-patient simultaneous sessions
- Advanced data visualizations or charts
- EHR system integration
- HIPAA compliance features
- Offline mode functionality
- Custom medication database beyond 7-10 drugs

## Success Criteria
- Voice command response time under 3 seconds
- AR rendering maintains 30+ FPS
- Patient card auto-hides after 10 seconds
- Drug interactions block unsafe prescriptions
- Sarah Chen demo shows Warfarin-Ibuprofen warning
- All core voice commands functional
- Clean mode transitions with fade animations