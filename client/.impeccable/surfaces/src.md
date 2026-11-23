---
version: 1
slug: 'src'
primary_target: 'src'
related_targets: []
---

# Sweety app surfaces (Today, History, Reports, auth, doctor)

Scope: the whole authenticated app plus login/register. Visitor mode: Operate.
Audience and job: patients logging up to four glucose readings a day on a phone, right after measuring; doctors reading reports. Primary task: see what is missing today and log it in seconds. Constraints: build plan Sections 10 and 11 are binding (palette, fonts, shell, copy, WCAG 2.2 AA). Code-led build (no image generation available). Brief-pinned decisions beat the roll; the roll lends only density and the signature move.

## Direction contract

THESIS: The day is a scorecard of four deliveries. Every screen reads like a live score line: what is logged, what is left, the numbers that matter, in fixed-width figures. It refuses the category default of a timestamped feed under a big decorative chart hero.

OWN-WORLD: Paper #FBF9FF ground, Violeta #46216D rail and primary actions, white cards on 1px #E6DDF5 hairlines with a small Violeta header tab label, Martian Mono tabular numerals for every value, Turquesa #19CECE only as fills for logged segments and the second chart series, Lavanda #A07DFF for selection and the chart line. Funnel Display for headings, Funnel Sans for UI.

STORY: The patient opens Today and instantly reads "2 of 4 logged", the two values, and the two empty slots. They tap an empty slot, enter a number, and the score line updates. Reports read as three innings summaries for a date. Errors appear next to the field in the brief's exact words.

FIRST VIEWPORT: Mobile 390: Violeta top bar with wordmark and the four-segment motif; date row (previous, date, next disabled on today); score line "2 of 4 logged" beside a four-segment Turquesa bar; DayStrip as a 2x2 grid of slot tiles, filled tiles showing the value at 2.4rem in Martian Mono with "mg/dl", edit and delete; empty tiles dashed with an Add action. Below: the day's score row (Highest, Lowest, Average, Readings). Desktop 960+: 248px Violeta sidebar, DayStrip four across, content max 1040px.

FORM: Cricket scorecard, position 7 of 7 on the grounded list (1 clinic glucose logbook, 2 weekly pill organizer, 3 pathology lab report, 4 wall-calendar tick-off, 5 thali with four katoris, 6 OPD prescription slip, 7 cricket scorecard). Seed key ec375f0f.

RAISES (each challenger declined on audience identification and product clarity; one discipline kept from each):

- From the midnight transit diagram: chart series one per slot with distinct marker shapes and fixed-size labels, so colour is never the only cue.
- From Japanese high-density web: cards carry a small header tab and hairline rules; stats pack tight in a 2x2 or 4-up grid with no inflated whitespace.
- From the lexicon shoulder and plate: History names the span in view as guide words above the list ("15 Oct to 9 Oct 2026").
- From the doujin catalog: the DayStrip repacks in whole cells (four across, then 2x2), never squeezed.
- From the cassette j-card: capacity is visible; a full day says "All 4 logged" and the Add action disappears.
- From Ikeda datamatics: focusing one chart series in the legend dims the others.

SIGNATURE MOVE: the score line, a compact Martian Mono row that summarises a day or range like a live score, used on Today and as each report card's header.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
