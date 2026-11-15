import { UUID } from '../../../contexts/modules/UUID';
import { C, parseAmount } from '../../../modules';

const {
  INTERNAL_TRANSFER,
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

export const createTransfer = async ({
  props: { account = {} },
  state: {
    form: { from, to, exchange, value },
  },
  store: { createTx, deleteTx },
}) => {
  const transferId = UUID({ entity: 'transfer', from: account.hash, to: to?.hash, value, at: Date.now() });

  const origin = await createTx({
    account: account.hash,
    category: INTERNAL_TRANSFER,
    title: to.title,
    type: EXPENSE,
    value: parseAmount(value),
    meta: { kind: 'transfer', transferId, leg: 'from' },
  });

  if (!origin) return undefined;

  let destination;
  try {
    destination = await createTx({
      account: to.hash,
      category: INTERNAL_TRANSFER,
      title: from.title,
      type: INCOME,
      value: parseAmount(exchange),
      meta: { kind: 'transfer', transferId, leg: 'to' },
    });
  } catch (error) {
    destination = undefined;
  }

  if (!destination) {
    await deleteTx?.({ hash: origin.hash });
    return undefined;
  }

  return destination;
};
