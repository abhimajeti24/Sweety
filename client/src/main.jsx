// Browser entry point: global styles, the query cache, routing, auth and toasts around the app.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.jsx';
import { ToastProvider } from './components/Toast/Toast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/global.css';

const MAX_RETRIES = 2;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry only when the server could not be reached or failed; a 4xx will not fix itself.
      retry: (failureCount, error) =>
        (error?.status === 0 || error?.status >= 500) && failureCount < MAX_RETRIES,
    },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
