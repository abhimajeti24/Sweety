-- Which doctor may read which patient's reports (bonus B5). Assignments are made by the seed only.

CREATE TABLE doctor_patients (
  doctor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (doctor_id, patient_id),
  CHECK (doctor_id <> patient_id)
);
-- The primary key already serves "patients of a doctor"; this one serves "doctors of a patient".
CREATE INDEX doctor_patients_patient_idx ON doctor_patients (patient_id);
