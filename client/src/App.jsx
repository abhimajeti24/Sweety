// The route table. Guests see login and register; patients and doctors each get their own pages.
import { Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell/AppShell.jsx';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx';
import { DoctorPatientPage } from './pages/DoctorPatientPage/DoctorPatientPage.jsx';
import { DoctorPatientsPage } from './pages/DoctorPatientsPage/DoctorPatientsPage.jsx';
import { HistoryPage } from './pages/HistoryPage/HistoryPage.jsx';
import { LoginPage } from './pages/LoginPage/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.jsx';
import { RegisterPage } from './pages/RegisterPage/RegisterPage.jsx';
import { ReportsPage } from './pages/ReportsPage/ReportsPage.jsx';
import { TodayPage } from './pages/TodayPage/TodayPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<ProtectedRoute role="patient" />}>
            <Route index element={<TodayPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute role="doctor" />}>
            <Route path="doctor" element={<DoctorPatientsPage />} />
            <Route path="doctor/patients/:id" element={<DoctorPatientPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
