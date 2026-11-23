// Who is logged in. The answer comes from GET /api/auth/me (the cookie is httpOnly, so the page
// cannot read it) and lives in the TanStack Query cache under ['me'].
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.js';
import { setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);
const ME_KEY = ['me'];

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  // Forget everything cached for the previous user, then mark nobody as logged in.
  const clearSession = useCallback(() => {
    queryClient.clear();
    queryClient.setQueryData(ME_KEY, null);
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const user = await authApi.login(credentials);
      queryClient.setQueryData(ME_KEY, user);
      return user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (details) => {
      const user = await authApi.register(details);
      queryClient.setQueryData(ME_KEY, user);
      return user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user: me.data ?? null,
      isLoading: me.isPending,
      error: me.error,
      retry: me.refetch,
      login,
      register,
      logout,
    }),
    [me.data, me.isPending, me.error, me.refetch, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** Where a user lands after logging in. */
export function homePathFor(user) {
  return user?.role === 'doctor' ? '/doctor' : '/';
}
