import { C } from '../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export default ({ MONTHS }, monthsLimit = STATS_MONTHS_LIMIT) => {
  if (!monthsLimit || monthsLimit <= 0) return [];
  const now = new Date();
  const originDate = new Date(now.getFullYear(), now.getMonth() - monthsLimit, 1, 0, 0);

  return new Array(monthsLimit).fill('').map((caption, index) => {
    const date = new Date(originDate.getFullYear(), originDate.getMonth() + index + 1, 1, 0, 0);

    return MONTHS[date.getMonth()];
  });
};
