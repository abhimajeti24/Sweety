// Before the browser tests: bring the app database up to date and load the demo data.
import { reseed } from './tests/helpers.js';

export default function globalSetup() {
  reseed({ migrate: true });
}
