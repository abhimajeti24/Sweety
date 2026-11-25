// The demo accounts the seed script creates. The seed and the login page both read this list,
// so the credentials shown to someone trying the app always match the ones in the database.
// Demo-only credentials for seeded test data, not secrets.

export const DEMO_PASSWORD = 'SweetyDemo#2026';

export const DEMO_ACCOUNTS = Object.freeze([
  {
    key: 'demo',
    name: 'Demo Patient',
    email: 'demo@sweety.test',
    role: 'patient',
    summary: 'Patient: two months of readings, 2 of 4 logged today',
  },
  {
    key: 'ravi',
    name: 'Ravi Kumar',
    email: 'ravi@sweety.test',
    role: 'patient',
    summary: 'Patient: one week of readings, no doctor',
  },
  {
    key: 'doctor',
    name: 'Dr. Meera Rao',
    email: 'doctor@sweety.test',
    role: 'doctor',
    summary: 'Doctor: read-only reports of Demo Patient',
  },
]);
