// Layout for logged-in pages: a Violeta top bar on phones that becomes a left sidebar from 960px,
// with the main navigation and the account controls.
import { Suspense, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  ChartLineIcon,
  ListBulletsIcon,
  SignOutIcon,
  SunHorizonIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import { Wordmark } from '../Wordmark/Wordmark.jsx';
import styles from './AppShell.module.css';

const PATIENT_LINKS = [
  { to: '/', label: 'Today', icon: SunHorizonIcon, end: true },
  { to: '/history', label: 'History', icon: ListBulletsIcon },
  { to: '/reports', label: 'Reports', icon: ChartLineIcon },
];
const DOCTOR_LINKS = [{ to: '/doctor', label: 'Patients', icon: UsersThreeIcon }];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = user?.role === 'doctor' ? DOCTOR_LINKS : PATIENT_LINKS;
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // After moving to another page, put focus at the start of the new content so keyboard and
  // screen reader users do not have to travel back through the navigation.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <header className={styles.bar}>
        <div className={styles.brandRow}>
          <Wordmark />
          <button type="button" className={styles.logoutCompact} onClick={handleLogout}>
            <SignOutIcon size={20} weight="bold" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
        <nav className={styles.nav} aria-label="Main">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon size={22} weight="bold" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.account}>
          <p className={styles.accountName}>{user?.name}</p>
          <p className={styles.accountEmail}>{user?.email}</p>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            <SignOutIcon size={20} weight="bold" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </header>
      <main id="main" ref={mainRef} className={styles.main} tabIndex={-1}>
        {/* Keyed by path: a crash on one page clears when the user navigates away. */}
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<Skeleton height={240} radius="var(--radius-card)" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
