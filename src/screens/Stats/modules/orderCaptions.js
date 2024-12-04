import { C } from '../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export default ({ MONTHS }) => {
  const now = new Date();
  const originDate = new Date(now.getFullYear(), now.getMonth() - STATS_MONTHS_LIMIT, 1, 0, 0);

  return new Array(STATS_MONTHS_LIMIT).fill('').map((caption, index) => {
    const date = new Date(originDate.getFullYear(), originDate.getMonth() + index + 1, 1, 0, 0);

    return MONTHS[date.getMonth()];
  });
};
