// Catches a crash while rendering a page, so one broken component shows a calm message with a way
// out instead of a blank screen. Error boundaries must be class components in React.
import { Component } from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { MESSAGES } from '@sweety/shared';
import { Button } from '../Button/Button.jsx';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.panel} role="alert">
        <h1>This page hit a problem</h1>
        <p className={styles.text}>{MESSAGES.serverError} Your readings are safe.</p>
        <Button icon={ArrowClockwiseIcon} onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </div>
    );
  }
}
