// Two panels on desktop (Violeta brand panel beside the form), one column on phones.
// The brand panel shows the product's idea in miniature: four slots, two logged.
import { SLOTS } from '@sweety/shared';
import { Wordmark } from '../Wordmark/Wordmark.jsx';
import styles from './AuthLayout.module.css';

const PREVIEW_LOGGED = 2;

export function AuthLayout({ title, documentTitle, intro, children }) {
  return (
    <div className={styles.layout}>
      <title>{documentTitle}</title>
      <aside className={styles.brand}>
        <Wordmark size="lg" />
        <p className={styles.tagline}>Four readings a day. One clear picture.</p>
        <ol className={styles.preview} aria-label="The four daily slots">
          {SLOTS.map((slot, index) => (
            <li key={slot.key} className={styles.previewSlot}>
              <span
                className={`${styles.previewBar} ${index < PREVIEW_LOGGED ? styles.previewLogged : ''}`}
                aria-hidden="true"
              />
              <span className={styles.previewLabel}>{slot.label}</span>
            </li>
          ))}
        </ol>
      </aside>
      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <h1>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

/** The login or register form. noValidate: our own messages replace the browser's tooltips. */
export function AuthForm({ onSubmit, children }) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {children}
    </form>
  );
}

/** "New to Sweety? Create an account" style link under the form. */
export function AuthSwitch({ children }) {
  return <p className={styles.switch}>{children}</p>;
}
