import { C } from '../../../../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export const getLastMonths = () => {
  const today = new Date();
  const originDate = new Date(today.getFullYear(), today.getMonth() - STATS_MONTHS_LIMIT, 1, 0, 0);
  const values = [];

  let index = 1;
  while (index <= STATS_MONTHS_LIMIT) {
    const date = new Date(originDate.getFullYear(), originDate.getMonth() + index, 1, 0, 0);

    values.push({ month: date.getMonth(), year: date.getFullYear() });
    index += 1;
  }

  return values;
};
