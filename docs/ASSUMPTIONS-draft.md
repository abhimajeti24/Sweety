# Assumptions (draft, merged into the README Notes at the end)

## Decisions on gaps in the brief

1. **PostgreSQL only.** The title says "MERN + PostgreSQL", but the body asks for a PostgreSQL database. MERN implies MongoDB, so I read it as "the MERN style of app (React, Express, Node) with PostgreSQL in place of MongoDB". No MongoDB is used.
2. **Daily limit vs one reading per slot.** With four slots and one reading per slot, a day can never hold more than four readings, so the two rules overlap. Both messages are still reachable because the server checks them in a fixed order: if the day already has 4 readings, it answers "You can add only 4 readings per day."; otherwise, if the slot is taken, it answers "You already have an After lunch reading for this date.".
3. **"Today" depends on the user's timezone.** The browser sends its IANA timezone in an `X-Timezone` header. The server works out "today" in that zone. If the header is missing or invalid, it falls back to `APP_TIMEZONE` (default `Asia/Kolkata`). Because of this the future-date rule lives in application code, not in a database constraint.
4. **Article in the duplicate message.** The brief's example reads "an After lunch reading". For the fasting slot the message reads "a Morning (fasting) reading".
5. **Units.** The UI and all messages use "mg/dl" exactly as the brief writes it.

## Validation details

- The glucose value must be a whole number. `120.5`, `-5`, `1e2` and `abc` all get "Value must be between 40 and 600 mg/dl.". Leading zeros are allowed (`0120` is 120).
- There is no lower bound on the date. Very old readings can be back-filled.
- Slots are meal-relative, not clock times, so any slot can be logged for today at any hour.
- Extra messages not in the brief: "Please choose a date.", "Please enter a valid date.", "Please choose a time slot.", "Please enter your name.", "Name must be 80 characters or fewer.", "Please enter a valid email address.", "An account with this email already exists.", "Password must be 8 to 72 characters.", "Invalid email or password.", "Please log in to continue.", "Reading not found.".
- Passwords are limited to 72 bytes because bcrypt silently ignores anything longer.
- Emails are trimmed and stored in lowercase; names are trimmed.

## Environment

- Node.js 22 LTS is recommended (Node 20 reached end of life in April 2026, but the code runs on 20 or newer).
