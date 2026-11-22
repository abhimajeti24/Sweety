// Domain constants and user-facing messages shared by client and server, so both sides
// enforce the same rules and show exactly the same words.

/** Time slots in display order. The Postgres enum is declared in this same order. */
export const SLOTS = [
  { key: 'morning_fasting', label: 'Morning (fasting)' },
  { key: 'after_breakfast', label: 'After breakfast' },
  { key: 'after_lunch', label: 'After lunch' },
  { key: 'after_dinner', label: 'After dinner' },
];
export const SLOT_KEYS = SLOTS.map((slot) => slot.key);

export const VALUE_MIN = 40;
export const VALUE_MAX = 600;
export const MAX_READINGS_PER_DAY = 4;
export const UNIT = 'mg/dl';

export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt only looks at the first 72 bytes of a password, so longer ones are rejected.
export const PASSWORD_MAX_BYTES = 72;

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

/** General reference thresholds used only for the informational range badge. */
export const RANGE_LOW_BELOW = 70;
export const RANGE_HIGH_ABOVE = 180;

export const ROLES = { patient: 'patient', doctor: 'doctor' };

export const ERROR_CODES = {
  validation: 'VALIDATION_ERROR',
  duplicateSlot: 'DUPLICATE_SLOT',
  dailyLimit: 'DAILY_LIMIT',
  emailTaken: 'EMAIL_TAKEN',
  invalidCredentials: 'INVALID_CREDENTIALS',
  unauthenticated: 'UNAUTHENTICATED',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  rateLimited: 'RATE_LIMITED',
  payloadTooLarge: 'PAYLOAD_TOO_LARGE',
  internal: 'INTERNAL_ERROR',
  network: 'NETWORK_ERROR',
};

export const MESSAGES = {
  // The five rules from the brief (the duplicate-slot message is built by duplicateSlotMessage).
  valueRequired: 'Please enter a glucose value.',
  valueRange: `Value must be between ${VALUE_MIN} and ${VALUE_MAX} ${UNIT}.`,
  dailyLimit: `You can add only ${MAX_READINGS_PER_DAY} readings per day.`,
  futureDate: 'Date cannot be in the future.',

  // Extra messages (documented as assumptions in the README).
  dateRequired: 'Please choose a date.',
  dateInvalid: 'Please enter a valid date.',
  monthInvalid: 'Please choose a valid month.',
  slotRequired: 'Please choose a time slot.',
  nameRequired: 'Please enter your name.',
  nameTooLong: `Name must be ${NAME_MAX_LENGTH} characters or fewer.`,
  emailInvalid: 'Please enter a valid email address.',
  emailTaken: 'An account with this email already exists.',
  passwordLength: `Password must be ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_BYTES} characters.`,
  passwordRequired: 'Please enter your password.',
  invalidCredentials: 'Invalid email or password.',
  loginRequired: 'Please log in to continue.',
  forbidden: 'You do not have access to this.',
  readingNotFound: 'Reading not found.',
  patientNotFound: 'Patient not found.',
  notFound: 'Not found.',
  fixFields: 'Please fix the highlighted fields.',
  invalidBody: 'Invalid request body.',
  payloadTooLarge: 'Request body is too large.',
  tooManyRequests: 'Too many attempts. Please wait a few minutes and try again.',
  pageInvalid: 'Page must be a whole number of 1 or more.',
  limitInvalid: `Limit must be a whole number from 1 to ${PAGE_SIZE_MAX}.`,
  serverError: 'Something went wrong. Please try again.',
  network: 'Cannot reach the server. Check your connection and try again.',
};
