import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const DEFAULT_INTERVAL = 60 * 1000;

const dayStamp = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const useToday = (interval = DEFAULT_INTERVAL) => {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const sync = () => setToday((prev) => (dayStamp(prev) === dayStamp(new Date()) ? prev : new Date()));

    const intervalId = setInterval(sync, interval);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') sync();
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [interval]);

  return today;
};
