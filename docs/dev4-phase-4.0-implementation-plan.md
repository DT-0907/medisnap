# Dev 4 - Phase 4.0 Implementation Plan
## Database Schema & Seed Data Setup (Hours 0-6)

**Timeline**: Hours 0-6  
**Critical Handoff**: Hour 6 to Dev 3 (Supabase credentials + schema)  
**Branch**: CV  
**Methodology**: Test-Driven Development (TDD)

---

## Overview

This phase establishes the foundational data layer for MedSnap:
1. Set up Supabase PostgreSQL database
2. Create database schema matching PRD FR-37
3. Generate mock patient data (3-5 patients, including Sarah Chen with Warfarin)
4. Seed database with test data
5. Validate data integrity and accessibility

**Critical Success Criteria**:
- ✅ Sarah Chen patient has Warfarin medication (required for drug interaction demo)
- ✅ Schema matches PRD FR-37 exactly (JSONB for medications/diagnosis, TEXT[] for allergies)
- ✅ All 3+ patients load successfully
- ✅ Dev 3 can access Supabase with provided credentials by Hour 6

---

## Phase 4.0: Environment Setup

### Task 4.0.1: Set Up Supabase Project

**Estimated Time**: 30 minutes

#### Steps:
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Configure project:
   - **Name**: `medisnap-db`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your location (e.g., US East)
   - **Plan**: Free tier (sufficient for hackathon)
5. Wait for project provisioning (~2 minutes)

#### Obtain Credentials:
1. Navigate to Project Settings → API
2. Copy the following to secure location:
   - **Project URL** (`SUPABASE_URL`): `https://[project-ref].supabase.co`
   - **anon/public key** (`SUPABASE_KEY`): `eyJ...` (long JWT token)
   - **Database connection string**: For direct psql access

#### Create `.env` File:
```bash
# Create backend/.env
cat > backend/.env << EOF
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_KEY=eyJ[your-anon-key]
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DEMO_MODE=false
PORT=3000
EOF
```

#### Verify Connection:
```bash
# Test connection using psql (optional but recommended)
psql "$SUPABASE_DB_URL" -c "SELECT version();"
```

**Commit Checkpoint**: None yet (credentials are in .env, not committed)

---

### Task 4.0.2: Create Database Schema (TDD)

**Estimated Time**: 1 hour

#### Step 1: Write Schema Validation Tests FIRST

Create `backend/tests/unit/db/schema.test.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

describe('Database Schema Validation', () => {
  describe('patients table', () => {
    it('should exist with correct structure', async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have UUID primary key with default generator', async () => {
      // Query information_schema to verify column definition
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'id'
      });
      
      expect(error).toBeNull();
      expect(data.data_type).toBe('uuid');
      expect(data.column_default).toContain('uuid_generate_v4');
    });

    it('should have medications as JSONB type (not TEXT[])', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'medications'
      });
      
      expect(data.data_type).toBe('jsonb');
    });

    it('should have allergies as TEXT[] array type', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'allergies'
      });
      
      expect(data.data_type).toBe('ARRAY');
    });

    it('should have diagnosis_history as JSONB type', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'diagnosis_history'
      });
      
      expect(data.data_type).toBe('jsonb');
    });

    it('should have vital_signs as JSONB type', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'vital_signs'
      });
      
      expect(data.data_type).toBe('jsonb');
    });

    it('should have NOT NULL constraints on required fields', async () => {
      const { data: nameInfo } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'name'
      });
      const { data: ageInfo } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'age'
      });
      
      expect(nameInfo.is_nullable).toBe('NO');
      expect(ageInfo.is_nullable).toBe('NO');
    });
  });

  describe('visits table', () => {
    it('should exist with foreign key to patients', async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
    });

    it('should have patient_id foreign key constraint', async () => {
      const { data } = await supabase.rpc('get_foreign_keys', {
        table_name: 'visits'
      });
      
      expect(data).toContainEqual(
        expect.objectContaining({
          column_name: 'patient_id',
          foreign_table_name: 'patients'
        })
      );
    });
  });

  describe('prescriptions table', () => {
    it('should exist with foreign key to patients', async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
    });

    it('should have default status of pending_physician_approval', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'status'
      });
      
      expect(data.column_default).toContain('pending_physician_approval');
    });

    it('should have blocked as BOOLEAN with default FALSE', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'blocked'
      });
      
      expect(data.data_type).toBe('boolean');
      expect(data.column_default).toBe('false');
    });

    it('should have warnings as JSONB type', async () => {
      const { data } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'warnings'
      });
      
      expect(data.data_type).toBe('jsonb');
    });
  });
});
```

#### Step 2: Create Helper RPC Functions for Tests

Create `backend/db/test-helpers.sql`:

```sql
-- Helper function to get column information
CREATE OR REPLACE FUNCTION get_column_info(table_name text, column_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = get_column_info.table_name
    AND c.column_name = get_column_info.column_name;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get foreign key information
CREATE OR REPLACE FUNCTION get_foreign_keys(table_name text)
RETURNS TABLE (
  column_name text,
  foreign_table_name text,
  foreign_column_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kcu.column_name::text,
    ccu.table_name::text,
    ccu.column_name::text
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = get_foreign_keys.table_name;
END;
$$ LANGUAGE plpgsql;
```

Apply test helpers:
```bash
psql "$SUPABASE_DB_URL" -f backend/db/test-helpers.sql
```

#### Step 3: Run Tests (Confirm They FAIL)

```bash
cd backend
npm install --save-dev jest ts-jest @types/jest @supabase/supabase-js dotenv
npx jest tests/unit/db/schema.test.ts
```

**Expected Result**: All tests should FAIL (tables don't exist yet)

#### Step 4: COMMIT TESTS

```bash
git add backend/tests/unit/db/schema.test.ts
git add backend/db/test-helpers.sql
git commit -m "[TDD] Add database schema validation tests"
```

---

### Task 4.0.3: Create Schema SQL File

**Estimated Time**: 30 minutes

Create `backend/db/schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ============================================
-- PATIENTS TABLE (Core patient data)
-- PRD Reference: FR-37
-- ============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL,
  chief_complaint TEXT,
  current_symptoms TEXT[],
  vital_signs JSONB, -- {bp: "118/76", hr: 88, o2: 97, temp: 101.5}
  allergies TEXT[] NOT NULL DEFAULT '{}',
  medications JSONB NOT NULL DEFAULT '[]', -- [{name: "Warfarin", dosage: "5mg daily", started: "2024-03-01"}]
  diagnosis_history JSONB NOT NULL DEFAULT '[]', -- [{date: "2024-10-01", diagnosis: "...", provider: "..."}]
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for name lookups (case-insensitive)
CREATE INDEX idx_patients_name ON patients (LOWER(name));

-- Create index for JSONB medication searches
CREATE INDEX idx_patients_medications ON patients USING GIN (medications);

-- ============================================
-- VISITS TABLE (Assessment records)
-- PRD Reference: FR-37
-- ============================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  symptoms_recorded TEXT[],
  notes TEXT
);

-- Create index for patient lookups
CREATE INDEX idx_visits_patient_id ON visits (patient_id);

-- ============================================
-- PRESCRIPTIONS TABLE (Medication orders)
-- PRD Reference: FR-25, FR-26, FR-26a
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  status TEXT DEFAULT 'pending_physician_approval', -- FR-26: All prescriptions pending approval
  created_at TIMESTAMP DEFAULT NOW(),
  blocked BOOLEAN DEFAULT FALSE, -- TRUE if drug interaction/allergy blocks prescription
  warnings JSONB DEFAULT '[]' -- [{type: "drug_interaction", severity: "HIGH", message: "..."}]
);

-- Create index for patient prescription lookups
CREATE INDEX idx_prescriptions_patient_id ON prescriptions (patient_id);

-- Create index for prescription status
CREATE INDEX idx_prescriptions_status ON prescriptions (status);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE patients IS 'Core patient demographic and medical data. Medications and diagnosis use JSONB for nested structures per PRD FR-37.';
COMMENT ON COLUMN patients.medications IS 'JSONB array of medication objects: [{name, dosage, started}]. CRITICAL: Sarah Chen must have Warfarin for demo.';
COMMENT ON COLUMN patients.allergies IS 'TEXT[] array for simple allergy list. Used in prescription safety checks.';
COMMENT ON COLUMN patients.diagnosis_history IS 'JSONB array of diagnosis objects: [{date, diagnosis, provider}]. Shows last 3 in UI.';
COMMENT ON TABLE prescriptions IS 'Medication orders with safety validation. All prescriptions have status pending_physician_approval per FR-26a.';
```

---

### Task 4.0.4: Apply Schema to Supabase

**Estimated Time**: 15 minutes

#### Method 1: Supabase SQL Editor (Recommended for first time)
1. Open Supabase dashboard
2. Navigate to SQL Editor
3. Copy contents of `backend/db/schema.sql`
4. Click "Run" button
5. Verify success message

#### Method 2: Command Line (psql)
```bash
psql "$SUPABASE_DB_URL" -f backend/db/schema.sql
```

#### Verify Schema Creation:
```bash
# List all tables
psql "$SUPABASE_DB_URL" -c "\dt"

# Describe patients table structure
psql "$SUPABASE_DB_URL" -c "\d patients"

# Verify indexes
psql "$SUPABASE_DB_URL" -c "\di"
```

#### Step 5: Run Tests Again (Should PASS Now)

```bash
npx jest tests/unit/db/schema.test.ts
```

**Expected Result**: All schema validation tests should PASS

#### Step 6: COMMIT IMPLEMENTATION

```bash
git add backend/db/schema.sql
git commit -m "[TDD] Implement database schema per PRD FR-37"
```

---

### Task 4.0.5: Share Credentials with Dev 3

**Estimated Time**: 10 minutes

Create `backend/.env.example`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# External API Keys (to be obtained)
GEMINI_API_KEY=your-gemini-key-here
FISH_AUDIO_API_KEY=your-fish-audio-key-here
LETTA_API_KEY=your-letta-key-here

# Server Configuration
PORT=3000
DEMO_MODE=false
```

**Communication to Dev 3**:
```
Subject: [Hour 6 Handoff] Supabase Credentials Ready

Dev 3,

Database setup complete! Here are your credentials:

SUPABASE_URL: https://[actual-url].supabase.co
SUPABASE_KEY: [actual-anon-key]

Schema includes:
- patients table (with JSONB for medications/diagnosis)
- visits table
- prescriptions table

All tables are indexed and ready for queries.

See backend/db/schema.sql for full structure.
See backend/.env.example for environment setup.

Next steps for you:
1. Copy credentials to your backend/.env
2. Install @supabase/supabase-js
3. Create src/db/supabase.ts client wrapper

Let me know if you need any schema changes!

- Dev 4
```

---

## Phase 4.1: Mock Patient Data Creation

### Task 4.1.1 - 4.1.2: Create patients.json with Sarah Chen

**Estimated Time**: 1 hour

#### Step 1: Write Data Validation Tests FIRST

Create `backend/tests/unit/data/patients.test.ts`:

```typescript
import patients from '../../../data/patients.json';

describe('Patient Mock Data Validation', () => {
  it('should have at least 3 patients', () => {
    expect(patients.length).toBeGreaterThanOrEqual(3);
  });

  it('should have at most 5 patients (per FR-38)', () => {
    expect(patients.length).toBeLessThanOrEqual(5);
  });

  describe('Sarah Chen patient (CRITICAL for demo)', () => {
    let sarahChen: any;

    beforeAll(() => {
      sarahChen = patients.find(p => p.name === 'Sarah Chen');
    });

    it('should exist in dataset', () => {
      expect(sarahChen).toBeDefined();
    });

    it('should have correct demographics', () => {
      expect(sarahChen.name).toBe('Sarah Chen');
      expect(sarahChen.age).toBe(34);
      expect(sarahChen.sex).toBe('Female');
    });

    it('should have chief complaint', () => {
      expect(sarahChen.chief_complaint).toBe('Persistent cough and fever');
    });

    it('should have current symptoms array', () => {
      expect(sarahChen.current_symptoms).toEqual([
        'fever',
        'cough',
        'fatigue',
        'chest tightness'
      ]);
    });

    it('should have vital signs object', () => {
      expect(sarahChen.vital_signs).toEqual({
        bp: '118/76',
        hr: 88,
        o2: 97,
        temp: 101.5
      });
    });

    it('should have Penicillin allergy', () => {
      expect(sarahChen.allergies).toContain('Penicillin');
    });

    it('CRITICAL: should have Warfarin medication for drug interaction demo', () => {
      const warfarin = sarahChen.medications.find(
        (m: any) => m.name === 'Warfarin'
      );
      
      expect(warfarin).toBeDefined();
      expect(warfarin.dosage).toBe('5mg daily');
      expect(warfarin.started).toBe('2024-03-01');
    });

    it('should have Loratadine as second medication', () => {
      const loratadine = sarahChen.medications.find(
        (m: any) => m.name === 'Loratadine'
      );
      
      expect(loratadine).toBeDefined();
      expect(loratadine.dosage).toBe('10mg daily');
    });

    it('should have diagnosis history with 3 entries', () => {
      expect(sarahChen.diagnosis_history).toHaveLength(3);
      
      // Most recent: Seasonal allergies
      expect(sarahChen.diagnosis_history[0]).toEqual({
        date: '2024-10-01',
        diagnosis: 'Seasonal allergies',
        provider: 'Dr. Smith'
      });
      
      // Second: Annual checkup
      expect(sarahChen.diagnosis_history[1]).toEqual({
        date: '2024-08-15',
        diagnosis: 'Annual checkup - healthy',
        provider: 'Dr. Smith'
      });
      
      // Oldest: Atrial fibrillation (explains Warfarin)
      expect(sarahChen.diagnosis_history[2]).toEqual({
        date: '2024-03-01',
        diagnosis: 'Atrial fibrillation',
        provider: 'Dr. Lee'
      });
    });
  });

  describe('All patients data integrity', () => {
    it('should have required fields for all patients', () => {
      patients.forEach(patient => {
        expect(patient.name).toBeDefined();
        expect(patient.age).toBeGreaterThan(0);
        expect(patient.sex).toMatch(/^(Male|Female|Other)$/);
        expect(patient.allergies).toBeInstanceOf(Array);
        expect(patient.medications).toBeInstanceOf(Array);
        expect(patient.diagnosis_history).toBeInstanceOf(Array);
      });
    });

    it('should have valid medication structure', () => {
      patients.forEach(patient => {
        patient.medications.forEach((med: any) => {
          expect(med.name).toBeDefined();
          expect(med.dosage).toBeDefined();
          expect(med.started).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      });
    });

    it('should have valid diagnosis history structure', () => {
      patients.forEach(patient => {
        patient.diagnosis_history.forEach((dx: any) => {
          expect(dx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(dx.diagnosis).toBeDefined();
          expect(dx.provider).toBeDefined();
        });
      });
    });

    it('should have diverse patient profiles', () => {
      const ages = patients.map(p => p.age);
      const uniqueAges = new Set(ages);
      
      // At least 2 different age groups
      expect(uniqueAges.size).toBeGreaterThanOrEqual(2);
      
      // Mix of male and female
      const sexes = patients.map(p => p.sex);
      expect(sexes).toContain('Male');
      expect(sexes).toContain('Female');
    });
  });
});
```

#### Step 2: Run Tests (Confirm They FAIL)

```bash
npx jest tests/unit/data/patients.test.ts
```

**Expected Result**: Tests fail (patients.json doesn't exist yet)

#### Step 3: COMMIT TESTS

```bash
git add backend/tests/unit/data/patients.test.ts
git commit -m "[TDD] Add patient mock data validation tests"
```

#### Step 4: Create patients.json

Create `backend/data/patients.json`:

```json
[
  {
    "name": "Sarah Chen",
    "age": 34,
    "sex": "Female",
    "chief_complaint": "Persistent cough and fever",
    "current_symptoms": ["fever", "cough", "fatigue", "chest tightness"],
    "vital_signs": {
      "bp": "118/76",
      "hr": 88,
      "o2": 97,
      "temp": 101.5
    },
    "allergies": ["Penicillin"],
    "medications": [
      {
        "name": "Warfarin",
        "dosage": "5mg daily",
        "started": "2024-03-01"
      },
      {
        "name": "Loratadine",
        "dosage": "10mg daily",
        "started": "2024-01-15"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-10-01",
        "diagnosis": "Seasonal allergies",
        "provider": "Dr. Smith"
      },
      {
        "date": "2024-08-15",
        "diagnosis": "Annual checkup - healthy",
        "provider": "Dr. Smith"
      },
      {
        "date": "2024-03-01",
        "diagnosis": "Atrial fibrillation",
        "provider": "Dr. Lee"
      }
    ]
  },
  {
    "name": "Robert Martinez",
    "age": 58,
    "sex": "Male",
    "chief_complaint": "Routine checkup",
    "current_symptoms": [],
    "vital_signs": {
      "bp": "148/94",
      "hr": 76,
      "o2": 99,
      "temp": 98.4
    },
    "allergies": [],
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg daily",
        "started": "2023-06-10"
      },
      {
        "name": "Metformin",
        "dosage": "500mg twice daily",
        "started": "2023-06-10"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-09-20",
        "diagnosis": "Hypertension (controlled)",
        "provider": "Dr. Johnson"
      },
      {
        "date": "2024-09-20",
        "diagnosis": "Type 2 Diabetes (controlled)",
        "provider": "Dr. Johnson"
      },
      {
        "date": "2024-07-10",
        "diagnosis": "Routine medication check",
        "provider": "Dr. Johnson"
      }
    ]
  },
  {
    "name": "Emily Watson",
    "age": 45,
    "sex": "Female",
    "chief_complaint": "Joint pain",
    "current_symptoms": ["joint pain", "stiffness"],
    "vital_signs": {
      "bp": "125/80",
      "hr": 72,
      "o2": 98,
      "temp": 98.6
    },
    "allergies": ["Sulfa drugs"],
    "medications": [
      {
        "name": "Metoprolol",
        "dosage": "50mg twice daily",
        "started": "2024-03-01"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-03-01",
        "diagnosis": "Atrial fibrillation",
        "provider": "Dr. Lee"
      },
      {
        "date": "2024-01-15",
        "diagnosis": "Deep vein thrombosis (resolved)",
        "provider": "Dr. Lee"
      }
    ]
  },
  {
    "name": "Michael Okonkwo",
    "age": 29,
    "sex": "Male",
    "chief_complaint": "Migraine headaches",
    "current_symptoms": ["headache", "nausea", "light sensitivity"],
    "vital_signs": {
      "bp": "120/78",
      "hr": 68,
      "o2": 99,
      "temp": 98.2
    },
    "allergies": ["Aspirin"],
    "medications": [
      {
        "name": "Sumatriptan",
        "dosage": "50mg as needed",
        "started": "2024-05-20"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-05-20",
        "diagnosis": "Chronic migraines",
        "provider": "Dr. Patel"
      },
      {
        "date": "2024-02-10",
        "diagnosis": "Tension headaches",
        "provider": "Dr. Patel"
      }
    ]
  },
  {
    "name": "Linda Thompson",
    "age": 67,
    "sex": "Female",
    "chief_complaint": "Shortness of breath",
    "current_symptoms": ["shortness of breath", "fatigue", "ankle swelling"],
    "vital_signs": {
      "bp": "135/88",
      "hr": 82,
      "o2": 94,
      "temp": 98.8
    },
    "allergies": [],
    "medications": [
      {
        "name": "Furosemide",
        "dosage": "40mg daily",
        "started": "2023-11-15"
      },
      {
        "name": "Lisinopril",
        "dosage": "20mg daily",
        "started": "2023-11-15"
      },
      {
        "name": "Metoprolol",
        "dosage": "25mg twice daily",
        "started": "2023-11-15"
      }
    ],
    "diagnosis_history": [
      {
        "date": "2024-08-10",
        "diagnosis": "Congestive heart failure (stable)",
        "provider": "Dr. Williams"
      },
      {
        "date": "2024-05-05",
        "diagnosis": "Fluid retention",
        "provider": "Dr. Williams"
      },
      {
        "date": "2023-11-15",
        "diagnosis": "Congestive heart failure (initial diagnosis)",
        "provider": "Dr. Williams"
      }
    ]
  }
]
```

#### Step 5: Run Tests (Should PASS)

```bash
npx jest tests/unit/data/patients.test.ts
```

**Expected Result**: All patient data validation tests pass

#### Step 6: COMMIT IMPLEMENTATION

```bash
git add backend/data/patients.json
git commit -m "[TDD] Implement patient mock data with Sarah Chen (Warfarin)"
```

---

### Task 4.1.4: Create Seed Script

**Estimated Time**: 45 minutes

#### Create `backend/db/seed.sql`:

```sql
-- ============================================
-- SEED SCRIPT FOR MEDISNAP PATIENT DATA
-- ============================================

-- Clear existing data
TRUNCATE TABLE prescriptions CASCADE;
TRUNCATE TABLE visits CASCADE;
TRUNCATE TABLE patients CASCADE;

-- ============================================
-- PATIENT 1: Sarah Chen (CRITICAL - Drug Interaction Demo)
-- ============================================
INSERT INTO patients (
  name, age, sex, chief_complaint, current_symptoms, vital_signs,
  allergies, medications, diagnosis_history
) VALUES (
  'Sarah Chen',
  34,
  'Female',
  'Persistent cough and fever',
  ARRAY['fever', 'cough', 'fatigue', 'chest tightness'],
  '{"bp": "118/76", "hr": 88, "o2": 97, "temp": 101.5}'::jsonb,
  ARRAY['Penicillin'],
  '[
    {"name": "Warfarin", "dosage": "5mg daily", "started": "2024-03-01"},
    {"name": "Loratadine", "dosage": "10mg daily", "started": "2024-01-15"}
  ]'::jsonb,
  '[
    {"date": "2024-10-01", "diagnosis": "Seasonal allergies", "provider": "Dr. Smith"},
    {"date": "2024-08-15", "diagnosis": "Annual checkup - healthy", "provider": "Dr. Smith"},
    {"date": "2024-03-01", "diagnosis": "Atrial fibrillation", "provider": "Dr. Lee"}
  ]'::jsonb
);

-- ============================================
-- PATIENT 2: Robert Martinez (Hypertension Demo)
-- ============================================
INSERT INTO patients (
  name, age, sex, chief_complaint, current_symptoms, vital_signs,
  allergies, medications, diagnosis_history
) VALUES (
  'Robert Martinez',
  58,
  'Male',
  'Routine checkup',
  ARRAY[]::text[],
  '{"bp": "148/94", "hr": 76, "o2": 99, "temp": 98.4}'::jsonb,
  ARRAY[]::text[],
  '[
    {"name": "Lisinopril", "dosage": "10mg daily", "started": "2023-06-10"},
    {"name": "Metformin", "dosage": "500mg twice daily", "started": "2023-06-10"}
  ]'::jsonb,
  '[
    {"date": "2024-09-20", "diagnosis": "Hypertension (controlled)", "provider": "Dr. Johnson"},
    {"date": "2024-09-20", "diagnosis": "Type 2 Diabetes (controlled)", "provider": "Dr. Johnson"},
    {"date": "2024-07-10", "diagnosis": "Routine medication check", "provider": "Dr. Johnson"}
  ]'::jsonb
);

-- ============================================
-- PATIENT 3: Emily Watson (Allergy Demo)
-- ============================================
INSERT INTO patients (
  name, age, sex, chief_complaint, current_symptoms, vital_signs,
  allergies, medications, diagnosis_history
) VALUES (
  'Emily Watson',
  45,
  'Female',
  'Joint pain',
  ARRAY['joint pain', 'stiffness'],
  '{"bp": "125/80", "hr": 72, "o2": 98, "temp": 98.6}'::jsonb,
  ARRAY['Sulfa drugs'],
  '[
    {"name": "Metoprolol", "dosage": "50mg twice daily", "started": "2024-03-01"}
  ]'::jsonb,
  '[
    {"date": "2024-03-01", "diagnosis": "Atrial fibrillation", "provider": "Dr. Lee"},
    {"date": "2024-01-15", "diagnosis": "Deep vein thrombosis (resolved)", "provider": "Dr. Lee"}
  ]'::jsonb
);

-- ============================================
-- PATIENT 4: Michael Okonkwo (Diverse Demographics)
-- ============================================
INSERT INTO patients (
  name, age, sex, chief_complaint, current_symptoms, vital_signs,
  allergies, medications, diagnosis_history
) VALUES (
  'Michael Okonkwo',
  29,
  'Male',
  'Migraine headaches',
  ARRAY['headache', 'nausea', 'light sensitivity'],
  '{"bp": "120/78", "hr": 68, "o2": 99, "temp": 98.2}'::jsonb,
  ARRAY['Aspirin'],
  '[
    {"name": "Sumatriptan", "dosage": "50mg as needed", "started": "2024-05-20"}
  ]'::jsonb,
  '[
    {"date": "2024-05-20", "diagnosis": "Chronic migraines", "provider": "Dr. Patel"},
    {"date": "2024-02-10", "diagnosis": "Tension headaches", "provider": "Dr. Patel"}
  ]'::jsonb
);

-- ============================================
-- PATIENT 5: Linda Thompson (Complex Medical History)
-- ============================================
INSERT INTO patients (
  name, age, sex, chief_complaint, current_symptoms, vital_signs,
  allergies, medications, diagnosis_history
) VALUES (
  'Linda Thompson',
  67,
  'Female',
  'Shortness of breath',
  ARRAY['shortness of breath', 'fatigue', 'ankle swelling'],
  '{"bp": "135/88", "hr": 82, "o2": 94, "temp": 98.8}'::jsonb,
  ARRAY[]::text[],
  '[
    {"name": "Furosemide", "dosage": "40mg daily", "started": "2023-11-15"},
    {"name": "Lisinopril", "dosage": "20mg daily", "started": "2023-11-15"},
    {"name": "Metoprolol", "dosage": "25mg twice daily", "started": "2023-11-15"}
  ]'::jsonb,
  '[
    {"date": "2024-08-10", "diagnosis": "Congestive heart failure (stable)", "provider": "Dr. Williams"},
    {"date": "2024-05-05", "diagnosis": "Fluid retention", "provider": "Dr. Williams"},
    {"date": "2023-11-15", "diagnosis": "Congestive heart failure (initial diagnosis)", "provider": "Dr. Williams"}
  ]'::jsonb
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all 5 patients inserted
SELECT COUNT(*) as patient_count FROM patients;

-- Verify Sarah Chen has Warfarin (CRITICAL)
SELECT 
  name,
  medications->0->>'name' as first_medication
FROM patients
WHERE name = 'Sarah Chen';

-- Show all patients summary
SELECT 
  name,
  age,
  sex,
  chief_complaint,
  array_length(allergies, 1) as allergy_count,
  jsonb_array_length(medications) as medication_count
FROM patients
ORDER BY name;
```

---

### Task 4.1.5: Run Seed Script

**Estimated Time**: 15 minutes

```bash
# Run seed script
psql "$SUPABASE_DB_URL" -f backend/db/seed.sql

# Or via Supabase SQL Editor (copy/paste seed.sql)
```

**Expected Output**:
```
TRUNCATE TABLE
TRUNCATE TABLE
TRUNCATE TABLE
INSERT 0 1
INSERT 0 1
INSERT 0 1
INSERT 0 1
INSERT 0 1
 patient_count 
---------------
             5

     name     | first_medication 
--------------+------------------
 Sarah Chen   | Warfarin
```

---

### Task 4.1.6: Verify Sarah Chen Data

**Estimated Time**: 10 minutes

Create `backend/tests/integration/database-seed.test.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

describe('Database Seed Verification', () => {
  it('should have exactly 5 patients seeded', async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id');
    
    expect(error).toBeNull();
    expect(data).toHaveLength(5);
  });

  describe('Sarah Chen verification (CRITICAL)', () => {
    let sarahChen: any;

    beforeAll(async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', 'Sarah Chen')
        .single();
      
      expect(error).toBeNull();
      sarahChen = data;
    });

    it('should exist in database', () => {
      expect(sarahChen).toBeDefined();
      expect(sarahChen.name).toBe('Sarah Chen');
    });

    it('CRITICAL: should have Warfarin medication', () => {
      const medications = sarahChen.medications;
      const warfarin = medications.find((m: any) => m.name === 'Warfarin');
      
      expect(warfarin).toBeDefined();
      expect(warfarin.dosage).toBe('5mg daily');
    });

    it('should have correct vital signs structure', () => {
      expect(sarahChen.vital_signs).toEqual({
        bp: '118/76',
        hr: 88,
        o2: 97,
        temp: 101.5
      });
    });

    it('should have Penicillin allergy', () => {
      expect(sarahChen.allergies).toContain('Penicillin');
    });

    it('should have 3 diagnosis history entries', () => {
      expect(sarahChen.diagnosis_history).toHaveLength(3);
    });
  });

  it('should have diverse patient ages', async () => {
    const { data } = await supabase
      .from('patients')
      .select('age');
    
    const ages = data!.map(p => p.age);
    const uniqueAges = new Set(ages);
    
    expect(uniqueAges.size).toBeGreaterThanOrEqual(4);
  });

  it('should have both male and female patients', async () => {
    const { data } = await supabase
      .from('patients')
      .select('sex');
    
    const sexes = data!.map(p => p.sex);
    
    expect(sexes).toContain('Male');
    expect(sexes).toContain('Female');
  });
});
```

Run verification tests:
```bash
npx jest tests/integration/database-seed.test.ts
```

**All tests should PASS** ✅

---

### Task 4.1.7: Final Commit

```bash
git add backend/db/seed.sql
git add backend/tests/integration/database-seed.test.ts
git commit -m "[TDD] Add database seed script with 5 patients (Sarah Chen verified)"
```

---

## Phase 4.0 Completion Checklist

### Before Hour 6 Handoff:

- [ ] Supabase project created and accessible
- [ ] Schema tests written and passing
- [ ] `backend/db/schema.sql` created with exact PRD FR-37 structure
- [ ] Schema applied to Supabase (all 3 tables exist)
- [ ] Helper RPC functions installed for testing
- [ ] Patient data validation tests written and passing
- [ ] `backend/data/patients.json` created with 5 patients
- [ ] Sarah Chen has Warfarin medication (**CRITICAL**)
- [ ] Seed script created and executed
- [ ] Database seed verification tests passing
- [ ] `.env.example` created
- [ ] Credentials shared with Dev 3
- [ ] All commits pushed to CV branch

### Test Coverage Summary:
```bash
# Run all Phase 4.0 tests
npx jest tests/unit/db/schema.test.ts
npx jest tests/unit/data/patients.test.ts
npx jest tests/integration/database-seed.test.ts

# Expected: 100% pass rate
```

### Documentation:
- [ ] Schema documented with SQL comments
- [ ] README updated with database setup instructions
- [ ] Handoff message sent to Dev 3

---

## Troubleshooting Guide

### Issue: Schema tests fail with "relation does not exist"
**Solution**: Ensure schema.sql has been applied to Supabase. Re-run:
```bash
psql "$SUPABASE_DB_URL" -f backend/db/schema.sql
```

### Issue: Seed script fails with JSONB syntax errors
**Solution**: Verify JSONB strings are properly escaped and cast with `::jsonb`

### Issue: Sarah Chen missing Warfarin in database
**Solution**: Re-run seed script. Verify with:
```sql
SELECT medications FROM patients WHERE name = 'Sarah Chen';
```

### Issue: Can't connect to Supabase
**Solution**: 
1. Check `.env` credentials are correct
2. Verify Supabase project is active (not paused)
3. Check network/firewall settings

---

## Next Phase Preview

**Phase 4.2: Computer Vision Pipeline (Hours 6-18)**
- Set up cv-pipeline/ TypeScript project
- Integrate MediaPipe Hands v0.9+
- Implement wrist detection with radial pulse point
- Implement vital sign OCR with retry logic
- Handoff to Dev 1 by Hour 24

**Estimated completion time for Phase 4.0**: 5-6 hours (within Hour 6 deadline) ✅

