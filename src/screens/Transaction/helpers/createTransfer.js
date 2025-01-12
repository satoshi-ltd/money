import { C } from '../../../modules';

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
  store: { createTx },
}) => {
  let block = await createTx({
    account: account.hash,
    category: INTERNAL_TRANSFER,
    title: to.title,
    type: EXPENSE,
    value: parseFloat(value, 10),
  });

  if (block) {
    block = await createTx({
      account: to.hash,
      category: INTERNAL_TRANSFER,
      title: from.title,
      type: INCOME,
      value: parseFloat(exchange, 10),
    });
  }

  return block;
};
