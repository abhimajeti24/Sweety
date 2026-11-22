// Works out which timezone "today" means for this request. The browser sends its zone in the
// X-Timezone header; anything missing or unknown falls back to APP_TIMEZONE.
import { isValidTimeZone, todayInTimeZone } from '@sweety/shared';
import { config } from '../config.js';

export function timeZone(req, _res, next) {
  const requested = req.get('X-Timezone');
  req.timeZone = isValidTimeZone(requested) ? requested : config.appTimeZone;
  req.today = todayInTimeZone(req.timeZone);
  next();
}
