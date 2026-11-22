-- Users and glucose readings.

CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- Declared in meal order so ORDER BY slot sorts the way the UI shows slots.
CREATE TYPE glucose_slot AS ENUM (
  'morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'
);

CREATE TABLE users (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           VARCHAR(80)  NOT NULL,
  email          VARCHAR(254) NOT NULL,
  password_hash  TEXT         NOT NULL,
  role           user_role    NOT NULL DEFAULT 'patient',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Case-insensitive uniqueness: Asha@x.com and asha@x.com are the same account.
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

CREATE TABLE readings (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date  DATE         NOT NULL,
  slot          glucose_slot NOT NULL,
  value_mg_dl   SMALLINT     NOT NULL CHECK (value_mg_dl BETWEEN 40 AND 600),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  -- One reading per slot per day. Its index (user_id, reading_date, slot) also serves
  -- every per-user date-range query, so no extra index is needed.
  CONSTRAINT readings_one_per_slot UNIQUE (user_id, reading_date, slot)
);
