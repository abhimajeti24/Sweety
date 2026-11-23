// Route guards. They wait for GET /api/auth/me before deciding, so refreshing a logged-in page
// never flashes the login screen.
import { Navigate, Outlet, useLocation } from 'react-router';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import { ErrorState } from '../ErrorState/ErrorState.jsx';
import styles from './ProtectedRoute.module.css';

function SessionCheck() {
  return (
    <div className={styles.center} role="status">
      <span className={styles.pulse} aria-hidden="true" />
      <span className="visually-hidden">Checking your session</span>
    </div>
  );
}

function SessionError({ error, retry }) {
  return (
    <div className={styles.center}>
      <ErrorState message={error.message} onRetry={retry} />
    </div>
  );
}

/** Lets logged-in users with the right role through; sends everyone else to the right place. */
export function ProtectedRoute({ role }) {
  const { user, isLoading, error, retry } = useAuth();
  const location = useLocation();

  if (isLoading) return <SessionCheck />;
  if (error) return <SessionError error={error} retry={retry} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
}

/** Login and register: a logged-in user goes straight to their home page. */
export function GuestRoute() {
  const { user, isLoading, error, retry } = useAuth();
  if (isLoading) return <SessionCheck />;
  if (error) return <SessionError error={error} retry={retry} />;
  if (user) return <Navigate to={homePathFor(user)} replace />;
  return <Outlet />;
}
