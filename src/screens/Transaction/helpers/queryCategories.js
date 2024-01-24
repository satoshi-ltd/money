import { C, L10N } from '../../../modules';

const { INTERNAL_TRANSFER } = C;
const INTERNAL_KEYS = [INTERNAL_TRANSFER.toString()];

export const queryCategories = ({ type }) =>
  Object.keys(L10N.CATEGORIES[type] || {})
    .filter((key) => !INTERNAL_KEYS.includes(key))
    .map((key) => ({ key: parseInt(key), caption: L10N.CATEGORIES[type][key] }));
