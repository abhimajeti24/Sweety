// The route table. Guests see login and register; patients and doctors each get their own pages.
import { Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell/AppShell.jsx';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';
import { LoginPage } from './pages/LoginPage/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.jsx';
import { RegisterPage } from './pages/RegisterPage/RegisterPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
