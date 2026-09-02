import { isInternalTransfer } from './isInternalTransfer';

// Money that moved rather than being earned or spent: a swap between own accounts, or a transaction whose
// owner marked it so. It belongs to the balances, never to the figures that read a month.
export const isMovement = (tx = {}) => isInternalTransfer(tx) || tx.meta?.moved === true;
