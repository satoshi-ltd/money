export const RANGE_ALL = 0;
export const RANGE_VALUES = [6, 12, RANGE_ALL];

export const selectedRange = (stored) => (RANGE_VALUES.includes(stored) ? stored : RANGE_ALL);
