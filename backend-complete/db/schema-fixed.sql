-- ============================================
-- MEDISNAP DATABASE SCHEMA - CORRECTED
-- PRD Reference: FR-37 COMPLIANT
-- ============================================

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
-- PRD Reference: FR-37 - CORRECTED TO MATCH PRD
-- ============================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  chief_complaint TEXT,           -- ADDED: Required by PRD FR-37
  symptoms TEXT[],                -- FIXED: Was "symptoms_recorded", PRD says "symptoms"
  vital_signs JSONB,              -- ADDED: Required by PRD FR-37
  notes TEXT,
  prescriptions JSONB DEFAULT '[]' -- ADDED: Required by PRD FR-37
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
COMMENT ON TABLE visits IS 'Visit/assessment records per PRD FR-37. Contains chief_complaint, symptoms, vital_signs, and prescriptions for each visit.';
COMMENT ON TABLE prescriptions IS 'Medication orders with safety validation. All prescriptions have status pending_physician_approval per FR-26a.';

