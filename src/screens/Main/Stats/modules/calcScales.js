import { median } from './median';

export default (values = []) => {
  if (!values) return {};

  const max = Math.floor(Math.max(...values));
  let min = 0;
  let med = 0;

  if (max > 0) {
    min = Math.floor(Math.min(...values));
    med = median(values);
  }

  return {
    min,
    med: med !== max && med !== min ? med : undefined,
    max,
  };
};
