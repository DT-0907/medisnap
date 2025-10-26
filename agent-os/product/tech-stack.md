# Tech Stack

## Frontend
- **Platform**: Snap Spectacles with Lens Studio 5.3+
- **Language**: TypeScript/JavaScript (ES6+)
- **AR Rendering**: Lens Studio Component APIs
- **Voice Recognition**: Snap ASR (Automatic Speech Recognition)
- **Computer Vision**: MediaPipe Hands (pre-integrated in Lens Studio)

## Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express 4.18+
- **Language**: TypeScript 5.3+
- **Process Manager**: PM2 (production) / nodemon (development)

## Database & Storage
- **Primary Database**: Supabase (PostgreSQL)
- **Cache Layer**: Redis (for TTS audio URL caching)
- **Schema Design**: JSONB for flexible patient data structure

## AI & ML Services
- **Clinical AI**: Google Gemini API 1.5 Pro
- **Context Management**: Letta API (conversation memory wrapper)
- **Text-to-Speech**: Fish Audio API
- **Computer Vision**: MediaPipe Hands (21 landmark detection)

## Infrastructure
- **Backend Hosting**: Railway (auto-deploy from Git)
- **Database Hosting**: Supabase Cloud
- **CI/CD**: GitHub Actions
- **Deployment**: Git push to main branch triggers Railway deploy

## Development Tools
- **Testing**: Jest 29.x with Supertest
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git with feature branch workflow

## Key Libraries

### Backend Dependencies
- `express`: Web server framework
- `@supabase/supabase-js`: Database client
- `@google/generative-ai`: Gemini API client
- `axios`: HTTP client for external APIs
- `redis`: Caching layer
- `winston`: Logging framework
- `cors`: CORS middleware

### Development Dependencies
- `jest`: Testing framework
- `supertest`: API integration testing
- `typescript`: Type safety
- `eslint`: Code quality
- `prettier`: Code formatting
- `nodemon`: Development auto-reload

## Performance Targets
- **AR Rendering**: ≥30 FPS
- **CV Detection**: <500ms latency
- **Voice Response**: <3 seconds (wake word to TTS)
- **TTS Generation**: <1.5s (cold), <500ms (cached)
- **Cache Hit Rate**: >50% for common phrases

## Security & Compliance
- **MVP Phase**: HTTPS only, API key validation, input sanitization
- **Future**: HIPAA compliance, end-to-end encryption, audit logging

## Environment Configuration
- **Backend**: Environment variables via `.env` file
- **Frontend**: Configuration via `Resources/config.json`
- **Secrets**: Managed through Railway environment variables

## Cost Estimates (48-hour Hackathon)
- **Railway**: $5 credit (free tier)
- **Supabase**: Free tier
- **Gemini API**: ~$2-5
- **Fish Audio**: ~$5-10
- **Letta**: Free tier
- **Total**: ~$15-25