// The date a page is showing, kept in the URL as ?date= so back, forward and refresh keep it.
import { useSearchParams } from 'react-router';
import { isValidIsoDate } from '@sweety/shared';

/**
 * ?date= when it is a real date not after today, otherwise today.
 * @param {string} today 'YYYY-MM-DD'
 * @returns {[string, (next: string) => void]}
 */
export function useSelectedDate(today) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('date');
  const date = isValidIsoDate(requested) && requested <= today ? requested : today;
  const setDate = (next) => setSearchParams(next === today ? {} : { date: next });
  return [date, setDate];
}
