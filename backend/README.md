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

