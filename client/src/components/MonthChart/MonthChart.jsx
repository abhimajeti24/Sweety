// Line chart of a month's readings: day of month across, mg/dl up, one line per slot. Each slot
// has its own colour AND marker shape, the legend can focus one slot, and a table view lists every
// value, so nothing depends on colour or hover alone.
import { useId, useMemo, useState, useSyncExternalStore } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  RANGE_HIGH_ABOVE,
  RANGE_LOW_BELOW,
  SLOTS,
  UNIT,
  daysInMonth,
  formatMonthLabel,
} from '@sweety/shared';
import { EmptyState } from '../EmptyState/EmptyState.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import styles from './MonthChart.module.css';

const SERIES = [
  { ...SLOTS[0], color: 'var(--series-1)', shape: 'circle' },
  { ...SLOTS[1], color: 'var(--series-2)', shape: 'square' },
  { ...SLOTS[2], color: 'var(--series-3)', shape: 'triangle' },
  { ...SLOTS[3], color: 'var(--series-4)', shape: 'diamond' },
];
const MARKER = 4.5;
const NARROW_QUERY = '(max-width: 599px)';

function subscribeToNarrow(onChange) {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** True on phone-width screens, where the chart uses smaller markers. */
function useNarrowScreen() {
  return useSyncExternalStore(
    subscribeToNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}
const AXIS_TICK = { fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' };

/** True for a logged value; days with no reading in a slot are null. */
function hasValue(value) {
  return value !== null && value !== undefined;
}

/** A marker drawn as an SVG shape centred on (cx, cy), with a white ring so overlaps stay legible. */
function Marker({ cx, cy, shape, color, size = MARKER }) {
  if (cx === undefined || cy === undefined) return null;
  const ring = { stroke: 'var(--surface)', strokeWidth: 2, fill: color };
  if (shape === 'square') {
    return <rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} rx={1} {...ring} />;
  }
  if (shape === 'triangle') {
    const h = size * 1.2;
    return (
      <polygon
        points={`${cx},${cy - h} ${cx + h},${cy + h * 0.8} ${cx - h},${cy + h * 0.8}`}
        {...ring}
      />
    );
  }
  if (shape === 'diamond') {
    const d = size * 1.3;
    return (
      <polygon
        points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`}
        {...ring}
      />
    );
  }
  return <circle cx={cx} cy={cy} r={size} {...ring} />;
}

/** A legend swatch: the marker on a short line, as it appears in the plot. */
function Swatch({ series }) {
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden="true" focusable="false">
      <line x1="0" y1="7" x2="28" y2="7" stroke={series.color} strokeWidth="2" />
      <Marker cx={14} cy={7} shape={series.shape} color={series.color} size={4} />
    </svg>
  );
}

const TICK_STEP = 50;

/** Y axis bounds and ticks on round multiples of 50 that hold every value with some room. */
function yScale(values) {
  const low = Math.max(0, Math.floor((Math.min(...values) - 10) / TICK_STEP) * TICK_STEP);
  const high = Math.ceil((Math.max(...values) + 10) / TICK_STEP) * TICK_STEP;
  const ticks = [];
  for (let tick = low; tick <= high; tick += TICK_STEP) ticks.push(tick);
  return { domain: [low, high], ticks };
}

/** One row per day of the month with a column per slot (null where nothing was logged). */
function toRows(month, readings) {
  const [year, monthNumber] = month.split('-').map(Number);
  const rows = Array.from({ length: daysInMonth(year, monthNumber) }, (_, index) => ({
    day: index + 1,
  }));
  for (const reading of readings) {
    rows[Number(reading.date.slice(8, 10)) - 1][reading.slot] = reading.value;
  }
  return rows;
}

function ChartTooltip({ active, payload, label, monthLabel }) {
  if (!active || !payload?.length) return null;
  const values = new Map(payload.map((item) => [item.dataKey, item.value]));
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {label} {monthLabel}
      </p>
      <ul className={styles.tooltipList}>
        {SERIES.filter((series) => hasValue(values.get(series.key))).map((series) => (
          <li key={series.key}>
            <Swatch series={series} />
            <span>{series.label}</span>
            <span className="mono">{values.get(series.key)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * @param {object} props
 * @param {string} props.month 'YYYY-MM'
 * @param {object[] | undefined} props.readings undefined while loading
 * @param {boolean} [props.refreshing] dims the previous chart while a new month loads
 */
export function MonthChart({ month, readings, refreshing = false }) {
  const headingId = useId();
  const [focused, setFocused] = useState(null);
  const narrow = useNarrowScreen();
  const markerSize = narrow ? 3 : MARKER;
  const monthLabel = formatMonthLabel(month);
  const rows = useMemo(() => (readings ? toRows(month, readings) : []), [month, readings]);

  let body;
  if (!readings) {
    body = <Skeleton height={320} radius="var(--radius-control)" />;
  } else if (readings.length === 0) {
    body = <EmptyState compact message={`No readings in ${monthLabel} yet.`} />;
  } else {
    const values = readings.map((reading) => reading.value);
    const scale = yScale(values);
    const summary = `Line chart of ${readings.length} readings in ${monthLabel}, one line per time slot. Lowest ${Math.min(...values)} ${UNIT}, highest ${Math.max(...values)} ${UNIT}. The table below lists every value.`;
    body = (
      <>
        <div className={styles.legend} role="group" aria-label="Focus one time slot">
          {SERIES.map((series) => (
            <button
              key={series.key}
              type="button"
              className={styles.legendItem}
              aria-pressed={focused === series.key}
              onClick={() => setFocused((current) => (current === series.key ? null : series.key))}
            >
              <Swatch series={series} />
              <span>{series.label}</span>
            </button>
          ))}
        </div>
        <figure className={styles.figure} aria-label={summary}>
          <div className={styles.plot} aria-hidden="true">
            <ResponsiveContainer width="100%" height={320}>
              {/* The plot is visual only (the table below is its accessible twin), so Recharts'
                  keyboard layer is off: nothing focusable may sit inside aria-hidden. */}
              <LineChart
                data={rows}
                margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                accessibilityLayer={false}
              >
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <ReferenceArea
                  y1={RANGE_LOW_BELOW}
                  y2={RANGE_HIGH_ABOVE}
                  fill="var(--turquesa-50)"
                  fillOpacity={0.7}
                  ifOverflow="hidden"
                />
                <XAxis
                  dataKey="day"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                  interval="preserveStartEnd"
                  minTickGap={12}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  domain={scale.domain}
                  ticks={scale.ticks}
                />
                <Tooltip
                  content={<ChartTooltip monthLabel={monthLabel} />}
                  cursor={{ stroke: 'var(--field-border)', strokeWidth: 1 }}
                  isAnimationActive={false}
                />
                {SERIES.map((series) => {
                  const dimmed = focused !== null && focused !== series.key;
                  return (
                    <Line
                      key={series.key}
                      dataKey={series.key}
                      name={series.label}
                      stroke={series.color}
                      strokeWidth={2}
                      strokeOpacity={dimmed ? 0.15 : 1}
                      connectNulls
                      isAnimationActive={false}
                      dot={(props) => (
                        <g key={`${series.key}-${props.index}`} opacity={dimmed ? 0.15 : 1}>
                          <Marker
                            {...props}
                            shape={series.shape}
                            color={series.color}
                            size={markerSize}
                          />
                        </g>
                      )}
                      activeDot={
                        dimmed
                          ? false
                          : (props) => (
                              <Marker
                                {...props}
                                shape={series.shape}
                                color={series.color}
                                size={6}
                              />
                            )
                      }
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.bandKey} aria-hidden="true" />
            Shaded band: {RANGE_LOW_BELOW} to {RANGE_HIGH_ABOVE} {UNIT}, a general reference range
            for information only, not medical advice.
          </figcaption>
        </figure>
        <details className={styles.details}>
          <summary>Show the readings as a table</summary>
          <div
            className={styles.tableWrap}
            role="region"
            aria-label={`Readings in ${monthLabel}`}
            tabIndex={0}
          >
            <table className={styles.table}>
              <caption className="visually-hidden">
                Readings in {monthLabel} by day and time slot, in {UNIT}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  {SERIES.map((series) => (
                    <th key={series.key} scope="col">
                      {series.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((row) => SERIES.some((series) => hasValue(row[series.key])))
                  .map((row) => (
                    <tr key={row.day}>
                      <th scope="row" className="mono">
                        {row.day}
                      </th>
                      {SERIES.map((series) => (
                        <td key={series.key} className="mono">
                          {row[series.key] ?? <span className={styles.none}>none</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      </>
    );
  }

  return (
    <section
      className={`${styles.card} ${refreshing ? styles.refreshing : ''}`}
      aria-labelledby={headingId}
    >
      <header className={styles.header}>
        <h2 id={headingId}>{monthLabel}</h2>
        <p className={styles.unit}>Readings by day, {UNIT}</p>
      </header>
      {body}
    </section>
  );
}
