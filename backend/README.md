# MedSnap Backend - Database & API Setup

## Phase 4.0: Database Setup (Hours 0-6)

This directory contains the backend infrastructure for MedSnap AR Medical Assistant.

---

## Prerequisites

- Node.js v18+
- npm or yarn
- PostgreSQL client (psql) for database operations
- Supabase account with project created

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `backend/.env` file with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://rytvimoxozvkaneguvhw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:password@db.rytvimoxozvkaneguvhw.supabase.co:5432/postgres

# External API Keys (to be obtained)
GEMINI_API_KEY=your-gemini-key-here
FISH_AUDIO_API_KEY=your-fish-audio-key-here
LETTA_API_KEY=your-letta-key-here

# Server Configuration
PORT=3000
DEMO_MODE=false
```

### 3. Set Up Database

Apply the database schema and helper functions:

```bash
# Apply helper functions for testing
psql "$SUPABASE_DB_URL" -f db/test-helpers.sql

# Apply main schema
psql "$SUPABASE_DB_URL" -f db/schema.sql

# Seed with patient data
psql "$SUPABASE_DB_URL" -f db/seed.sql
```

**Or use Supabase SQL Editor:**
1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Run each SQL file in order:
   - `db/test-helpers.sql`
   - `db/schema.sql`
   - `db/seed.sql`

### 4. Verify Database Setup

```bash
# Run schema validation tests
npm test tests/unit/db/schema.test.ts

# Run patient data validation tests
npm test tests/unit/data/patients.test.ts

# Run database seed verification tests
npm test tests/integration/database-seed.test.ts
```

All tests should PASS ✅

---

## Database Schema

### Tables

#### `patients` (Core patient data)
- **Primary Key:** `id` (UUID with auto-generation)
- **Fields:** name, age, sex, chief_complaint, current_symptoms, vital_signs, allergies, medications, diagnosis_history
- **Key Detail:** medications and diagnosis_history use JSONB for nested data
- **Critical:** Sarah Chen MUST have Warfarin medication for demo

#### `visits` (Assessment records)
- **Primary Key:** `id` (UUID)
- **Foreign Key:** `patient_id` → `patients.id`
- **Fields:** date, symptoms_recorded, notes

#### `prescriptions` (Medication orders)
- **Primary Key:** `id` (UUID)
- **Foreign Key:** `patient_id` → `patients.id`
- **Fields:** medication, dosage, status, blocked, warnings
- **Default Status:** `pending_physician_approval`

---

## Mock Patient Data

Located in `data/patients.json` - 5 diverse patients:

1. **Sarah Chen** (34, Female) - Has Warfarin ⚠️ CRITICAL for drug interaction demo
2. **Robert Martinez** (58, Male) - Hypertension & diabetes
3. **Emily Watson** (45, Female) - Allergy demo
4. **Michael Okonkwo** (29, Male) - Diverse demographics
5. **Linda Thompson** (67, Female) - Complex medical history

---

## Testing

### Test Structure

```
tests/
├── unit/
│   ├── db/
│   │   └── schema.test.ts          # Schema validation tests
│   └── data/
│       └── patients.test.ts        # Patient data validation
└── integration/
    └── database-seed.test.ts       # Database seeding verification
```

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### TDD Workflow (MANDATORY)

1. Write tests FIRST
2. Run tests - confirm they FAIL
3. Commit tests: `git commit -m "[TDD] Add [component] tests"`
4. Implement code
5. Run tests - iterate until they PASS
6. Commit code: `git commit -m "[TDD] Implement [component]"`

---

## Verification Checklist

Before Hour 6 handoff to Dev 3:

- [ ] Supabase project created and accessible
- [ ] `backend/.env` created with valid credentials
- [ ] Helper RPC functions applied to Supabase
- [ ] Schema applied to Supabase (all 3 tables exist)
- [ ] Seed data applied (5 patients inserted)
- [ ] **CRITICAL:** Sarah Chen has Warfarin medication
- [ ] Schema validation tests passing
- [ ] Patient data validation tests passing
- [ ] Database seed verification tests passing
- [ ] All commits pushed to CV branch

---

## Manual Verification Commands

```bash
# Verify tables exist
psql "$SUPABASE_DB_URL" -c "\dt"

# Describe patients table
psql "$SUPABASE_DB_URL" -c "\d patients"

# Verify Sarah Chen has Warfarin
psql "$SUPABASE_DB_URL" -c "SELECT name, medications FROM patients WHERE name = 'Sarah Chen';"

# Count all patients
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM patients;"
```

Expected output:
- 3 tables: patients, visits, prescriptions
- Sarah Chen should have Warfarin in medications JSONB array
- 5 total patients

---

## Troubleshooting

### Issue: Tests fail with "relation does not exist"
**Solution:** Ensure schema.sql has been applied:
```bash
psql "$SUPABASE_DB_URL" -f db/schema.sql
```

### Issue: Seed script fails with JSONB syntax errors
**Solution:** Verify JSONB strings are properly escaped and cast with `::jsonb`

### Issue: Sarah Chen missing Warfarin
**Solution:** Re-run seed script and verify:
```bash
psql "$SUPABASE_DB_URL" -f db/seed.sql
psql "$SUPABASE_DB_URL" -c "SELECT medications FROM patients WHERE name = 'Sarah Chen';"
```

### Issue: Can't connect to Supabase
**Solution:**
1. Check `.env` credentials are correct
2. Verify Supabase project is active (not paused)
3. Check network/firewall settings

---

## Next Steps

After completing Phase 4.0, Dev 3 will:
1. Receive Supabase credentials
2. Create `src/db/supabase.ts` client wrapper
3. Build patient CRUD operations
4. Integrate with backend API endpoints

---

## Contact

- **Dev 4** (Database/CV/Integration Owner)
- Critical handoff to Dev 3 by Hour 6

---

# Dev 3: Backend API Development

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys and Supabase credentials
```

### 3. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Run Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run in watch mode
npm run test:coverage # Generate coverage report
```

---

## Development Workflow

This project follows **Strict Test-Driven Development (TDD)**:

1. **Write tests FIRST** - Before implementing any feature
2. **Run tests** - Confirm they FAIL (red state)
3. **Commit tests**: `git commit -m "[TDD] Add [component] tests"`
4. **Implement code** - Write minimum code to pass tests
5. **Run tests** - Confirm they PASS (green state)
6. **Commit implementation**: `git commit -m "[TDD] Implement [component]"`
7. **Refactor** - Improve code while keeping tests green
8. **Repeat** - For each new feature or change

**NEVER** skip writing tests first. This ensures:
- Code correctness from the start
- Better architecture decisions
- Built-in documentation
- Regression prevention

---

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API endpoint definitions
│   ├── controllers/    # Business logic handlers
│   ├── services/       # External API integrations (Gemini, Fish Audio, Letta)
│   ├── models/         # Data models & database queries
│   ├── db/             # Database client and configuration
│   ├── utils/          # Helper functions
│   ├── middleware/     # Express middleware (auth, validation, error handling)
│   └── index.ts        # Main application entry point
├── tests/
│   ├── unit/           # Unit tests (mirrors src/ structure)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── db/
│   │   └── utils/
│   ├── integration/    # End-to-end API tests
│   └── setup.ts        # Test configuration
├── data/               # Mock data for seeding
├── db/                 # Database schema and migrations
├── .env.example        # Environment variable template
├── .eslintrc.js        # ESLint configuration
├── jest.config.js      # Jest test configuration
├── tsconfig.json       # TypeScript configuration
├── railway.json        # Railway deployment config
└── nixpacks.toml       # Railway build config
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (ts-node) |
| `npm run build` | Compile TypeScript to JavaScript (dist/) |
| `npm start` | Run production server (requires build first) |
| `npm test` | Run all tests with Jest |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Check code style with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run typecheck` | Check TypeScript types without compiling |

---

## API Endpoints

### Current Endpoints

#### Health Check
```
GET /health
```
Returns server health status, timestamp, environment, and version.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T10:00:00.000Z",
  "environment": "development",
  "version": "0.1.0"
}
```

#### API Info
```
GET /
```
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "MedSnap Backend API",
  "version": "0.1.0",
  "endpoints": {
    "health": "/health",
    "docs": "Coming soon"
  }
}
```

### Upcoming Endpoints (Phase 3.1-3.3)

#### Training Mode
- `POST /api/training/start` - Initialize training session
- `POST /api/training/feedback` - Submit BPM and get feedback

#### Clinical Mode
- `POST /api/clinical/patient/load` - Load patient record by ID
- `POST /api/clinical/symptom/record` - Record patient symptom
- `POST /api/clinical/decision-support` - Get AI recommendations
- `POST /api/clinical/prescription/create` - Create prescription with drug interaction checks

#### Utilities
- `POST /api/voice/command` - Extract intent from voice command
- `POST /api/tts/generate` - Generate TTS audio URL

---

## Railway Deployment

### Production URL
Deployed at: `https://your-railway-url.up.railway.app` (pending deployment)

### Deployment Process
See `RAILWAY_DEPLOY.md` for detailed deployment instructions.

**Quick Deploy:**
```bash
railway login                    # Authenticate with Railway
railway init                     # Initialize project
railway variables set KEY=VALUE  # Set environment variables
railway up                       # Deploy
```

### Auto-Deployment
Once linked to GitHub, Railway will automatically deploy on push to `main` branch.

---

## Code Quality

### TypeScript Configuration
- **Strict mode enabled** - All strictness flags active
- **No implicit any** - All types must be explicit
- **No unused variables** - Enforced at compile time

### ESLint Rules
- No `any` types (error level)
- Explicit function return types (warning)
- No unused variables or imports
- Consistent code style

### Testing Requirements
- **Minimum 80% code coverage** for all modules
- Unit tests for all business logic
- Integration tests for all API endpoints
- TDD workflow mandatory

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Supabase Configuration (from Dev 4)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# External API Keys
GEMINI_API_KEY=your-gemini-api-key
FISH_AUDIO_API_KEY=your-fish-audio-key
LETTA_API_KEY=your-letta-api-key

# Server Configuration
PORT=3000
NODE_ENV=development
DEMO_MODE=false  # Set to true for testing without external APIs
```

**Security:**
- NEVER commit `.env` to version control
- Use Railway dashboard or CLI to set production variables
- Rotate keys regularly

---

## Integration with Other Developers

### For Dev 1 (Frontend/Lens Studio)
- **Base URL**: `https://your-railway-url.up.railway.app`
- **Health Check**: `GET /health`
- Update your `config.json` with the backend URL
- All responses are JSON format
- CORS is enabled for Lens Studio origin

### For Dev 2 (AR/CV)
- **Computer Vision Integration**: Coming in Phase 3.3
- Real-time object detection results
- AR overlay coordination
- Performance targets: <500ms CV detection

### For Dev 4 (Database/Integration)
- Database schema established
- Supabase client integrated
- Patient data queries optimized
- JSONB for flexible nested data

---

## Performance Targets

- **API Response Time**: <3 seconds for all endpoints
- **TTS Generation**: <2 seconds for audio synthesis
- **AI Decision Support**: <5 seconds for recommendations
- **Database Queries**: <1 second for patient data retrieval
- **AR Frame Rate**: 30 FPS (coordinated with Dev 2)

---

## Troubleshooting

### Server Won't Start
1. Check `PORT` isn't already in use: `lsof -i:3000`
2. Verify all dependencies installed: `npm install`
3. Check `.env` file exists and has required variables
4. Review logs for specific errors

### Tests Failing
1. Ensure database schema is applied (see Dev 4 section)
2. Check Supabase credentials in `.env`
3. Run `npm run typecheck` to catch type errors
4. Clear Jest cache: `npx jest --clearCache`

### TypeScript Compilation Errors
1. Run `npm run typecheck` for detailed errors
2. Check for missing type definitions
3. Ensure all imports are typed
4. Review `tsconfig.json` configuration

### Railway Deployment Issues
1. Check build logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Ensure `package.json` scripts are correct
4. Check Railway configuration files

---

## Phase 3.0 Status ✅

**Completed:**
- [x] Project initialization with TypeScript
- [x] Express server with health check
- [x] Jest testing framework configured
- [x] ESLint code quality setup
- [x] Environment configuration
- [x] Railway deployment configuration
- [x] Project structure established

**Next: Phase 3.1 - Database Client Setup (TDD)**
- [ ] Supabase client wrapper
- [ ] Patient model with CRUD operations
- [ ] Prescription model with validation
- [ ] Drug interaction checking

---

## Team Communication

For questions or issues:
- **Dev 3** (Backend & AI Integration Owner)
- Check `docs/dev3-phase-3.0-3.1-implementation-plan.md` for detailed implementation guide
- Reference `CLAUDE.md` for project context and principles
