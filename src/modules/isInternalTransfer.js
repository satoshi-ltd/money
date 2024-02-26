import { C } from './constants';

const { INTERNAL_TRANSFER } = C;

export const isInternalTransfer = (tx = {}) => tx.category === INTERNAL_TRANSFER;
