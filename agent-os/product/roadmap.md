# Product Roadmap

1. [ ] Voice Controller & Wake Word Detection — Implement Snap ASR integration with "Hey MedSnap" wake word activation and session management for both training and clinical modes. `M`

2. [ ] AR Overlay Foundation — Create AR rendering system with color-coded overlays (cyan circles, yellow arrows) maintaining 30+ FPS performance for visual feedback. `M`

3. [ ] Computer Vision Pipeline — Integrate MediaPipe Hands for real-time wrist detection and pulse point localization with sub-500ms latency. `S`

4. [ ] Training Mode State Machine — Build pulse-taking workflow with CV validation, 15-second timer, BPM input processing, and technique feedback generation. `M`

5. [ ] Clinical Mode Patient Management — Implement patient loading by voice command, AR patient card display, and session context management with 20-turn memory. `L`

6. [ ] Symptom Recording System — Create voice-activated symptom capture with natural language processing and session context accumulation for AI analysis. `S`

7. [ ] AI Diagnostic Engine — Integrate Gemini API with Letta context wrapper for differential diagnosis generation based on patient history and symptoms. `M`

8. [ ] Drug Interaction Safety System — Build prescription validation with Warfarin-Ibuprofen blocking, alternative medication suggestions, and safety warning display. `M`

9. [ ] Text-to-Speech Integration — Implement Fish Audio API for voice responses with intelligent caching to achieve sub-500ms response times. `S`

10. [ ] Demo Mode Fallback — Create offline-capable mock response system for network failures with pre-recorded Sarah Chen patient scenario. `S`

> Notes
> - Ordered by technical dependencies: voice/AR foundation → mode implementations → AI/backend integration
> - Total estimated effort: 7-8 weeks for single developer, compressed to 48 hours with 4-person team
> - Critical path: Voice Controller → AR Foundation → Training Mode → Clinical Mode