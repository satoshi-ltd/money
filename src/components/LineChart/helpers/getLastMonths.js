import { C } from '../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export const getLastMonths = (monthsLimit = STATS_MONTHS_LIMIT) => {
  if (!monthsLimit || monthsLimit <= 0) return [];
  const today = new Date();
  const originDate = new Date(today.getFullYear(), today.getMonth() - monthsLimit, 1, 0, 0);
  const values = [];

  let index = 1;
  while (index <= monthsLimit) {
    const date = new Date(originDate.getFullYear(), originDate.getMonth() + index, 1, 0, 0);

    values.push({ month: date.getMonth(), year: date.getFullYear() });
    index += 1;
  }

  return values;
};
