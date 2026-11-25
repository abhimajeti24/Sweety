import { describe, expect, it } from 'vitest';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, validateLogin, validateRegister } from '../src/index.js';

describe('demo accounts', () => {
  it('lists two patients and one doctor with unique emails', () => {
    expect(DEMO_ACCOUNTS.map((account) => account.role)).toEqual(['patient', 'patient', 'doctor']);
    expect(new Set(DEMO_ACCOUNTS.map((account) => account.email)).size).toBe(3);
  });

  it("uses credentials that pass the app's own login and register rules", () => {
    for (const account of DEMO_ACCOUNTS) {
      expect(validateLogin({ email: account.email, password: DEMO_PASSWORD }).ok).toBe(true);
      expect(
        validateRegister({ name: account.name, email: account.email, password: DEMO_PASSWORD }).ok,
      ).toBe(true);
    }
  });
});
