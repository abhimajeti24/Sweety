// The add/edit reading form. Runs the shared field rules and the day rules (four per day, one per
// slot) on submit, shows every error next to its field, and maps API errors back onto the fields.
import { useRef, useState } from 'react';
import { SLOTS, UNIT, validateReadingInput } from '@sweety/shared';
import { checkDayRules } from '../../lib/readingRules.js';
import { focusFirstError, splitApiError } from '../../lib/forms.js';
import { Button } from '../Button/Button.jsx';
import { ErrorState } from '../ErrorState/ErrorState.jsx';
import { Field, FormErrorAnnouncer } from '../Field/Field.jsx';
import styles from './ReadingForm.module.css';

const FIELDS = ['date', 'slot', 'value'];

/**
 * @param {object} props
 * @param {{ date: string, slot: string, value: string | number }} props.initialValues
 * @param {string} props.today 'YYYY-MM-DD' in the browser timezone; also the date input's max
 * @param {Array<{ id: number, slot: string }>} [props.dayReadings] readings already on the chosen date
 * @param {number | null} [props.editingId] id of the reading being edited
 * @param {(date: string) => void} [props.onDateChange] lets the parent load readings for a new date
 * @param {(data: { date: string, slot: string, value: number }) => Promise<void>} props.onSubmit
 * @param {() => void} [props.onCancel]
 */
export function ReadingForm({
  initialValues,
  today,
  dayReadings,
  editingId = null,
  onDateChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save reading',
}) {
  const [values, setValues] = useState({
    ...initialValues,
    value: String(initialValues.value ?? ''),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pending, setPending] = useState(false);
  const refs = { date: useRef(null), slot: useRef(null), value: useRef(null) };

  const takenSlots = new Set(
    (dayReadings ?? [])
      .filter((reading) => reading.id !== editingId)
      .map((reading) => reading.slot),
  );

  function update(name) {
    return (event) => {
      const next = event.target.value;
      setValues((current) => ({ ...current, [name]: next }));
      // Editing a field clears its message; the date also clears the daily-limit message on it.
      setErrors((current) => {
        const { [name]: _removed, ...rest } = current;
        return rest;
      });
      if (name === 'date') onDateChange?.(next);
    };
  }

  function showErrors(fieldErrors) {
    setErrors(fieldErrors);
    focusFirstError(fieldErrors, FIELDS, refs);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const result = validateReadingInput(values, { today });
    if (!result.ok) return showErrors(result.fields);

    if (dayReadings) {
      const ruleErrors = checkDayRules(result.data, dayReadings, editingId);
      if (Object.keys(ruleErrors).length > 0) return showErrors(ruleErrors);
    }

    setPending(true);
    try {
      await onSubmit(result.data);
    } catch (error) {
      const { fieldErrors, formError: message } = splitApiError(error, FIELDS);
      setFormError(message);
      showErrors(fieldErrors);
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {formError && <ErrorState message={formError} />}
      <FormErrorAnnouncer errors={errors} />

      <Field id="reading-date" label="Date" error={errors.date}>
        {(props) => (
          <input
            {...props}
            ref={refs.date}
            type="date"
            max={today}
            value={values.date}
            onChange={update('date')}
          />
        )}
      </Field>

      <Field id="reading-slot" label="Time slot" error={errors.slot}>
        {(props) => (
          <select {...props} ref={refs.slot} value={values.slot} onChange={update('slot')}>
            <option value="" disabled>
              Choose a time slot
            </option>
            {SLOTS.map((slot) => (
              <option key={slot.key} value={slot.key}>
                {takenSlots.has(slot.key) ? `${slot.label} (logged)` : slot.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field id="reading-value" label="Glucose value" suffix={UNIT} error={errors.value}>
        {(props) => (
          <input
            {...props}
            ref={refs.value}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            data-autofocus
            value={values.value}
            onChange={update('value')}
          />
        )}
      </Field>

      <div className={styles.actions}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" pending={pending} pendingLabel="Saving...">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
