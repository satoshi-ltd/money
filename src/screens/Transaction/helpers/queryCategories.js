import { C, L10N } from '../../../modules';

const { INTERNAL_TRANSFER } = C;
const INTERNAL_KEYS = [INTERNAL_TRANSFER.toString()];

const SORT = [
  // expenses order
  [1, 7, 8, 13, 9, 15, 6, 3, 4, 5, 10, 11, 12, 14],
  // incomes order
  [1, 5, 2, 3, 7, 8, 4, 6, 9],
];

export const queryCategories = ({ type }) =>
  SORT[type]
    .filter((key) => !INTERNAL_KEYS.includes(key))
    .map((key) => ({ key: parseInt(key), caption: L10N.CATEGORIES[type][key] }));
