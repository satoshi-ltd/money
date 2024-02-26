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
  store: { addTx },
}) => {
  let block = await addTx({
    account: account.hash,
    category: INTERNAL_TRANSFER,
    title: to.title,
    type: EXPENSE,
    value: parseFloat(value, 10),
  });

  if (block) {
    block = await addTx({
      account: to.hash,
      category: INTERNAL_TRANSFER,
      title: from.title,
      type: INCOME,
      value: parseFloat(exchange, 10),
    });
  }

  return block;
};
