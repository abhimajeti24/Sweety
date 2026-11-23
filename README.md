# Sweety

[![CI](https://github.com/abhimajeti24/sweety-glucose-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/abhimajeti24/sweety-glucose-tracker/actions/workflows/ci.yml)

A blood glucose tracker: log up to four readings a day, one per meal slot, and see daily, month-to-date and monthly reports. Built with Node.js, Express, PostgreSQL and React.

![Today: two of four readings logged](docs/screenshots/04-today-two-logged.png)

## Features

**Required**

- [x] Register with name, email and password; log in and out. Passwords are stored only as bcrypt hashes.
- [x] Every user sees only their own readings (all queries are scoped by user; other users' ids answer 404).
- [x] A reading is a date, a time slot (Morning (fasting), After breakfast, After lunch, After dinner) and a value in mg/dl.
- [x] Add, view, edit and delete readings.
- [x] Validation, with the exact messages from the brief, shown next to the field in the UI:
  - "Please enter a glucose value."
  - "Value must be between 40 and 600 mg/dl."
  - "You already have an After lunch reading for this date."
  - "You can add only 4 readings per day."
  - "Date cannot be in the future." (timezone aware)
- [x] Reports for a selected date: Daily, Month-to-date (1st of the month to the date) and Monthly (the whole previous month), each with highest, lowest, average (one decimal) and count. The daily report lists each reading with its slot.
- [x] Friendly empty states.
- [x] Tests for the shared rules, the API and the reading form.

**Bonus**

- [x] Pagination on `GET /api/readings?page=1&limit=20` (History page).
- [x] Line chart of the month's readings (Recharts), one line per slot, with a table view.
- [x] `docker-compose.yml` that starts PostgreSQL, Redis and the app.
- [x] React Testing Library tests for the reading form.
- [x] Doctor role: a doctor sees read-only reports of patients assigned to them.
- [x] Report results cached in Redis and invalidated when a reading changes.
- [x] BullMQ daily job that logs a reminder for patients with fewer than 4 readings.
- [x] Extras: GitHub Actions CI, reference range badges, keyboard and screen reader support (axe reports no violations).

## Tech stack

| Area     | Choice                                                                                   |
| -------- | ---------------------------------------------------------------------------------------- |
| API      | Node.js 22, Express 5, hand-written parameterised SQL with `pg`                          |
| Database | PostgreSQL 16, numbered SQL migrations                                                   |
| Auth     | bcrypt, JWT in an httpOnly SameSite cookie, helmet, rate limiting                        |
| Frontend | React 19, Vite, React Router, TanStack Query, CSS Modules, Recharts, Phosphor icons      |
| Shared   | One `@sweety/shared` package holds the rules and messages used by both client and server |
| Optional | Redis (ioredis) for the report cache, BullMQ for the reminder job                        |
| Tests    | Vitest everywhere, Supertest for the API, React Testing Library for the UI               |
| Quality  | ESLint, Prettier, GitHub Actions                                                         |

## Quick start with Docker

Needs Docker Desktop.

```bash
cp .env.example .env          # optional: compose has safe defaults
docker compose up --build     # PostgreSQL, Redis and the app; migrations run on start
docker compose exec app npm run db:seed
```

Open http://localhost:4000 and log in with a demo account below.

## Local setup

Prerequisites: Node.js 22 (20 or newer works) and PostgreSQL 16, either installed locally or from Docker.

```bash
npm install
cp .env.example .env
```

Create the two databases, either with Docker:

```bash
docker compose up -d db       # creates sweety and sweety_test
```

or with a local PostgreSQL:

```bash
createdb sweety
createdb sweety_test
```

Then create the tables and the demo data:

```bash
npm run db:migrate
npm run db:seed
```

`npm run db:reset` drops everything, migrates and seeds again (refused when `NODE_ENV=production`).

## Run the server

```bash
npm run dev -w server         # http://localhost:4000, restarts on changes
```

## Run the client

```bash
npm run dev -w client         # http://localhost:5173, /api is proxied to the server
```

Or run both together with `npm run dev`. For a production build, `npm run build` then `npm start` serves the API and the built client on port 4000.

## Run the tests

```bash
npm test                      # everything
npm test -w shared            # validation, dates and formatting rules (unit)
npm test -w server            # the API against the sweety_test database (Supertest)
npm test -w client            # the reading form (React Testing Library)
```

The server tests need `DATABASE_URL_TEST` (the `sweety_test` database). They migrate it, empty the tables before every test, and refuse to run if it points at the same database as `DATABASE_URL`.

What they cover: every validation message, timezone-aware "today", the report ranges (including January and leap years), rounding, empty reports, bcrypt hashing and generic login errors, isolation between users, edit rules, concurrent duplicate adds, pagination, doctor access, the cache and its invalidation, the reminder query, and the form's error display and focus handling. The Redis cache also has a test against a real Redis that runs when `REDIS_URL_TEST` is set.

## Demo accounts

Created by `npm run db:seed` (demo-only credentials, not secrets):

| Account       | Email                | Password          | Role                                                          |
| ------------- | -------------------- | ----------------- | ------------------------------------------------------------- |
| Demo Patient  | `demo@sweety.test`   | `SweetyDemo#2026` | patient, about two months of readings, exactly 2 logged today |
| Ravi Kumar    | `ravi@sweety.test`   | `SweetyDemo#2026` | patient, one week of readings, no doctor                      |
| Dr. Meera Rao | `doctor@sweety.test` | `SweetyDemo#2026` | doctor, assigned to Demo Patient                              |

The seed is idempotent and builds its data relative to the day it runs, so run it again on the day of a demo.

## Environment variables

| Variable                                            | Default                 | Description                                                                           |
| --------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `NODE_ENV`                                          | `development`           | `production` serves the built client; `test` is set by the test runner                |
| `PORT`                                              | `4000`                  | API port                                                                              |
| `CLIENT_ORIGIN`                                     | `http://localhost:5173` | The only origin allowed by CORS                                                       |
| `APP_TIMEZONE`                                      | `Asia/Kolkata`          | Fallback for "today" when the browser sends no timezone; also the reminder job's zone |
| `LOG_LEVEL`                                         | `info`                  | pino log level (`silent` in tests)                                                    |
| `DATABASE_URL`                                      |                         | PostgreSQL connection string (required)                                               |
| `DATABASE_URL_TEST`                                 |                         | Separate database for the tests                                                       |
| `JWT_SECRET`                                        |                         | At least 32 characters (required)                                                     |
| `JWT_EXPIRES_IN`                                    | `7d`                    | Session length                                                                        |
| `BCRYPT_ROUNDS`                                     | `12`                    | bcrypt cost, 4 to 15 (tests use 4)                                                    |
| `COOKIE_SECURE`                                     | `false`                 | `true` behind HTTPS; also turns on HSTS                                               |
| `REDIS_URL`                                         | empty                   | Enables the report cache and the reminder job when set                                |
| `REDIS_URL_TEST`                                    | empty                   | Real Redis for the optional cache test                                                |
| `REPORT_CACHE_TTL_SECONDS`                          | `300`                   | How long a cached report lives                                                        |
| `REMINDER_CRON`                                     | `0 20 * * *`            | When the reminder job runs (in `APP_TIMEZONE`)                                        |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `sweety`                | Used by the Docker database container                                                 |
| `VITE_API_BASE_URL`                                 | `/api`                  | Where the client sends API requests                                                   |

The server checks its settings at startup and exits with a clear message if one is missing or invalid.

## API reference

All endpoints are under `/api`, take and return JSON, and report errors as `{ "error": { "code", "message", "fields"? } }`. The browser sends its timezone in an `X-Timezone` header.

| Method and path                                 | Who       | Does                                                            |
| ----------------------------------------------- | --------- | --------------------------------------------------------------- |
| `POST /auth/register`                           | anyone    | Create a patient account and log in (201)                       |
| `POST /auth/login`                              | anyone    | Log in (sets the session cookie)                                |
| `POST /auth/logout`                             | anyone    | Clear the session (204)                                         |
| `GET /auth/me`                                  | logged in | The current user                                                |
| `GET /readings?date=&from=&to=&page=1&limit=20` | patient   | Own readings, newest first, paginated                           |
| `GET /readings/:id`                             | patient   | One own reading                                                 |
| `POST /readings`                                | patient   | Add a reading (201; 400 / 409 on a broken rule)                 |
| `PUT /readings/:id`                             | patient   | Replace a reading                                               |
| `DELETE /readings/:id`                          | patient   | Delete a reading (204)                                          |
| `GET /reports?date=`                            | patient   | Daily, month-to-date and monthly stats (date defaults to today) |
| `GET /reports/series?month=YYYY-MM`             | patient   | A month of readings for the chart                               |
| `GET /doctor/patients`                          | doctor    | Assigned patients                                               |
| `GET /doctor/patients/:id/reports?date=`        | doctor    | An assigned patient's reports                                   |
| `GET /doctor/patients/:id/series?month=`        | doctor    | An assigned patient's month of readings                         |
| `GET /health`                                   | anyone    | `{ status, db, redis }`                                         |

Example: adding a reading for a slot that is already taken.

```http
POST /api/readings
Content-Type: application/json
X-Timezone: Asia/Kolkata

{ "date": "2026-10-15", "slot": "after_lunch", "value": 142 }
```

```json
HTTP/1.1 409 Conflict

{
  "error": {
    "code": "DUPLICATE_SLOT",
    "message": "You already have an After lunch reading for this date.",
    "fields": { "slot": "You already have an After lunch reading for this date." }
  }
}
```

And the reports for the brief's example date (values illustrative):

```json
GET /api/reports?date=2026-10-15

{
  "selectedDate": "2026-10-15",
  "daily": {
    "range": { "from": "2026-10-15", "to": "2026-10-15" },
    "stats": { "count": 3, "highest": 182, "lowest": 96, "average": 131.3 },
    "readings": [{ "id": 1, "date": "2026-10-15", "slot": "morning_fasting", "slotLabel": "Morning (fasting)", "value": 96 }]
  },
  "monthToDate": { "range": { "from": "2026-10-01", "to": "2026-10-15" }, "stats": { "count": 41, "highest": 259, "lowest": 85, "average": 145.8 } },
  "monthly": { "range": { "from": "2026-09-01", "to": "2026-09-30" }, "stats": { "count": 0, "highest": null, "lowest": null, "average": null } }
}
```

## Project structure

```
shared/        rules, messages, date and format helpers used by both sides (+ unit tests)
server/
  src/db/      pool, migrations, migration runner, reset and seed
  src/routes/  thin HTTP handlers
  src/services/  business rules (validation order, daily limit, reports, doctor access)
  src/repositories/  all SQL, mapped to camelCase objects
  src/middleware/  auth, roles, timezone, JSON-only, rate limits, errors
  src/lib/     AppError, JWT cookie, Redis cache, logger
  src/jobs/    BullMQ queue and the reminder worker
  test/        Supertest integration tests
client/
  src/pages/   Login, Register, Today, History, Reports, doctor pages
  src/components/  DayStrip, ReadingForm, ReportCard, MonthChart and smaller pieces
  src/api/     fetch wrapper and endpoint functions
  src/hooks/   TanStack Query hooks
  test/        React Testing Library tests
docs/          screenshots and the assumptions list
```

## Screenshots

|                                                                                                 |                                                                                                     |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ![Login](docs/screenshots/01-login.png) Login                                                   | ![Register errors](docs/screenshots/02-register-errors.png) Register with field errors              |
| ![Today empty](docs/screenshots/03-today-empty.png) Today, nothing logged                       | ![Today two logged](docs/screenshots/04-today-two-logged.png) Today, two of four logged             |
| ![Value required](docs/screenshots/05-error-value-required.png) "Please enter a glucose value." | ![Value range](docs/screenshots/06-error-value-range.png) "Value must be between 40 and 600 mg/dl." |
| ![Duplicate slot](docs/screenshots/07-error-duplicate-slot.png) Duplicate slot                  | ![Daily limit](docs/screenshots/08-error-daily-limit.png) Daily limit                               |
| ![Future date](docs/screenshots/09-error-future-date.png) "Date cannot be in the future."       | ![All logged](docs/screenshots/10-today-all-logged.png) All four logged                             |
| ![Edit](docs/screenshots/11-edit-dialog.png) Edit a reading                                     | ![Delete](docs/screenshots/12-delete-confirm.png) Delete confirmation                               |
| ![Reports](docs/screenshots/13-reports.png) Reports for 15 Oct 2026 with chart                  | ![Reports empty](docs/screenshots/14-reports-empty.png) Reports with no data                        |
| ![History](docs/screenshots/15-history.png) History with pagination                             | ![Doctor patients](docs/screenshots/16a-doctor-patients.png) Doctor: patient list                   |
| ![Doctor report](docs/screenshots/16b-doctor-patient-report.png) Doctor: a patient's reports    | ![Mobile](docs/screenshots/17-today-mobile.png) Today on a phone (390 px)                           |

Screen recording (2 to 3 minutes): _link to be added_.

## Notes

### Assumptions

1. **PostgreSQL only.** The title says "MERN + PostgreSQL", but the body asks for a PostgreSQL database, so I used PostgreSQL in place of MongoDB with the rest of the MERN-style stack (React, Express, Node).
2. **Daily limit vs one reading per slot.** With four slots and one reading per slot, a day can never exceed four readings, so the rules overlap. Both messages stay reachable because the server checks them in a fixed order: a full day gets "You can add only 4 readings per day.", otherwise a taken slot gets the duplicate message. The Today page keeps "Add reading" visible on a full day so the limit can be hit from the UI.
3. **"Today" is the user's today.** The browser sends its timezone; the server decides "today" in that zone and falls back to `APP_TIMEZONE`. The future-date rule therefore lives in code, not in a database constraint.
4. **Grammar and units.** The duplicate message uses "a Morning (fasting)" and "an After lunch". All copy uses "mg/dl" as written in the brief.
5. **Values** must be whole numbers from 40 to 600. Leading zeros and spaces are fine (`" 0120 "` is 120); `120.5`, `-5`, `1e2` and `abc` get the range message.
6. **Dates** have no lower bound, so old readings can be back-filled. Slots are meal-relative, so any slot can be logged for today at any hour.
7. **Messages beyond the brief:** "Please choose a date.", "Please enter a valid date.", "Please choose a time slot.", "Please enter your name.", "Name must be 80 characters or fewer.", "Please enter a valid email address.", "An account with this email already exists.", "Password must be 8 to 72 characters.", "Please enter your password.", "Invalid email or password.", "Please log in to continue.", "Reading not found.", "Patient not found.".
8. **Passwords** are 8 to 72 bytes because bcrypt ignores anything after 72 bytes. Emails are trimmed and stored in lowercase; uniqueness ignores case.
9. **Editing** replaces date, slot and value together. Saving unchanged is allowed; moving a reading onto a full day or a taken slot is not.
10. **Privacy:** a reading that does not exist and one that belongs to someone else both answer 404, so the API never confirms another user's ids.
11. **Roles:** public sign-up always creates a patient. Doctors and their assignments come from the seed only, and doctors are read-only.
12. **Rounding:** the average is rounded to one decimal in SQL (half away from zero) and always shown with one decimal.
13. **Range badges** (Low below 70, In range 70 to 180, High above 180) are general reference ranges for information only, not medical advice, and the UI says so.
14. **Redis is optional.** Without it the cache is off and the reminder job is not scheduled; `npm run job:reminders` runs one pass by hand. The job only writes log lines.
15. **Requests:** writes must be JSON (415 otherwise), bodies are capped at 10 kb, and login allows 10 failed attempts per 15 minutes per IP.
16. **Node.js 22** is recommended; Node 20 reached end of life in April 2026.

### What I would improve with more time

- Refresh-token rotation and server-side session revocation.
- Email verification and password reset.
- An audit log of edits and deletes.
- End-to-end tests in CI with Playwright, including the axe accessibility check.
- A mmol/L unit toggle, dark mode and Indian language support.
- An offline-first PWA that queues readings and syncs later.
- Doctor notes on readings, and exporting reports as PDF or CSV.
- An HbA1c estimate from 90-day averages, with clinical review before showing it.

### How I used AI tools

_Optional, to be written by Abhinav._
