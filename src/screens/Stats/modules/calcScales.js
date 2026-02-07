import { median } from './median';

export default (values = []) => {
  if (values.length <= 1) return { min: 0, med: 0, max: 0 };

  const previousMonths = values.slice(0, -1);
  if (previousMonths.length === 0) return { min: 0, med: 0, max: 0 };

  const max = Math.max(...previousMonths);
  const min = Math.min(...previousMonths);
  const med = median(previousMonths);

  return {
    min,
    med: Number.isFinite(med) ? med : 0,
    max,
  };
};
