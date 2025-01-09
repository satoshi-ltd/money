import { entropy } from './entropy';
import { UUID } from './UUID';

export const getFingerprint = () => {
  const values = {
    ...entropy,
    random: Math.floor(Math.random() * 2 ** 32),
    timestamp: new Date().getTime(),
  };

  return UUID(Object.values(values).join('-'));
};
