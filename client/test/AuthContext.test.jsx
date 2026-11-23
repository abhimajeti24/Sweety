import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx';

vi.mock('../src/api/auth.js', () => ({
  fetchCurrentUser: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Demo Patient',
    email: 'demo@sweety.test',
    role: 'patient',
  }),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn().mockResolvedValue(null),
}));

function WhoAmI() {
  const { user, isLoading, logout } = useAuth();
  if (isLoading) return <p>Checking</p>;
  return (
    <>
      <p>{user ? `Signed in as ${user.name}` : 'Signed out'}</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </>
  );
}

describe('AuthContext', () => {
  it('shows nobody as logged in straight after logout, and forgets cached data', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['readings', 'day', '2026-10-15'], [{ id: 1 }]);
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WhoAmI />
        </AuthProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Signed in as Demo Patient')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByText('Signed out')).toBeInTheDocument();
    expect(queryClient.getQueryData(['readings', 'day', '2026-10-15'])).toBeUndefined();
  });
});
