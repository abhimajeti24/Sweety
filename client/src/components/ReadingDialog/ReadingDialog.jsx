// The add/edit dialog: loads the readings for the chosen date (so the form can pre-check the
// day rules), saves through the API, then closes with a "Reading saved." toast.
import { useState } from 'react';
import { slotLabel } from '@sweety/shared';
import {
  useCreateReading,
  useDayReadings,
  useToday,
  useUpdateReading,
} from '../../hooks/useReadings.js';
import { Dialog } from '../Dialog/Dialog.jsx';
import { ReadingForm } from '../ReadingForm/ReadingForm.jsx';
import { useToast } from '../Toast/Toast.jsx';

/**
 * Render only while open.
 * @param {object} props
 * @param {{ id: number, date: string, slot: string, value: number }} [props.reading] set when editing
 * @param {string} [props.defaultDate]
 * @param {string} [props.defaultSlot]
 * @param {() => void} props.onClose
 */
export function ReadingDialog({ reading, defaultDate, defaultSlot = '', onClose }) {
  const today = useToday();
  const editing = Boolean(reading);
  const initialValues = editing
    ? { date: reading.date, slot: reading.slot, value: reading.value }
    : { date: defaultDate ?? today, slot: defaultSlot, value: '' };

  const [date, setDate] = useState(initialValues.date);
  const dayReadings = useDayReadings(date);
  const createReading = useCreateReading();
  const updateReading = useUpdateReading();
  const { showToast } = useToast();

  async function handleSubmit(data) {
    if (editing) await updateReading.mutateAsync({ id: reading.id, reading: data });
    else await createReading.mutateAsync(data);
    showToast('Reading saved.');
    onClose();
  }

  const title = editing ? `Edit ${slotLabel(reading.slot)} reading` : 'Add a reading';

  return (
    <Dialog title={title} onClose={onClose}>
      <ReadingForm
        initialValues={initialValues}
        today={today}
        dayReadings={dayReadings.data}
        editingId={reading?.id ?? null}
        onDateChange={setDate}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
