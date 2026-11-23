import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/api/client.js';
import { ReadingForm } from '../src/components/ReadingForm/ReadingForm.jsx';

const TODAY = '2026-10-15';

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue(undefined);
  render(
    <ReadingForm
      initialValues={{ date: TODAY, slot: 'after_lunch', value: '' }}
      today={TODAY}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit, user: userEvent.setup() };
}

const save = () => screen.getByRole('button', { name: 'Save reading' });

describe('ReadingForm', () => {
  it('asks for a value and focuses the field when submitted empty', async () => {
    const { user, onSubmit } = renderForm();
    await user.click(save());

    const value = screen.getByLabelText('Glucose value');
    expect(screen.getByText('Please enter a glucose value.')).toBeInTheDocument();
    expect(value).toHaveFocus();
    expect(value).toHaveAttribute('aria-invalid', 'true');
    expect(value).toHaveAccessibleDescription(/Please enter a glucose value\./);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a value outside 40 to 600', async () => {
    const { user, onSubmit } = renderForm();
    await user.type(screen.getByLabelText('Glucose value'), '700');
    await user.click(save());

    expect(screen.getByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a 409 DUPLICATE_SLOT from the API under the slot field', async () => {
    const message = 'You already have an After lunch reading for this date.';
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError({ status: 409, code: 'DUPLICATE_SLOT', message, fields: { slot: message } }),
      );
    const { user } = renderForm({ onSubmit });
    await user.type(screen.getByLabelText('Glucose value'), '142');
    await user.click(save());

    const slot = screen.getByLabelText('Time slot');
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(slot).toHaveAccessibleDescription(message);
    expect(slot).toHaveFocus();
  });

  it('limits the date picker to today', () => {
    renderForm();
    expect(screen.getByLabelText('Date')).toHaveAttribute('max', TODAY);
  });

  it('checks the daily limit against readings already loaded, before calling the API', async () => {
    const dayReadings = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'].map(
      (slot, index) => ({ id: index + 1, slot }),
    );
    const { user, onSubmit } = renderForm({ dayReadings });
    await user.type(screen.getByLabelText('Glucose value'), '120');
    await user.click(save());

    expect(screen.getByText('You can add only 4 readings per day.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the parsed reading when everything is valid', async () => {
    const { user, onSubmit } = renderForm();
    await user.type(screen.getByLabelText('Glucose value'), ' 0142 ');
    await user.click(save());

    expect(onSubmit).toHaveBeenCalledWith({ date: TODAY, slot: 'after_lunch', value: 142 });
  });
});
