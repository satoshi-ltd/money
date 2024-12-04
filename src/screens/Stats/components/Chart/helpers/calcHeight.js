export const calcHeight = (value, { min = 0, max }) =>
  value === 0 ? value : Math.floor(((value - min) * 100) / (max - min));
