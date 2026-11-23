# Product

<!-- impeccable:product-schema 1 -->

Source: the project build plan (SWEETY_BUILD_PLAN.md, Sections 1, 10 and 11), confirmed by the owner as the product brief on 23 Nov 2026 in place of a separate interview.

## Platform

web

## Users

- **Patients managing blood glucose**, most often on a phone, opening the app up to four times a day right after a finger-prick check (before breakfast, then after each meal). They want to log one number fast and see what is still missing today.
- **Doctors** (read-only) who look at the reports of patients assigned to them.
- **Reviewers** at Kenpath evaluating this as a hiring assignment: they judge working features, correct validation, clear error messages and readable code. A simple UI is acceptable; a clear one is better.

## Product Purpose

Sweety records up to four glucose readings a day, one per meal-relative slot (Morning (fasting), After breakfast, After lunch, After dinner), and turns them into three reports for a chosen date: Daily, Month-to-date and the previous full Month, each with highest, lowest, one-decimal average and count. Success: logging a reading takes seconds, every broken rule explains itself in plain words, and the reports answer "how am I doing" at a glance.

## Positioning

The day is the unit. Four fixed slots, one reading each, make "what is missing today" visible as a four-part strip rather than a log of timestamps.

## Operating Context

- Logged right after measuring, often one-handed on a phone, sometimes back-filling an earlier day.
- Dates are calendar days in the user's own timezone; a reading can never be in the future.
- Values are whole numbers in mg/dl from 40 to 600.

## Capabilities and Constraints

- Register, log in, log out. Patients see only their own readings.
- Add, view, edit and delete readings. Rules and their exact messages: "Please enter a glucose value.", "Value must be between 40 and 600 mg/dl.", "You already have an After lunch reading for this date.", "You can add only 4 readings per day.", "Date cannot be in the future."
- Today, History (paginated, 20 per page, month filter), Reports (three cards plus a line chart of the month).
- Doctor role: patient list and read-only reports.
- Stack: React + Vite, CSS Modules, TanStack Query, Recharts, Phosphor icons; no UI kit.
- Dark mode is out of scope.

## Brand Commitments

- Name: **Sweety**.
- Palette (binding): Violeta `#46216D` primary, Lavanda `#A07DFF` accent, Turquesa `#19CECE` for progress and positive fills only (never text on light grounds).
- Typefaces (binding): Funnel Display for headings and the wordmark, Funnel Sans for UI and body, Martian Mono for glucose values, stats and dates in lists.
- Voice: short, plain, kind, sentence case, no exclamation marks in errors, "mg/dl" exactly, no em or en dashes in copy.
- Banned: background gradients, glassmorphism, emoji as icons, generic hero sections, three-column feature grids, heavy shadows, decorative animation on data.

## Evidence on Hand

- Seeded demo data (synthetic): Demo Patient with about two months of readings and two readings today; Ravi Kumar with one week; Dr. Meera Rao assigned to Demo Patient.
- No real patient data, testimonials or clinical claims exist and none may be invented. Reference-range badges (Low below 70, In range 70 to 180, High above 180) are informational only and must carry "General reference ranges for information only, not medical advice."

## Product Principles

1. Today first: every screen answers "what is today's number and what is missing?"
2. Rules explain themselves: an error names the problem and the fix in the user's words, next to the field.
3. Numbers are the hero: values are large, fixed-width and easy to compare.
4. Calm and clinical but warm: nothing alarming, nothing playful about health data.

## Accessibility & Inclusion

WCAG 2.2 AA is required, not polish: visible labels, errors linked with aria-describedby, focus moves to the first invalid field, visible focus rings, keyboard-reachable dialogs that trap focus and close on Escape, colour never the only signal, 44 by 44 px touch targets, 16 px minimum body text, prefers-reduced-motion honoured. Axe must report zero serious or critical issues.
