// Shown for any address that does not match a page.
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { ButtonLink } from '../../components/Button/Button.jsx';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const { user } = useAuth();
  return (
    <section className={styles.page}>
      <title>Page not found | Sweety</title>
      <h1>We could not find that page</h1>
      <p className={styles.text}>The address may be mistyped, or the page has moved.</p>
      <ButtonLink to={homePathFor(user)} variant="secondary" icon={ArrowLeftIcon}>
        Back to {user?.role === 'doctor' ? 'patients' : 'today'}
      </ButtonLink>
    </section>
  );
}
