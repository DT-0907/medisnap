# Dev 3 Implementation Plan: Backend Foundation
## Phase 3.0 + 3.1: Project Setup & Database Client (Hours 0-12)

**Developer**: Dev 3 - Backend & AI Integration Owner
**Timeline**: Hours 0-12
**Branch**: `dev-3-backend`
**Methodology**: Strict Test-Driven Development (TDD)
**Critical Handoffs**:
- Hour 6: Receive Supabase credentials from Dev 4
- Hour 12: Share Railway backend URL with Dev 1 & 2

---

## Table of Contents

1. [Phase 3.0: Backend Project Setup (Hours 0-6)](#phase-30-backend-project-setup-hours-0-6)
2. [Phase 3.1: Database Client Setup - TDD (Hours 6-12)](#phase-31-database-client-setup---tdd-hours-6-12)
3. [Verification Checklist](#verification-checklist)
4. [Troubleshooting Guide](#troubleshooting-guide)

---

# Phase 3.0: Backend Project Setup (Hours 0-6)

## Task 3.0.1: Initialize Node.js Project

**Estimated Time**: 15 minutes

### Step 1: Create Backend Directory and Initialize

```bash
# Navigate to project root
cd /Users/jasonyi/medisnap

# Backend directory should already exist (from Dev 4's setup)
cd backend

# Initialize npm (should already be done, but verify)
# If package.json doesn't exist:
npm init -y
```

### Step 2: Verify Existing package.json

The backend should already have a `package.json` from Dev 4's setup. Verify it exists:

```bash
cat package.json
```

Expected to see basic configuration with name, version, scripts.

---

## Task 3.0.2: Install Dependencies

**Estimated Time**: 20 minutes

### Core Dependencies

```bash
npm install express @supabase/supabase-js dotenv cors
```

**Rationale**:
- `express`: Web framework for REST API
- `@supabase/supabase-js`: Database client (Dev 4 already installed)
- `dotenv`: Environment variable management
- `cors`: Enable cross-origin requests from Lens Studio client

### Development Dependencies

```bash
npm install --save-dev \
  typescript \
  @types/node \
  @types/express \
  @types/cors \
  ts-node \
  nodemon \
  jest \
  ts-jest \
  @types/jest \
  supertest \
  @types/supertest \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin
```

**Rationale**:
- TypeScript tooling: `typescript`, `ts-node`, type definitions
- Testing: `jest`, `ts-jest`, `supertest` (for API testing)
- Development: `nodemon` for auto-reload
- Code quality: `eslint` with TypeScript support

### Verify Installation

```bash
npm list --depth=0
```

Expected: All packages listed without errors.

---

## Task 3.0.3: Configure TypeScript

**Estimated Time**: 15 minutes

### Create tsconfig.json

```bash
# Create TypeScript configuration
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node", "jest"],
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
```

**Key Settings**:
- `strict: true` - Enforces all strict type checking
- `noImplicitAny: true` - No 'any' types allowed
- `outDir: "./dist"` - Compiled output directory
- `rootDir: "./src"` - Source code directory

### Verify TypeScript Configuration

```bash
npx tsc --showConfig
```

Expected: Configuration output without errors.

---

## Task 3.0.4: Create Directory Structure

**Estimated Time**: 10 minutes

### Create Source Directories

```bash
# Create all source directories
mkdir -p src/routes
mkdir -p src/controllers
mkdir -p src/services
mkdir -p src/models
mkdir -p src/db
mkdir -p src/utils
mkdir -p src/middleware

# Verify structure
tree src -L 1
```

**Directory Purpose**:
- `routes/` - API endpoint definitions (Express routers)
- `controllers/` - Business logic layer (called by routes)
- `services/` - External API integrations (Gemini, Fish Audio, Letta)
- `models/` - Data models and database query functions
- `db/` - Database client setup (Supabase wrapper)
- `utils/` - Helper functions (caching, logging, validation)
- `middleware/` - Express middleware (error handling, auth, etc.)

### Create Test Directories

```bash
# Test directories (should already exist from Dev 4)
mkdir -p tests/unit/routes
mkdir -p tests/unit/controllers
mkdir -p tests/unit/services
mkdir -p tests/unit/models
mkdir -p tests/unit/db
mkdir -p tests/unit/utils
mkdir -p tests/integration

# Verify structure
tree tests -L 2
```

---

## Task 3.0.5: Configure Jest

**Estimated Time**: 15 minutes

### Update jest.config.js

The file should already exist from Dev 4's setup. Verify and update if needed:

```bash
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
EOF
```

### Create Test Setup File

```bash
cat > tests/setup.ts << 'EOF'
// Global test setup
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test teardown
afterAll(() => {
  // Cleanup if needed
});
EOF
```

### Verify Jest Configuration

```bash
npx jest --version
npx jest --listTests
```

Expected: Jest version displayed, no tests found yet (expected).

---

## Task 3.0.6: Configure ESLint

**Estimated Time**: 15 minutes

### Create .eslintrc.js

```bash
cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  env: {
    node: true,
    jest: true,
  },
};
EOF
```

**Key Rules**:
- `no-explicit-any: error` - Prevents use of 'any' type
- `explicit-function-return-type: warn` - Encourages return type annotations
- `no-unused-vars: error` - Catches unused variables

### Create .eslintignore

```bash
cat > .eslintignore << 'EOF'
node_modules
dist
coverage
*.config.js
EOF
```

### Verify ESLint

```bash
npx eslint --version
```

---

## Task 3.0.7: Update package.json Scripts

**Estimated Time**: 10 minutes

### Add/Update Scripts Section

```bash
# Use npm pkg to add scripts
npm pkg set scripts.dev="nodemon --exec ts-node src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.test="jest"
npm pkg set scripts.test:unit="jest tests/unit"
npm pkg set scripts.test:integration="jest tests/integration"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.lint="eslint 'src/**/*.ts' 'tests/**/*.ts'"
npm pkg set scripts.lint:fix="eslint 'src/**/*.ts' 'tests/**/*.ts' --fix"
npm pkg set scripts.typecheck="tsc --noEmit"
```

### Verify package.json Scripts

```bash
cat package.json | grep -A 15 '"scripts"'
```

Expected: All scripts listed correctly.

---

## Task 3.0.8: Create Environment Configuration

**Estimated Time**: 15 minutes

### Create .env.example

```bash
cat > .env.example << 'EOF'
# Supabase Configuration (Dev 4 will provide actual values)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# External API Keys
GEMINI_API_KEY=your-gemini-key-here
FISH_AUDIO_API_KEY=your-fish-audio-key-here
LETTA_API_KEY=your-letta-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Demo Mode (for testing without external APIs)
DEMO_MODE=false

# Railway Configuration (will be set automatically in production)
RAILWAY_ENVIRONMENT=production
EOF
```

### Create .env File (Empty Template)

```bash
cat > .env << 'EOF'
# Supabase Configuration - WAITING FOR DEV 4
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_DB_URL=

# External API Keys - ADD YOUR KEYS HERE
GEMINI_API_KEY=
FISH_AUDIO_API_KEY=
LETTA_API_KEY=

# Server Configuration
PORT=3000
NODE_ENV=development
DEMO_MODE=false
EOF
```

**ACTION REQUIRED**: Add your actual API keys to `.env` now:
```bash
# Edit .env and add your keys
nano .env
# OR
code .env
```

### Verify .gitignore Excludes .env

```bash
# Check if .env is already in .gitignore (should be from project init)
grep -q "^\.env$" ../.gitignore || echo ".env" >> ../.gitignore

# Verify
cat ../.gitignore | grep ".env"
```

Expected: `.env` appears in .gitignore.

---

## Task 3.0.9: Create Basic Express Server

**Estimated Time**: 20 minutes

### Create src/index.ts (Placeholder)

```typescript
// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0',
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'MedSnap Backend API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      docs: 'Coming soon',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MedSnap Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for testing
export default app;
```

### Test the Server Locally

```bash
# Start development server
npm run dev
```

**Expected Output**:
```
🚀 MedSnap Backend running on port 3000
📍 Environment: development
🔗 Health check: http://localhost:3000/health
```

### Test Health Endpoint

Open a new terminal:
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T...",
  "environment": "development",
  "version": "0.1.0"
}
```

Stop the server (Ctrl+C).

---

## Task 3.0.10: Set Up Railway Account & Deploy

**Estimated Time**: 30 minutes

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. Complete account setup

### Step 2: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Verify installation
railway --version
```

### Step 3: Login to Railway

```bash
railway login
```

This will open a browser window. Authorize the CLI.

### Step 4: Initialize Railway Project

```bash
# From backend directory
railway init

# When prompted:
# - Project name: medisnap-backend
# - Start with: Empty project
```

### Step 5: Link to Railway Project

```bash
railway link
```

Select the `medisnap-backend` project you just created.

### Step 6: Add Environment Variables to Railway

```bash
# Add placeholder variables (will update after Dev 4 provides credentials)
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DEMO_MODE=false

# NOTE: We'll add Supabase credentials after Dev 4 handoff (Hour 6)
# NOTE: Add your API keys now
railway variables set GEMINI_API_KEY="your-gemini-key-here"
railway variables set FISH_AUDIO_API_KEY="your-fish-audio-key-here"
railway variables set LETTA_API_KEY="your-letta-key-here"
```

**ACTION REQUIRED**: Replace the placeholder keys above with your actual keys.

### Step 7: Create Procfile (Railway Requirement)

```bash
cat > Procfile << 'EOF'
web: npm run start
EOF
```

### Step 8: Update package.json for Railway

Ensure you have a build script:
```bash
npm pkg set scripts.railway:build="npm install && npm run build"
```

### Step 9: Deploy to Railway

```bash
# Build the project
npm run build

# Deploy to Railway
railway up
```

**Expected Output**:
```
✓ Build completed
✓ Deployment successful
🚀 Service URL: https://medisnap-backend-production.up.railway.app
```

### Step 10: Verify Deployment

```bash
# Get your Railway URL
railway domain

# Test health endpoint
curl https://your-railway-url.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T...",
  "environment": "production",
  "version": "0.1.0"
}
```

### Step 11: Configure Auto-Deployment

```bash
# Connect to GitHub for auto-deploy
railway connect
```

Follow prompts to:
1. Select your GitHub repository
2. Choose the `main` branch for production deployments
3. Enable automatic deployments on push

---

## Task 3.0.11: Share Railway URL with Team

**Estimated Time**: 10 minutes

### Get Railway URL

```bash
railway domain
```

Example output: `https://medisnap-backend-production.up.railway.app`

### Create Team Communication

Send to Dev 1 & Dev 2:

```
Subject: [Hour 6] Backend URL Ready

Team,

Backend server is deployed and ready for integration!

🔗 Production URL: https://your-railway-url.up.railway.app
🔗 Health Check: https://your-railway-url.up.railway.app/health

Available endpoints (currently):
- GET / - API info
- GET /health - Health status

Next endpoints coming by Hour 24:
- POST /api/training/start
- POST /api/training/feedback
- POST /api/clinical/patient/load
- POST /api/clinical/symptom/record
- POST /api/clinical/decision-support
- POST /api/clinical/prescription/create
- POST /api/voice/command
- POST /api/tts/generate

Update your Lens Studio config.json with this URL.

Let me know if you need any clarifications!

- Dev 3
```

---

## Task 3.0.12: Create Backend README

**Estimated Time**: 15 minutes

### Update backend/README.md

The README should already exist from Dev 4. Update it to add Dev 3's sections:

```bash
# Append to existing README or create sections
cat >> README.md << 'EOF'

---

## Dev 3: Backend API Development

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### Development Workflow

This project follows strict Test-Driven Development (TDD):

1. Write tests FIRST
2. Run tests (confirm FAIL)
3. Commit tests: `git commit -m "[TDD] Add [component] tests"`
4. Implement code
5. Run tests (confirm PASS)
6. Commit implementation: `git commit -m "[TDD] Implement [component]"`

### Project Structure

```
src/
├── routes/         # API endpoint definitions
├── controllers/    # Business logic
├── services/       # External API integrations
├── models/         # Data models & DB queries
├── db/             # Database client
├── utils/          # Helper functions
└── middleware/     # Express middleware

tests/
├── unit/           # Unit tests (mirror src/)
└── integration/    # End-to-end tests
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code style
- `npm run typecheck` - Check TypeScript types

### API Endpoints (In Progress)

#### Health Check
- `GET /health` - Server health status

#### Training Mode (Coming Soon)
- `POST /api/training/start` - Initialize training session
- `POST /api/training/feedback` - Submit BPM and get feedback

#### Clinical Mode (Coming Soon)
- `POST /api/clinical/patient/load` - Load patient record
- `POST /api/clinical/symptom/record` - Record symptom
- `POST /api/clinical/decision-support` - Get AI recommendations
- `POST /api/clinical/prescription/create` - Create prescription

#### Utilities (Coming Soon)
- `POST /api/voice/command` - Extract intent from voice
- `POST /api/tts/generate` - Generate TTS audio

### Railway Deployment

Deployed at: `https://your-railway-url.up.railway.app`

Auto-deploys on push to `main` branch.

EOF
```

---

## Task 3.0.13: Commit Phase 3.0 Work

**Estimated Time**: 10 minutes

### Stage All Changes

```bash
# From backend directory
git status

# Add all new files
git add .

# Review changes
git diff --staged
```

### Commit Phase 3.0

```bash
git commit -m "[Phase 3.0] Initialize backend project with Express, TypeScript, Jest

- Initialize Node.js project with TypeScript
- Configure Jest for testing with ts-jest
- Set up ESLint for code quality
- Create Express server with health check endpoint
- Deploy placeholder to Railway
- Configure environment variables
- Create comprehensive project structure
- Add development scripts and tooling
- Share Railway URL with team

Next: Phase 3.1 - Database client setup with TDD"
```

### Push to Branch

```bash
git push origin dev-3-backend
```

---

## Phase 3.0 Checkpoint ✅

Before proceeding to Phase 3.1, verify:

- [ ] Node.js project initialized with all dependencies
- [ ] TypeScript configured with strict mode
- [ ] Jest configured for testing
- [ ] ESLint configured for code quality
- [ ] Express server running locally
- [ ] Railway account created and CLI installed
- [ ] Backend deployed to Railway
- [ ] Railway URL shared with Dev 1 & 2
- [ ] Health check endpoint working
- [ ] All changes committed and pushed
- [ ] API keys added to .env (Gemini, Fish Audio, Letta)

**Expected Time to Complete Phase 3.0**: 3-4 hours

---

# Phase 3.1: Database Client Setup - TDD (Hours 6-12)

## Prerequisites

**WAIT FOR DEV 4 HANDOFF** (Hour 6):
- Supabase credentials (URL, KEY, DB_URL)
- Database schema applied (3 tables: patients, visits, prescriptions)
- Seed data loaded (5 patients including Sarah Chen with Warfarin)

Once received, update `.env`:
```bash
# Add Supabase credentials from Dev 4
nano .env
# OR
code .env
```

Also add to Railway:
```bash
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set SUPABASE_KEY="your-key"
railway variables set SUPABASE_DB_URL="postgresql://..."
```

---

## Task 3.1: Supabase Client - TDD

**Estimated Time**: 1 hour

### TDD Step 1: Write Tests FIRST

Create `tests/unit/db/supabase.test.ts`:

```typescript
// tests/unit/db/supabase.test.ts
import { getSupabaseClient, testConnection } from '../../../src/db/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Supabase Client', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    // Verify environment variables are set
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_KEY).toBeDefined();
  });

  describe('getSupabaseClient', () => {
    it('should return a valid Supabase client instance', () => {
      client = getSupabaseClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(Object);
      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();

      expect(client1).toBe(client2);
    });

    it('should throw error if SUPABASE_URL is missing', () => {
      const originalUrl = process.env.SUPABASE_URL;
      delete process.env.SUPABASE_URL;

      expect(() => getSupabaseClient()).toThrow('SUPABASE_URL');

      // Restore
      process.env.SUPABASE_URL = originalUrl;
    });

    it('should throw error if SUPABASE_KEY is missing', () => {
      const originalKey = process.env.SUPABASE_KEY;
      delete process.env.SUPABASE_KEY;

      expect(() => getSupabaseClient()).toThrow('SUPABASE_KEY');

      // Restore
      process.env.SUPABASE_KEY = originalKey;
    });
  });

  describe('testConnection', () => {
    it('should successfully connect to database', async () => {
      const result = await testConnection();

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return connection details on success', async () => {
      const result = await testConnection();

      expect(result.message).toContain('Connected to Supabase');
      expect(result.tablesFound).toBeGreaterThanOrEqual(3);
      expect(result.tables).toContain('patients');
      expect(result.tables).toContain('visits');
      expect(result.tables).toContain('prescriptions');
    });

    it('should handle connection errors gracefully', async () => {
      // Temporarily corrupt the client to test error handling
      const originalKey = process.env.SUPABASE_KEY;
      process.env.SUPABASE_KEY = 'invalid-key';

      // Force new client creation
      jest.resetModules();
      const { testConnection: testBadConnection } = require('../../../src/db/supabase');

      const result = await testBadConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore
      process.env.SUPABASE_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('query execution', () => {
    it('should execute SELECT query successfully', async () => {
      client = getSupabaseClient();

      const { data, error } = await client
        .from('patients')
        .select('id, name')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle query errors gracefully', async () => {
      client = getSupabaseClient();

      const { data, error } = await client
        .from('nonexistent_table')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('error formatting', () => {
    it('should format Supabase errors consistently', async () => {
      client = getSupabaseClient();

      const { error } = await client
        .from('nonexistent_table')
        .select('*');

      expect(error).toBeDefined();
      expect(error?.message).toBeDefined();
      expect(typeof error?.message).toBe('string');
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/db/supabase.test.ts
```

**Expected Result**: All tests FAIL (module doesn't exist yet).

Example output:
```
 FAIL  tests/unit/db/supabase.test.ts
  ● Test suite failed to run

    Cannot find module '../../../src/db/supabase'
```

### TDD Step 3: Commit Tests

```bash
git add tests/unit/db/supabase.test.ts
git commit -m "[TDD] Add Supabase client tests

Tests cover:
- Client initialization and singleton pattern
- Environment variable validation
- Connection testing
- Query execution
- Error handling and formatting

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Supabase Client

Create `src/db/supabase.ts`:

```typescript
// src/db/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance (singleton pattern)
 * @throws {Error} If SUPABASE_URL or SUPABASE_KEY environment variables are not set
 * @returns {SupabaseClient} Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_KEY environment variable is not set');
  }

  // Create and cache instance
  supabaseInstance = createClient(supabaseUrl, supabaseKey);

  return supabaseInstance;
}

/**
 * Test database connection
 * @returns {Promise<ConnectionResult>} Connection test result
 */
export async function testConnection(): Promise<ConnectionResult> {
  try {
    const client = getSupabaseClient();

    // Test connection by querying information schema
    const { data, error } = await client
      .from('patients')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase',
      };
    }

    // Get list of tables
    const tables = ['patients', 'visits', 'prescriptions'];

    return {
      success: true,
      error: null,
      message: 'Connected to Supabase successfully',
      tablesFound: tables.length,
      tables,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      message: 'Connection test failed',
    };
  }
}

/**
 * Format Supabase error for consistent error handling
 * @param {any} error - Supabase error object
 * @returns {string} Formatted error message
 */
export function formatSupabaseError(error: any): string {
  if (!error) {
    return 'Unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return JSON.stringify(error);
}

// Type definitions
export interface ConnectionResult {
  success: boolean;
  error: string | null;
  message: string;
  tablesFound?: number;
  tables?: string[];
}
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/db/supabase.test.ts
```

**Expected Result**: All tests PASS ✅

Example output:
```
 PASS  tests/unit/db/supabase.test.ts
  Supabase Client
    getSupabaseClient
      ✓ should return a valid Supabase client instance (25ms)
      ✓ should return the same instance on multiple calls (singleton) (3ms)
      ✓ should throw error if SUPABASE_URL is missing (5ms)
      ✓ should throw error if SUPABASE_KEY is missing (4ms)
    testConnection
      ✓ should successfully connect to database (150ms)
      ✓ should return connection details on success (145ms)
      ✓ should handle connection errors gracefully (120ms)
    query execution
      ✓ should execute SELECT query successfully (135ms)
      ✓ should handle query errors gracefully (110ms)
    error formatting
      ✓ should format Supabase errors consistently (105ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

If any tests fail, debug and fix until all pass.

### TDD Step 6: Commit Implementation

```bash
git add src/db/supabase.ts
git commit -m "[TDD] Implement Supabase client with singleton pattern

Implementation includes:
- Singleton pattern for client instance
- Environment variable validation
- Connection testing function
- Error formatting utility
- TypeScript type definitions

All tests PASSING ✅"
```

---

## Task 3.2: Patient Model - TDD

**Estimated Time**: 1.5 hours

### TDD Step 1: Write Tests FIRST

Create `tests/unit/models/patient.test.ts`:

```typescript
// tests/unit/models/patient.test.ts
import {
  findPatientByName,
  findPatientById,
  getAllPatients,
  Patient,
  Medication,
  DiagnosisEntry,
  VitalSigns,
} from '../../../src/models/patient';

describe('Patient Model', () => {
  describe('Type Definitions', () => {
    it('should define Patient interface correctly', () => {
      const patient: Patient = {
        id: 'test-uuid',
        name: 'Test Patient',
        age: 30,
        sex: 'Female',
        chief_complaint: 'Test complaint',
        current_symptoms: ['symptom1'],
        vital_signs: { bp: '120/80', hr: 72, o2: 98, temp: 98.6 },
        allergies: ['Penicillin'],
        medications: [],
        diagnosis_history: [],
        created_at: new Date().toISOString(),
      };

      expect(patient).toBeDefined();
      expect(typeof patient.name).toBe('string');
      expect(typeof patient.age).toBe('number');
    });

    it('should define Medication interface correctly', () => {
      const medication: Medication = {
        name: 'Aspirin',
        dosage: '100mg daily',
        started: '2024-01-01',
      };

      expect(medication.name).toBeDefined();
      expect(medication.dosage).toBeDefined();
      expect(medication.started).toBeDefined();
    });

    it('should define VitalSigns interface correctly', () => {
      const vitals: VitalSigns = {
        bp: '120/80',
        hr: 72,
        o2: 98,
        temp: 98.6,
      };

      expect(vitals.bp).toBeDefined();
      expect(vitals.hr).toBeDefined();
      expect(vitals.o2).toBeDefined();
      expect(vitals.temp).toBeDefined();
    });
  });

  describe('findPatientByName', () => {
    it('should find patient by exact name match', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should find patient with case-insensitive search', async () => {
      const result = await findPatientByName('sarah chen');

      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should find patient with partial name match', async () => {
      const result = await findPatientByName('Sarah');

      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toContain('Sarah');
    });

    it('should return null when patient not found', async () => {
      const result = await findPatientByName('Nonexistent Patient');

      expect(result.success).toBe(true);
      expect(result.patient).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle empty string gracefully', async () => {
      const result = await findPatientByName('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Patient name is required');
    });

    it('should return patient with all fields populated', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient).toBeDefined();
      const patient = result.patient!;

      // Core fields
      expect(patient.id).toBeDefined();
      expect(patient.name).toBe('Sarah Chen');
      expect(patient.age).toBe(34);
      expect(patient.sex).toBe('Female');

      // Clinical fields
      expect(patient.chief_complaint).toBeDefined();
      expect(Array.isArray(patient.current_symptoms)).toBe(true);
      expect(patient.vital_signs).toBeDefined();

      // Safety fields
      expect(Array.isArray(patient.allergies)).toBe(true);
      expect(Array.isArray(patient.medications)).toBe(true);
      expect(Array.isArray(patient.diagnosis_history)).toBe(true);
    });

    it('CRITICAL: Sarah Chen should have Warfarin medication', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient).toBeDefined();
      const medications = result.patient!.medications;

      const warfarin = medications.find((m: Medication) => m.name === 'Warfarin');
      expect(warfarin).toBeDefined();
      expect(warfarin?.dosage).toBe('5mg daily');
      expect(warfarin?.started).toBe('2024-03-01');
    });

    it('should parse JSONB medications correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.medications).toBeDefined();
      const medications = result.patient!.medications;

      expect(Array.isArray(medications)).toBe(true);
      expect(medications.length).toBeGreaterThan(0);

      medications.forEach((med: Medication) => {
        expect(med.name).toBeDefined();
        expect(med.dosage).toBeDefined();
        expect(med.started).toBeDefined();
      });
    });

    it('should parse JSONB diagnosis_history correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.diagnosis_history).toBeDefined();
      const history = result.patient!.diagnosis_history;

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      history.forEach((entry: DiagnosisEntry) => {
        expect(entry.date).toBeDefined();
        expect(entry.diagnosis).toBeDefined();
        expect(entry.provider).toBeDefined();
      });
    });

    it('should parse vital_signs JSONB correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.vital_signs).toBeDefined();
      const vitals = result.patient!.vital_signs!;

      expect(vitals.bp).toBeDefined();
      expect(vitals.hr).toBeDefined();
      expect(vitals.o2).toBeDefined();
      expect(vitals.temp).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // This test will pass with proper error handling
      // Actual implementation will catch database errors
      const result = await findPatientByName('Sarah Chen');
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('findPatientById', () => {
    let sarahChenId: string;

    beforeAll(async () => {
      // Get Sarah Chen's ID for testing
      const result = await findPatientByName('Sarah Chen');
      sarahChenId = result.patient!.id;
    });

    it('should find patient by UUID', async () => {
      const result = await findPatientById(sarahChenId);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patient).toBeDefined();
      expect(result.patient?.id).toBe(sarahChenId);
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should return null when patient ID not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await findPatientById(fakeId);

      expect(result.success).toBe(true);
      expect(result.patient).toBeNull();
    });

    it('should handle invalid UUID format', async () => {
      const result = await findPatientById('invalid-uuid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty string gracefully', async () => {
      const result = await findPatientById('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients', async () => {
      const result = await getAllPatients();

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patients).toBeDefined();
      expect(Array.isArray(result.patients)).toBe(true);
    });

    it('should return at least 3 patients (per FR-38)', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeGreaterThanOrEqual(3);
    });

    it('should return at most 5 patients for MVP (per FR-38)', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeLessThanOrEqual(5);
    });

    it('should include Sarah Chen in patient list', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      const sarahChen = result.patients!.find(p => p.name === 'Sarah Chen');
      expect(sarahChen).toBeDefined();
    });

    it('should return patients with all required fields', async () => {
      const result = await getAllPatients();

      result.patients!.forEach(patient => {
        expect(patient.id).toBeDefined();
        expect(patient.name).toBeDefined();
        expect(patient.age).toBeGreaterThan(0);
        expect(patient.sex).toBeDefined();
        expect(Array.isArray(patient.allergies)).toBe(true);
        expect(Array.isArray(patient.medications)).toBe(true);
        expect(Array.isArray(patient.diagnosis_history)).toBe(true);
      });
    });

    it('should support limit parameter', async () => {
      const result = await getAllPatients(2);

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeLessThanOrEqual(2);
    });

    it('should handle database errors gracefully', async () => {
      // Proper error handling should make this pass
      const result = await getAllPatients();
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/models/patient.test.ts
```

**Expected Result**: All tests FAIL (module doesn't exist yet).

### TDD Step 3: Commit Tests

```bash
git add tests/unit/models/patient.test.ts
git commit -m "[TDD] Add Patient model tests

Tests cover:
- Type definitions (Patient, Medication, VitalSigns, DiagnosisEntry)
- findPatientByName with case-insensitive and partial matching
- findPatientById with UUID validation
- getAllPatients with pagination support
- JSONB parsing for medications and diagnosis_history
- CRITICAL test: Sarah Chen has Warfarin medication
- Error handling for all operations

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Patient Model

Create `src/models/patient.ts`:

```typescript
// src/models/patient.ts
import { getSupabaseClient } from '../db/supabase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  chief_complaint: string | null;
  current_symptoms: string[];
  vital_signs: VitalSigns | null;
  allergies: string[];
  medications: Medication[];
  diagnosis_history: DiagnosisEntry[];
  created_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  started: string;
}

export interface DiagnosisEntry {
  date: string;
  diagnosis: string;
  provider: string;
}

export interface VitalSigns {
  bp: string;
  hr: number;
  o2: number;
  temp: number;
}

export interface PatientResult {
  success: boolean;
  error: string | null;
  patient: Patient | null;
}

export interface PatientsResult {
  success: boolean;
  error: string | null;
  patients: Patient[] | null;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Find patient by name (case-insensitive, supports partial match)
 * @param {string} name - Patient name to search for
 * @returns {Promise<PatientResult>} Patient result
 */
export async function findPatientByName(name: string): Promise<PatientResult> {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Patient name is required',
        patient: null,
      };
    }

    const client = getSupabaseClient();

    // Case-insensitive search using ilike
    const { data, error } = await client
      .from('patients')
      .select('*')
      .ilike('name', `%${name.trim()}%`)
      .limit(1)
      .single();

    if (error) {
      // Not found is not an error for our purposes
      if (error.code === 'PGRST116') {
        return {
          success: true,
          error: null,
          patient: null,
        };
      }

      return {
        success: false,
        error: error.message,
        patient: null,
      };
    }

    return {
      success: true,
      error: null,
      patient: data as Patient,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patient: null,
    };
  }
}

/**
 * Find patient by UUID
 * @param {string} id - Patient UUID
 * @returns {Promise<PatientResult>} Patient result
 */
export async function findPatientById(id: string): Promise<PatientResult> {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        patient: null,
      };
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        success: false,
        error: 'Invalid UUID format',
        patient: null,
      };
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Not found is not an error for our purposes
      if (error.code === 'PGRST116') {
        return {
          success: true,
          error: null,
          patient: null,
        };
      }

      return {
        success: false,
        error: error.message,
        patient: null,
      };
    }

    return {
      success: true,
      error: null,
      patient: data as Patient,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patient: null,
    };
  }
}

/**
 * Get all patients with optional limit
 * @param {number} limit - Optional limit on number of patients to return
 * @returns {Promise<PatientsResult>} Patients result
 */
export async function getAllPatients(limit?: number): Promise<PatientsResult> {
  try {
    const client = getSupabaseClient();

    let query = client
      .from('patients')
      .select('*')
      .order('name', { ascending: true });

    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
        patients: null,
      };
    }

    return {
      success: true,
      error: null,
      patients: data as Patient[],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patients: null,
    };
  }
}
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/models/patient.test.ts
```

**Expected Result**: All tests PASS ✅

If any tests fail, debug and fix until all pass.

**Common Issues**:
- Supabase credentials not set → Check `.env` file
- Sarah Chen not found → Verify Dev 4's seed data
- Warfarin not in medications → Check seed data matches PRD

### TDD Step 6: Commit Implementation

```bash
git add src/models/patient.ts
git commit -m "[TDD] Implement Patient model with database queries

Implementation includes:
- Type definitions for Patient, Medication, VitalSigns, DiagnosisEntry
- findPatientByName with case-insensitive and partial matching
- findPatientById with UUID validation
- getAllPatients with optional pagination
- Comprehensive error handling
- Input validation

All tests PASSING ✅
CRITICAL: Sarah Chen Warfarin test PASSING ✅"
```

---

## Task 3.3: Prescription Model - TDD

**Estimated Time**: 1 hour

### TDD Step 1: Write Tests FIRST

Create `tests/unit/models/prescription.test.ts`:

```typescript
// tests/unit/models/prescription.test.ts
import {
  createPrescription,
  findPrescriptionsByPatient,
  updatePrescriptionStatus,
  Prescription,
  PrescriptionInput,
  PrescriptionWarning,
} from '../../../src/models/prescription';
import { findPatientByName } from '../../../src/models/patient';

describe('Prescription Model', () => {
  let testPatientId: string;

  beforeAll(async () => {
    // Get Sarah Chen's ID for testing
    const result = await findPatientByName('Sarah Chen');
    testPatientId = result.patient!.id;
  });

  describe('Type Definitions', () => {
    it('should define Prescription interface correctly', () => {
      const prescription: Prescription = {
        id: 'test-uuid',
        patient_id: 'patient-uuid',
        medication: 'Aspirin',
        dosage: '100mg daily',
        status: 'pending_physician_approval',
        created_at: new Date().toISOString(),
        blocked: false,
        warnings: [],
      };

      expect(prescription).toBeDefined();
      expect(prescription.status).toBe('pending_physician_approval');
    });

    it('should define PrescriptionInput interface correctly', () => {
      const input: PrescriptionInput = {
        patient_id: 'patient-uuid',
        medication: 'Aspirin',
        dosage: '100mg daily',
        blocked: false,
        warnings: [],
      };

      expect(input.patient_id).toBeDefined();
      expect(input.medication).toBeDefined();
      expect(input.dosage).toBeDefined();
    });

    it('should define PrescriptionWarning interface correctly', () => {
      const warning: PrescriptionWarning = {
        type: 'drug_interaction',
        severity: 'HIGH',
        message: 'Test warning',
        explanation: 'Test explanation',
      };

      expect(warning.type).toBeDefined();
      expect(warning.severity).toBeDefined();
    });
  });

  describe('createPrescription', () => {
    it('should create a prescription successfully', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Acetaminophen',
        dosage: '500mg every 6 hours',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.id).toBeDefined();
      expect(result.prescription?.medication).toBe('Acetaminophen');
    });

    it('should set default status to pending_physician_approval (FR-26)', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Aspirin',
        dosage: '100mg daily',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.prescription?.status).toBe('pending_physician_approval');
    });

    it('should create prescription even when blocked (for audit - FR-23)', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Ibuprofen',
        dosage: '400mg',
        blocked: true,
        warnings: [
          {
            type: 'drug_interaction',
            severity: 'HIGH',
            message: 'Interaction with Warfarin',
            explanation: 'Increased bleeding risk',
          },
        ],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(true);
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.blocked).toBe(true);
      expect(result.prescription?.warnings).toHaveLength(1);
    });

    it('should store warnings as JSONB array', async () => {
      const warnings: PrescriptionWarning[] = [
        {
          type: 'drug_interaction',
          severity: 'HIGH',
          message: 'Warning 1',
          explanation: 'Explanation 1',
        },
        {
          type: 'allergy',
          severity: 'HIGH',
          message: 'Warning 2',
          explanation: 'Explanation 2',
        },
      ];

      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Test Med',
        dosage: '100mg',
        blocked: true,
        warnings,
      };

      const result = await createPrescription(input);

      expect(result.prescription?.warnings).toHaveLength(2);
      expect(result.prescription?.warnings[0].type).toBe('drug_interaction');
      expect(result.prescription?.warnings[1].type).toBe('allergy');
    });

    it('should handle missing patient_id', async () => {
      const input: PrescriptionInput = {
        patient_id: '',
        medication: 'Aspirin',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });

    it('should handle missing medication', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: '',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Medication is required');
    });

    it('should handle missing dosage', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Aspirin',
        dosage: '',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dosage is required');
    });

    it('should handle database errors gracefully', async () => {
      const input: PrescriptionInput = {
        patient_id: '00000000-0000-0000-0000-000000000000', // Non-existent patient
        medication: 'Aspirin',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('findPrescriptionsByPatient', () => {
    beforeAll(async () => {
      // Create a test prescription
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Test Medication',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };
      await createPrescription(input);
    });

    it('should find all prescriptions for a patient', async () => {
      const result = await findPrescriptionsByPatient(testPatientId);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescriptions).toBeDefined();
      expect(Array.isArray(result.prescriptions)).toBe(true);
      expect(result.prescriptions!.length).toBeGreaterThan(0);
    });

    it('should return prescriptions with all fields', async () => {
      const result = await findPrescriptionsByPatient(testPatientId);

      const prescription = result.prescriptions![0];
      expect(prescription.id).toBeDefined();
      expect(prescription.patient_id).toBe(testPatientId);
      expect(prescription.medication).toBeDefined();
      expect(prescription.dosage).toBeDefined();
      expect(prescription.status).toBeDefined();
      expect(prescription.created_at).toBeDefined();
      expect(typeof prescription.blocked).toBe('boolean');
      expect(Array.isArray(prescription.warnings)).toBe(true);
    });

    it('should return empty array for patient with no prescriptions', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await findPrescriptionsByPatient(fakeId);

      expect(result.success).toBe(true);
      expect(result.prescriptions).toEqual([]);
    });

    it('should handle empty patient_id', async () => {
      const result = await findPrescriptionsByPatient('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });

    it('should support limit parameter', async () => {
      const result = await findPrescriptionsByPatient(testPatientId, 1);

      expect(result.prescriptions).toBeDefined();
      expect(result.prescriptions!.length).toBeLessThanOrEqual(1);
    });
  });

  describe('updatePrescriptionStatus', () => {
    let testPrescriptionId: string;

    beforeAll(async () => {
      // Create a test prescription
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Status Test Med',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };
      const result = await createPrescription(input);
      testPrescriptionId = result.prescription!.id;
    });

    it('should update prescription status', async () => {
      const result = await updatePrescriptionStatus(
        testPrescriptionId,
        'approved'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.status).toBe('approved');
    });

    it('should handle invalid prescription ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await updatePrescriptionStatus(fakeId, 'approved');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty prescription ID', async () => {
      const result = await updatePrescriptionStatus('', 'approved');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Prescription ID is required');
    });

    it('should handle empty status', async () => {
      const result = await updatePrescriptionStatus(testPrescriptionId, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Status is required');
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/models/prescription.test.ts
```

**Expected Result**: All tests FAIL (module doesn't exist yet).

### TDD Step 3: Commit Tests

```bash
git add tests/unit/models/prescription.test.ts
git commit -m "[TDD] Add Prescription model tests

Tests cover:
- Type definitions (Prescription, PrescriptionInput, PrescriptionWarning)
- createPrescription with validation and audit trail
- Default status: pending_physician_approval (FR-26)
- Blocked prescriptions logged for audit (FR-23)
- JSONB warnings array storage
- findPrescriptionsByPatient with pagination
- updatePrescriptionStatus
- Comprehensive error handling

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Prescription Model

Create `src/models/prescription.ts`:

```typescript
// src/models/prescription.ts
import { getSupabaseClient } from '../db/supabase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Prescription {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  status: string;
  created_at: string;
  blocked: boolean;
  warnings: PrescriptionWarning[];
}

export interface PrescriptionInput {
  patient_id: string;
  medication: string;
  dosage: string;
  blocked: boolean;
  warnings: PrescriptionWarning[];
}

export interface PrescriptionWarning {
  type: string;
  severity: string;
  message: string;
  explanation: string;
}

export interface PrescriptionResult {
  success: boolean;
  error: string | null;
  prescription: Prescription | null;
}

export interface PrescriptionsResult {
  success: boolean;
  error: string | null;
  prescriptions: Prescription[] | null;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Create a new prescription
 * NOTE: Per FR-23, prescriptions are logged even when blocked for audit purposes
 * @param {PrescriptionInput} input - Prescription data
 * @returns {Promise<PrescriptionResult>} Prescription result
 */
export async function createPrescription(
  input: PrescriptionInput
): Promise<PrescriptionResult> {
  try {
    // Validate required fields
    if (!input.patient_id || input.patient_id.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        prescription: null,
      };
    }

    if (!input.medication || input.medication.trim() === '') {
      return {
        success: false,
        error: 'Medication is required',
        prescription: null,
      };
    }

    if (!input.dosage || input.dosage.trim() === '') {
      return {
        success: false,
        error: 'Dosage is required',
        prescription: null,
      };
    }

    const client = getSupabaseClient();

    // Insert prescription
    // Status defaults to 'pending_physician_approval' per FR-26
    const { data, error } = await client
      .from('prescriptions')
      .insert({
        patient_id: input.patient_id,
        medication: input.medication,
        dosage: input.dosage,
        blocked: input.blocked,
        warnings: input.warnings,
        // status will default to 'pending_physician_approval' in database
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        prescription: null,
      };
    }

    return {
      success: true,
      error: null,
      prescription: data as Prescription,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescription: null,
    };
  }
}

/**
 * Find all prescriptions for a patient
 * @param {string} patientId - Patient UUID
 * @param {number} limit - Optional limit on number of prescriptions to return
 * @returns {Promise<PrescriptionsResult>} Prescriptions result
 */
export async function findPrescriptionsByPatient(
  patientId: string,
  limit?: number
): Promise<PrescriptionsResult> {
  try {
    // Validate input
    if (!patientId || patientId.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        prescriptions: null,
      };
    }

    const client = getSupabaseClient();

    let query = client
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
        prescriptions: null,
      };
    }

    return {
      success: true,
      error: null,
      prescriptions: data as Prescription[],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescriptions: null,
    };
  }
}

/**
 * Update prescription status
 * @param {string} prescriptionId - Prescription UUID
 * @param {string} status - New status
 * @returns {Promise<PrescriptionResult>} Updated prescription result
 */
export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: string
): Promise<PrescriptionResult> {
  try {
    // Validate input
    if (!prescriptionId || prescriptionId.trim() === '') {
      return {
        success: false,
        error: 'Prescription ID is required',
        prescription: null,
      };
    }

    if (!status || status.trim() === '') {
      return {
        success: false,
        error: 'Status is required',
        prescription: null,
      };
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('prescriptions')
      .update({ status })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        prescription: null,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Prescription not found',
        prescription: null,
      };
    }

    return {
      success: true,
      error: null,
      prescription: data as Prescription,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescription: null,
    };
  }
}
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/models/prescription.test.ts
```

**Expected Result**: All tests PASS ✅

If any tests fail, debug and fix until all pass.

### TDD Step 6: Commit Implementation

```bash
git add src/models/prescription.ts
git commit -m "[TDD] Implement Prescription model with audit trail

Implementation includes:
- Type definitions for Prescription, PrescriptionInput, PrescriptionWarning
- createPrescription with comprehensive validation
- Default status: pending_physician_approval (FR-26)
- Blocked prescriptions logged for audit (FR-23)
- JSONB warnings array for drug interaction/allergy alerts
- findPrescriptionsByPatient with optional pagination
- updatePrescriptionStatus for workflow management
- Comprehensive error handling and input validation

All tests PASSING ✅"
```

---

## Phase 3.1 Completion Checklist ✅

Before moving to Phase 3.2, verify:

- [ ] Supabase client implemented with singleton pattern
- [ ] Supabase client tests passing (10 tests)
- [ ] Patient model implemented with all query functions
- [ ] Patient model tests passing (25+ tests)
- [ ] **CRITICAL**: Sarah Chen Warfarin test passing
- [ ] Prescription model implemented
- [ ] Prescription model tests passing (20+ tests)
- [ ] All models handle errors gracefully
- [ ] All models validate inputs
- [ ] JSONB data parsed correctly
- [ ] All commits pushed to dev-3-backend branch

### Run Full Test Suite

```bash
# Run all model tests
npm run test:unit

# Should show:
# - Supabase: 10 tests passing
# - Patient: 25+ tests passing
# - Prescription: 20+ tests passing
# Total: 55+ tests passing
```

**Expected Output**:
```
Test Suites: 3 passed, 3 total
Tests:       55 passed, 55 total
Snapshots:   0 total
Time:        8.5s
```

### Update Railway with Latest Code

```bash
# Build and deploy
npm run build
railway up

# Verify deployment
railway domain
curl https://your-railway-url.up.railway.app/health
```

---

## Verification Checklist

### Phase 3.0 Verification
- [ ] Node.js project initialized
- [ ] All dependencies installed
- [ ] TypeScript configured with strict mode
- [ ] Jest configured for testing
- [ ] ESLint configured
- [ ] Express server running locally
- [ ] Railway account created
- [ ] Railway CLI installed and authenticated
- [ ] Backend deployed to Railway
- [ ] Health check endpoint working on Railway
- [ ] Railway URL shared with Dev 1 & 2
- [ ] Environment variables configured (.env and Railway)
- [ ] README updated with setup instructions

### Phase 3.1 Verification
- [ ] Received Supabase credentials from Dev 4
- [ ] Supabase credentials added to .env
- [ ] Supabase credentials added to Railway
- [ ] Supabase client implemented
- [ ] Supabase connection test passing
- [ ] Patient model implemented
- [ ] All patient queries working
- [ ] Sarah Chen found in database
- [ ] **CRITICAL**: Sarah Chen has Warfarin medication
- [ ] Prescription model implemented
- [ ] Prescription CRUD operations working
- [ ] All tests passing (55+ tests)
- [ ] Code committed and pushed

---

## Troubleshooting Guide

### Issue: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --showConfig

# Compile with verbose errors
npx tsc --noEmit
```

### Issue: Jest tests not finding modules

**Solution**:
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Supabase connection failing

**Solution**:
1. Verify .env has correct credentials
2. Check Supabase project is active (not paused)
3. Test connection manually:
```bash
# Run connection test
npm test tests/unit/db/supabase.test.ts -- -t "testConnection"
```

### Issue: Railway deployment failing

**Solution**:
```bash
# Check Railway logs
railway logs

# Verify environment variables
railway variables

# Try manual deploy
railway up --detach
```

### Issue: Sarah Chen not found in database

**Solution**:
```bash
# Verify with Dev 4 that seed data is loaded
# Test query directly:
npm test tests/unit/models/patient.test.ts -- -t "Sarah Chen"
```

### Issue: Tests failing with timeout

**Solution**:
```bash
# Increase timeout in jest.config.js
# testTimeout: 15000

# Or run with increased timeout
npm test -- --testTimeout=15000
```

### Issue: Warfarin test failing

**Solution**:
This is CRITICAL. Contact Dev 4 immediately.
```bash
# Verify Sarah Chen's medications
npm test tests/unit/models/patient.test.ts -- -t "Warfarin"

# If failing, Dev 4 needs to re-run seed script
```

---

## Next Steps (Phase 3.2+)

After completing Phase 3.0 and 3.1, you will move to:

**Phase 3.2: External Service Integration (Hours 12-18)**
- Gemini Service - TDD
- Letta Context Service - TDD
- Fish Audio TTS Service - TDD
- Response Cache - TDD

**Phase 3.3: Drug Interaction Service - TDD (Hours 18-24)**
- Drug database with 8 medications
- Drug interaction checking
- Allergy checking
- Alternative medication suggestions

Continue following strict TDD for all remaining tasks.

---

## Time Estimates

| Task | Estimated Time | Actual Time |
|------|---------------|-------------|
| Phase 3.0: Backend Setup | 3-4 hours | _____ hours |
| Task 3.1: Supabase Client | 1 hour | _____ hours |
| Task 3.2: Patient Model | 1.5 hours | _____ hours |
| Task 3.3: Prescription Model | 1 hour | _____ hours |
| **Total** | **6.5-7.5 hours** | **_____ hours** |

**Target Completion**: Hour 12
**Critical Deadline**: Hour 12 (for API endpoint development to begin)

---

## Success Criteria

✅ Phase 3.0 + 3.1 Complete When:
1. Backend server deployed to Railway
2. Health check endpoint accessible
3. Supabase client working
4. Patient model with all queries functional
5. Prescription model with all queries functional
6. **55+ tests passing**
7. **Sarah Chen with Warfarin verified**
8. Code committed and pushed
9. Railway URL shared with team

**You are now ready to proceed to Phase 3.2: External Service Integration!**
