# Assumptions

The full list of decisions I made where the brief left a gap. The README's Notes section has the short version.

## Decisions on gaps in the brief

1. **PostgreSQL only.** The title says "MERN + PostgreSQL", but the body asks for a PostgreSQL database. I read it as the MERN style of app (React, Express, Node) with PostgreSQL in place of MongoDB. No MongoDB is used.
2. **Daily limit vs one reading per slot.** With four slots and one reading per slot, a day can never hold more than four readings, so the two rules overlap. Both messages are still reachable because the server checks them in a fixed order: if the day already has 4 readings it answers "You can add only 4 readings per day."; otherwise, if the slot is taken, it answers "You already have an After lunch reading for this date.". The Today page keeps its "Add reading" button on a full day so the limit can be hit from the UI.
3. **"Today" depends on the user's timezone.** The browser sends its IANA timezone in an `X-Timezone` header and the server works out "today" in that zone. A missing or unknown zone falls back to `APP_TIMEZONE` (default `Asia/Kolkata`). Because of this, the future-date rule lives in application code, not in a database constraint.
4. **Article in the duplicate message.** The brief's example reads "an After lunch reading"; the fasting slot reads "a Morning (fasting) reading".
5. **Units.** The UI and all messages use "mg/dl" exactly as the brief writes it.

## Validation

- The glucose value must be a whole number from 40 to 600. `120.5`, `-5`, `1e2` and `abc` get "Value must be between 40 and 600 mg/dl.". Leading zeros and surrounding spaces are allowed (`" 0120 "` is 120).
- There is no lower bound on the date, so old readings can be back-filled.
- Slots are meal-relative, not clock times, so any slot can be logged for today at any hour.
- Messages added beyond the brief: "Please choose a date.", "Please enter a valid date.", "Please choose a time slot.", "Please enter your name.", "Name must be 80 characters or fewer.", "Please enter a valid email address.", "An account with this email already exists.", "Password must be 8 to 72 characters.", "Please enter your password.", "Invalid email or password.", "Please log in to continue.", "Reading not found.", "Patient not found.".
- Passwords are limited to 72 bytes because bcrypt silently ignores anything longer.
- Emails are trimmed and stored in lowercase (unique regardless of case); names are trimmed.
- Editing is a full replace of date, slot and value. Saving a reading unchanged is allowed; moving it onto a full day or a taken slot is not.

## API behaviour

- A reading that does not exist and a reading that belongs to someone else both answer 404, so the API never reveals that another user's id exists. Ids that are not whole numbers answer 404 too.
- Write requests must be JSON (anything else gets 415), the body is capped at 10 kb (413), and malformed JSON gets 400 "Invalid request body.".
- Login is rate limited to 10 failed attempts per 15 minutes per IP (successful logins do not count); registration to 10 attempts per 15 minutes.
- `GET /api/reports/series` returns full reading objects (`id, date, slot, slotLabel, value`), a superset of the planned `{ date, slot, value }`.

## Roles

- Public registration always creates a patient. Doctor accounts and doctor-patient assignments are created by the seed script only, which prevents anyone from signing up as a doctor.
- Doctors are read-only: they see their assigned patients' reports and chart, and cannot use the readings endpoints.

## Reports

- The average is rounded to one decimal in SQL (`ROUND` on `numeric`, half away from zero) and always shown with one decimal (`120` shows as `120.0`).
- A range is written "1 Oct to 15 Oct 2026"; on the 1st of a month the month-to-date range is "1 Nov to 1 Nov 2026".
- Range badges (Low below 70, In range 70 to 180, High above 180) use general reference thresholds for information only, and every page that shows them says so.

## Environment

- Node.js 22 LTS is recommended (Node 20 reached end of life in April 2026; the code runs on 20 or newer).
- Redis is optional. Without `REDIS_URL` the report cache is off and the reminder job is not scheduled (it can still be run once with `npm run job:reminders`).
- The reminder job only writes log lines; nothing is sent to users.
