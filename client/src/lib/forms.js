// Small helpers shared by the forms.

/**
 * Moves keyboard focus to the first field that has an error, in the order the fields appear.
 * @param {Record<string, string>} errors
 * @param {string[]} order field names in visual order
 * @param {Record<string, { current: HTMLElement | null }>} refs
 */
export function focusFirstError(errors, order, refs) {
  const first = order.find((name) => errors[name]);
  if (first) refs[first]?.current?.focus();
}

/**
 * Splits an ApiError into messages for known fields and a message for the whole form.
 * @param {import('../api/client.js').ApiError} error
 * @param {string[]} knownFields
 */
export function splitApiError(error, knownFields) {
  const fieldErrors = {};
  for (const [name, message] of Object.entries(error.fields ?? {})) {
    if (knownFields.includes(name)) fieldErrors[name] = message;
  }
  const formError = Object.keys(fieldErrors).length > 0 ? null : error.message;
  return { fieldErrors, formError };
}
