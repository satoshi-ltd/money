import { median } from './median';

export default (values = []) => {
  if (values.length <= 1) return { min: 0, max: 0 };

  const previousMonths = values.slice(0, -1);

  const max = Math.floor(Math.max(...previousMonths));
  let min = 0;
  let med = 0;

  if (max > 0) {
    min = Math.floor(Math.min(...previousMonths));
    med = median(previousMonths);
  }

  return {
    min,
    med: med !== max && med !== min ? med : undefined,
    max,
  };
};
