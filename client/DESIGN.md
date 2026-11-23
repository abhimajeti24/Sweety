---
name: Sweety
description: A four-slot daily glucose logbook that reads like a live score line.
colors:
  violeta: "#46216d"
  lavanda: "#a07dff"
  turquesa: "#19cece"
  violeta-700: "#5a2d8a"
  lavanda-50: "#f3eeff"
  lavanda-100: "#e6dcff"
  turquesa-50: "#e0f8f8"
  turquesa-800: "#0b6b6b"
  ink: "#1b1026"
  ink-muted: "#6b5c7b"
  on-violeta-muted: "#d9ccf7"
  paper: "#fbf9ff"
  surface: "#ffffff"
  line: "#e6ddf5"
  field-border: "#8b7ba1"
  danger: "#b3261e"
  danger-50: "#fdecea"
  warn-text: "#8a4b00"
  warn-50: "#fff4e0"
  series-1: "#6a3d9a"
  series-2: "#169f9f"
  series-3: "#a07dff"
  series-4: "#b0628f"
typography:
  wordmark:
    fontFamily: "Funnel Display Variable, Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "1.563rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Funnel Display Variable, Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "1.953rem"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Funnel Display Variable, Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
  title-sm:
    fontFamily: "Funnel Display Variable, Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
  caption:
    fontFamily: "Funnel Sans Variable, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.5
  numeral-hero:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "2.441rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numeral-stat:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "1.563rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numeral-row:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  score-line:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  score-line-sm:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  date:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
rounded:
  tab: "6px"
  control: "10px"
  card: "14px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  space-8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.violeta}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.violeta-700}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.violeta}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.lavanda-50}"
    textColor: "{colors.violeta}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.violeta}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.lavanda-50}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-sm:
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.violeta}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  icon-button-delete:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  icon-button-delete-hover:
    backgroundColor: "{colors.danger-50}"
    textColor: "{colors.danger}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  input-value:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral-row}"
    rounded: "{rounded.control}"
    padding: "0 88px 0 16px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px 24px 24px"
  card-tab:
    backgroundColor: "{colors.violeta}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.tab}"
    padding: "4px 12px"
  slot-tile-filled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.violeta}"
    typography: "{typography.numeral-hero}"
    rounded: "{rounded.card}"
    padding: "16px"
    height: "164px"
  slot-tile-empty:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.card}"
    padding: "16px"
    height: "164px"
  score-segment:
    backgroundColor: "{colors.lavanda-50}"
    rounded: "{rounded.pill}"
    height: "10px"
  score-segment-filled:
    backgroundColor: "{colors.turquesa}"
    rounded: "{rounded.pill}"
    height: "10px"
  badge-in-range:
    backgroundColor: "{colors.turquesa-50}"
    textColor: "{colors.turquesa-800}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  badge-low:
    backgroundColor: "{colors.danger-50}"
    textColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  badge-high:
    backgroundColor: "{colors.warn-50}"
    textColor: "{colors.warn-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  legend-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "44px"
  legend-chip-pressed:
    backgroundColor: "{colors.lavanda-50}"
    textColor: "{colors.ink}"
  nav-rail:
    backgroundColor: "{colors.violeta}"
    textColor: "{colors.on-violeta-muted}"
    width: "248px"
  nav-link-active:
    backgroundColor: "{colors.violeta-700}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "48px"
  pagination-current:
    backgroundColor: "{colors.violeta}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    width: "44px"
    height: "44px"
  toast:
    backgroundColor: "{colors.violeta}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: Sweety

## Overview

**Creative North Star: "The Day's Scorecard"**

Sweety treats each day as a scorecard of four deliveries: Morning (fasting), After breakfast, After lunch, After dinner. Every screen reads like a live score line: what is logged, what is left, and the numbers that matter, set in fixed-width figures so they line up and never jump. The world refuses the category default of a timestamped feed under a big decorative chart hero; the day, not the event, is the unit.

The material is a quiet paper ground with a Violeta rail, white cards on lavender hairlines, and small Violeta header tabs that title each card like the head of a ruled scorecard module. Density is deliberately high in the Japanese-catalogue sense: stats pack tight in 2x2 or 4-up grids divided by hairlines, with no inflated whitespace. Colour is a signal system, not decoration: Turquesa fills mark what is logged, Lavanda marks selection, Violeta carries action and headings, and every coloured signal also has a shape, a word or a position so colour is never the only cue.

The tone is calm and clinical but warm. Nothing is alarming, nothing is playful about health data. Motion exists only for hover, dialogs, toasts and loading placeholders, and every animation stops under reduced motion. Dark mode is out of scope; this is a single light world.

**Key Characteristics:**
- Martian Mono tabular numerals for every value, stat, date and score.
- The score line ("2 of 4 logged", "All 4 logged") as the signature summary on Today and on every report card header.
- Four-part capacity: four slot tiles, four score segments, four chart series, four segments in the wordmark motif.
- White cards on 1px lavender hairlines with a soft violet-tinted shadow; a Violeta tab names each report card.
- Paper ground, Violeta rail and primary actions, Turquesa only as fill.
- Whole-cell repacking: four across on wide screens, 2x2 on phones, never squeezed.
- WCAG 2.2 AA throughout: 44px touch targets, 3:1 field outlines, a two-layer focus ring.

## Colors

A violet family carrying structure and action, one teal for "logged", and a lavender-tinted neutral set; the palette is fixed by the brand and extended only by measured supporting steps.

### Primary
- **Violeta** (#46216d): the rail and top bar, primary buttons, headings (h1 to h4), card header tabs, the current pagination page, toasts, link text, the caret and big slot values. White text on it measures 12.4:1.
- **Deep Violeta** (#5a2d8a): hover state for primary buttons and the active and hovered link in the sidebar rail. White text on it measures 9.7:1.

### Secondary
- **Lavanda** (#a07dff): selection and accent fills; the unlogged segments of the wordmark motif, the login preview bar outlines, and the After lunch chart series. Never white body text on it (3.1:1).
- **Lavanda Mist** (#f3eeff): hover wash for secondary, ghost and icon buttons, pressed legend chips, unfilled score segments and the sticky table header.
- **Lavanda Veil** (#e6dcff): the outer layer of the focus ring, text selection and the inset rim on unfilled score segments.

### Tertiary
- **Turquesa** (#19cece): progress and positive fills only. Filled score segments, the logged dot on a slot tile, the active tab underline and focus outline on the Violeta bar, the toast check icon on Violeta, and the logged bars in the login preview. It measures 2.0:1 on light grounds, so it never carries text or icons there.
- **Turquesa Wash** (#e0f8f8) with **Deep Turquesa** (#0b6b6b): the In range badge and the chart's reference band; Deep Turquesa is the readable text partner (5.7:1).

### Neutral
- **Ink** (#1b1026): body text and field values (17.5:1 on paper).
- **Muted Ink** (#6b5c7b): secondary text, units ("mg/dl"), slot labels, captions, quiet delete icons at rest (5.8:1 on paper).
- **On-Violeta Muted** (#d9ccf7): secondary text and inactive nav on the Violeta rail (8.2:1).
- **Paper** (#fbf9ff): the page ground.
- **Surface** (#ffffff): cards, fields, dialogs, tooltips.
- **Hairline** (#e6ddf5): decorative card borders, stat dividers, list rules and chart gridlines only; never a control boundary.
- **Field Border** (#8b7ba1): input outlines and the dashed border of empty slot tiles, at 3.9:1 on white to meet WCAG 1.4.11.

### Status
- **Danger** (#b3261e) on **Danger Wash** (#fdecea): field errors, destructive buttons, the Low badge, delete hover.
- **Warn Text** (#8a4b00) on **Warn Wash** (#fff4e0): the High badge.

### Chart series
One series per slot, in meal order, each with its own marker shape: **Series Violeta** (#6a3d9a, circle) Morning, **Series Teal** (#169f9f, square) After breakfast, **Lavanda** (#a07dff, triangle) After lunch, **Series Mauve** (#b0628f, diamond) After dinner. All four pass 3:1 against white and separate under colour-vision deficiency.

### Named Rules
**The Turquesa Is Fill Rule.** Turquesa marks "logged" as a fill, a dot, an underline or an icon on Violeta. On paper or white it never carries text or a stand-alone icon; when teal text is needed, use Deep Turquesa on Turquesa Wash.

**The Hairline Is Not a Boundary Rule.** Hairline (#e6ddf5) only separates and frames. Anything a user operates (inputs, selects, the date field, empty slot outlines) uses Field Border (#8b7ba1) so it reaches 3:1.

**The Never Colour Alone Rule.** Every coloured signal is paired with something else: badges carry an icon and a word, chart series carry a marker shape, logged tiles carry a value and a dot, and the score line states the count in words.

## Typography

**Display Font:** Funnel Display (with Funnel Sans, system-ui)
**Body Font:** Funnel Sans (with system-ui)
**Label/Mono Font:** Martian Mono (with ui-monospace)

**Character:** Funnel Display gives headings and the wordmark a compact, confident voice in Violeta; Funnel Sans keeps the interface plain and readable; Martian Mono turns every number into a scoreboard figure, wide and tabular, so values compare at a glance.

### Hierarchy
- **Wordmark** (800, 1.563rem; 2.441rem on the auth panel, -0.02em): "Sweety" in white beside the four-segment motif.
- **Headline** (750, 1.953rem, 1.15, -0.01em): page titles (Today, History, Reports). Balanced wrapping.
- **Title** (700, 1.25rem, 1.15): section headings such as the chart month.
- **Title small** (700, 1rem, 1.15): sub-section headings.
- **Body** (400, 1rem, 1.5): all running text; 16px is the floor for body copy. Notes cap at 70ch.
- **Label** (600, 0.875rem): field labels at 1rem, slot labels, buttons at 1rem, tab labels at 650 and 0.875rem.
- **Caption** (400, 0.8rem): units under stats, badges (650), reference-range notes, chart captions.
- **Numeral hero** (Martian Mono 500, 2.441rem, line-height 1): a logged value on a slot tile, in Violeta.
- **Numeral stat** (Martian Mono 500, 1.563rem): Highest, Lowest, Average, Readings in a stat grid, in Ink.
- **Numeral row** (Martian Mono 500, 1.25rem): values in reading lists, in Violeta; also the value field.
- **Score line** (Martian Mono 400, 1.25rem on Today, 0.8rem in card headers): the logged count at 500 weight in Violeta (Ink at the small size), the rest in Ink or Muted Ink.
- **Date** (Martian Mono, 0.875rem): dates on Today, report ranges, history guide words and the date input.

### Named Rules
**The Mono Numbers Rule.** Every glucose value, stat, count, date and score is set in Martian Mono with tabular numerals and -0.02em tracking. Words stay in Funnel Sans; numbers never do.

**The Unit Steps Down Rule.** "mg/dl" always follows its value, written exactly so, in Funnel Sans one or two steps smaller and in Muted Ink, baseline-aligned.

## Layout

A single fixed-rail shell. On phones a sticky Violeta top bar holds the wordmark, log out, and a three-tab row (Today, History, Reports) underlined in Turquesa when active. From 960px the bar becomes a fixed 248px Violeta sidebar with stacked nav links and the account block pinned to the bottom behind a faint white rule. Content sits on Paper, capped at 1040px, padded 24px by 16px on phones and 48px on wide screens.

Spacing runs on a 4px base (4, 8, 12, 16, 24, 32, 48, 64). Pages stack their sections with 24px to 32px gaps; cards pad 16px to 24px; stats and lists sit on 12px cells divided by hairlines.

Grids repack in whole cells. The DayStrip is 2x2 on phones and four across from 720px. Stat grids are 2x2 and switch to four across when their container reaches 560px (a container query, so a stat grid in a narrow card stays 2x2). Reading lists are three aligned columns (slot, value, badge, plus actions when editable) and fold into two even lines under 440px of container width. History groups flow in an auto-fill grid with a 420px minimum. Chart legend chips repack 2x2 under 600px. The auth screen splits 5:7 at 960px with a sticky Violeta brand panel.

### Named Rules
**The Whole Cells Rule.** Grids drop a column count, they never squeeze cells: four, then two, never three narrow ones.

**The Guide Words Rule.** A paginated list names the span in view above it ("15 Oct to 9 Oct 2026") on a hairline, like the head of a dictionary page.

## Elevation & Depth

Mostly flat with one soft lift. Cards and filled slot tiles sit on a faint violet-tinted two-layer shadow over a hairline border; empty tiles, inputs, history groups and the rail are flat. Floating layers (dialogs, toasts, chart tooltips) get one deeper diffuse shadow. Depth never comes from gradients or blur.

### Shadow Vocabulary
- **Soft card** (`box-shadow: 0 1px 2px rgb(70 33 109 / 0.05), 0 6px 16px -8px rgb(70 33 109 / 0.12)`): report cards, the chart card and filled slot tiles.
- **Dialog** (`box-shadow: 0 24px 48px -12px rgb(27 16 38 / 0.28)`): modal dialogs over a 48% Ink backdrop, toasts and chart tooltips.
- **Focus ring** (`outline: 2px solid #46216d; outline-offset: 2px; box-shadow: 0 0 0 4px #e6dcff`): every focusable element on light grounds. Fields replace the outline with a 1px Violeta inner ring plus the same lavender halo. On the Violeta bar the outline turns Turquesa and the halo drops.

### Named Rules
**The Filled Lifts, Empty Waits Rule.** A logged slot is a lifted white card; an unlogged slot is a flat dashed outline on Paper. Elevation itself says what is done.

## Shapes

Gently rounded and consistent: 14px on cards, tiles and dialogs; 10px on buttons, fields, nav links, toasts and pagination; full pills for badges, legend chips and score segments; a tighter 6px on the card header tab so it reads as a label set into the card. Borders are 1px hairlines on containers, 1px Field Border on controls (2px Danger when invalid), 1.5px on button outlines and a 1.5px dash on empty slot tiles. The recurring silhouette is the rounded segment: four pill-ended bars in the wordmark motif, the score line, and the login preview.

## Components

### Buttons
Solid, clear and finger-sized.
- **Shape:** gently rounded (10px), 48px tall, 24px side padding, 600 weight, optional leading Phosphor icon at an 8px gap.
- **Primary:** Violeta fill, white text; hover deepens to #5a2d8a.
- **Secondary:** white with a 1.5px Violeta border and Violeta text; hover washes to Lavanda Mist. Used for Add on empty slot tiles.
- **Ghost:** transparent, Violeta text, Lavanda Mist on hover.
- **Danger:** Danger fill, white text; used only inside the confirm dialog.
- **Small:** 44px tall, 16px padding, 0.875rem.
- **Hover / Focus / Active:** 180ms ease-out colour transitions; active presses down 1px; disabled drops to 55% opacity with a not-allowed cursor.
- **Icon buttons:** 44px square, 10px radius. Edit is Violeta. Delete stays Muted Ink at rest and turns Danger on Danger Wash only on hover or focus, so values stay the loudest marks in a row.

### Score Line (signature)
A compact Martian Mono row that summarises a day or range like a live score: "2 of 4 logged", or "All 4 logged" when the day is full. The logged count is weighted 500 in Violeta. On Today it renders large (1.25rem) beside four 10px pill segments in a 160px track (200px from 720px), filled Turquesa in meal order where a reading exists and Lavanda Mist with a Lavanda Veil rim where not; segments are decorative and hidden from assistive tech because the words already say it. On report cards it renders small (0.8rem, Muted Ink) opposite the tab, with capacity computed as days in range times four ("59 of 60 logged", "0 of 120 logged").

### Slot Tiles (DayStrip)
- **Filled:** white card, hairline, soft shadow, 14px radius, 16px padding, 164px minimum height. Slot label in Muted Ink with an 8px Turquesa logged dot; the value at 2.441rem Martian Mono in Violeta with "mg/dl"; a range badge; edit and delete icon buttons.
- **Empty:** transparent, 1.5px dashed Field Border, "Not logged" in Muted Ink and a secondary Add button.
- When all four are logged the score line reads "All 4 logged" and the Add action disappears.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Surface on Paper.
- **Shadow Strategy:** Soft card (see Elevation & Depth); history day groups are flat.
- **Border:** 1px Hairline.
- **Internal Padding:** 16px top, 24px sides and bottom on report cards; 24px on the chart card.
- **Header tab:** the card's heading sits in a small Violeta tab (6px radius, 4px by 12px padding, white 0.875rem at 650) with the score line opposite and the date range in Martian Mono beneath. Every report card uses the same two header lines so stats start at the same height across a row.

### Stat Grid
Four stats (Highest, Lowest, Average, Readings) in hairline-ruled cells: label in Muted Ink at 0.875rem, value at 1.563rem Martian Mono in Ink, unit in caption. 2x2 by default, four across from 560px of container. Averages show one decimal.

### Reading List
Scorecard columns: slot name, right-aligned value (1.25rem Martian Mono, Violeta) with unit, range badge, and actions when editable; 52px rows on hairline rules. Folds to two lines per reading in narrow containers.

### Chips (range badges and legend)
- **Range badges:** pill, 0.8rem at 650, a check or arrow icon plus the word. In range is Deep Turquesa on Turquesa Wash, Low is Danger on Danger Wash, High is Warn Text on Warn Wash. Always accompanied somewhere on the screen by the note "General reference ranges for information only, not medical advice."
- **Legend chips:** 44px pill toggles with a hairline border, a line-and-marker swatch and the slot name. Pressed shows a Violeta border on Lavanda Mist; focusing one series dims the other three to 15% opacity in the chart.

### Inputs / Fields
- **Style:** white, 1px Field Border, 10px radius, 48px tall, 16px padding; label above at 600 in Ink, hint below in Muted Ink.
- **Value field:** Martian Mono at 1.25rem with "mg/dl" as a fixed suffix inside the field.
- **Date field:** Martian Mono at 0.875rem.
- **Selects:** custom Violeta caret, same frame.
- **Hover / Focus:** hover darkens the border to Deep Violeta; focus sets a Violeta border, 1px Violeta inner ring and the Lavanda Veil halo.
- **Error:** 2px Danger border; the message sits under the field in Danger at 0.875rem and 550 weight with a warning icon, in the brief's exact words, linked by aria-describedby.

### Date Control
A white, hairline-framed group (14px radius, 4px padding) holding previous and next icon buttons around the date field; next is disabled on today. Reports adds a ghost "Today" button inside it.

### Navigation
- **Phones:** sticky Violeta top bar; three equal tabs at 48px with icon and label, On-Violeta Muted at rest, white on hover, white with a 3px Turquesa underline when active.
- **Wide (960px+):** 248px Violeta sidebar; links are 48px rows with a 12px icon gap and 10px radius, filled Deep Violeta when hovered or active. Account name, email and log out sit at the bottom.
- **Pagination:** 44px square page buttons in Violeta text; the current page is a Violeta fill with white text; step words hide under 480px leaving arrows.

### Month Chart
A white card holding the legend chips, a line chart with one series per slot (2px lines, distinct marker shapes ringed in white), horizontal hairline gridlines, Martian Mono axes, and a Turquesa Wash reference band for 70 to 180 mg/dl with a caption. A disclosure reveals the same data as a table with a sticky Lavanda Mist header. While a new month loads, the old chart dims to 60%.

### Dialogs and Toasts
Dialogs are 460px max, 14px radius, 24px padding, Dialog shadow over an Ink backdrop at 48%, entering with a 12px rise and slight scale over 180ms. Toasts are Violeta pills of 10px radius at the bottom centre with a Turquesa check icon and white 550 text.

## Do's and Don'ts

### Do:
- **Do** set every glucose value, stat, count and date in Martian Mono with tabular numerals.
- **Do** summarise a day or range with the score line ("2 of 4 logged", "All 4 logged") and give every report card a Violeta header tab with the score line opposite.
- **Do** use Turquesa (#19cece) only as a fill, dot, underline or icon on Violeta to mean "logged".
- **Do** outline every operable control in Field Border (#8b7ba1) and keep Hairline (#e6ddf5) for decoration.
- **Do** pair every colour signal with a word, icon or marker shape.
- **Do** keep touch targets at 44px minimum and primary controls at 48px.
- **Do** repack grids in whole cells: four across, then 2x2.
- **Do** write "mg/dl" exactly, one step smaller, in Muted Ink.
- **Do** show the reference-range disclaimer wherever range badges or the reference band appear.
- **Do** confine motion to hover, dialogs, toasts and loading placeholders, and stop all of it under prefers-reduced-motion.

### Don't:
- **Don't** put text or stand-alone icons in Turquesa or Lavanda on Paper or white (2.0:1 and 3.1:1).
- **Don't** use background gradients, glassmorphism, emoji as icons or heavy shadows; the Soft card shadow is the ceiling for resting surfaces.
- **Don't** open a screen with a timestamped feed under a big decorative chart hero.
- **Don't** add decorative animation to data.
- **Don't** introduce a dark theme; dark mode is out of scope.
- **Don't** add new raw colour values outside the token set.
