// The seeded demo accounts, listed under the login form so anyone trying the app can see each
// login and password, and fill them into the form with one click.
import { useId } from 'react';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@sweety/shared';
import { Button } from '../Button/Button.jsx';
import styles from './DemoAccounts.module.css';

/** Hidden only when the build sets VITE_SHOW_DEMO_ACCOUNTS=false (for a real deployment). */
export const SHOW_DEMO_ACCOUNTS = import.meta.env.VITE_SHOW_DEMO_ACCOUNTS !== 'false';

/**
 * @param {object} props
 * @param {(credentials: { email: string, password: string }) => void} props.onUse
 */
export function DemoAccounts({ onUse }) {
  const headingId = useId();
  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.heading}>
          Demo accounts
        </h2>
        <p className={styles.note}>Created by the seed script. Use one to fill in the form.</p>
      </div>
      <ul className={styles.list}>
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.key} className={styles.account}>
            <div className={styles.details}>
              <p className={styles.name}>{account.name}</p>
              <p className={styles.summary}>{account.summary}</p>
              <dl className={styles.credentials}>
                <div className={styles.credential}>
                  <dt>Login</dt>
                  <dd className="mono">{account.email}</dd>
                </div>
                <div className={styles.credential}>
                  <dt>Password</dt>
                  <dd className="mono">{DEMO_PASSWORD}</dd>
                </div>
              </dl>
            </div>
            <Button
              variant="secondary"
              size="sm"
              aria-label={`Use the ${account.name} login`}
              onClick={() => onUse({ email: account.email, password: DEMO_PASSWORD })}
            >
              Use
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
