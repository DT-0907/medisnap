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

