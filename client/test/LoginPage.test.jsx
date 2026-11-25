import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { login } from '../src/api/auth.js';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { LoginPage } from '../src/pages/LoginPage/LoginPage.jsx';

vi.mock('../src/api/auth.js', () => ({
  fetchCurrentUser: vi.fn().mockResolvedValue(null),
  login: vi.fn().mockResolvedValue({
    id: 3,
    name: 'Dr. Meera Rao',
    email: 'doctor@sweety.test',
    role: 'doctor',
  }),
  register: vi.fn(),
  logout: vi.fn(),
}));

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('LoginPage demo accounts', () => {
  it('shows every demo login with its password', () => {
    renderLogin();
    const panel = screen.getByRole('region', { name: 'Demo accounts' });
    for (const email of ['demo@sweety.test', 'ravi@sweety.test', 'doctor@sweety.test']) {
      expect(panel).toHaveTextContent(email);
    }
    expect(screen.getAllByText('SweetyDemo#2026')).toHaveLength(3);
  });

  it('fills the form from a demo account and logs in with it', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Use the Dr. Meera Rao login' }));

    expect(screen.getByLabelText('Email')).toHaveValue('doctor@sweety.test');
    expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('SweetyDemo#2026');
    const submit = screen.getByRole('button', { name: 'Log in' });
    expect(submit).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(login).toHaveBeenCalledWith({
      email: 'doctor@sweety.test',
      password: 'SweetyDemo#2026',
    });
  });
});
