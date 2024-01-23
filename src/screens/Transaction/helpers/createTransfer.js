import { C } from '../../../modules';

const {
  INTERNAL_TRANSFER,
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

export const createTransfer = async ({
  props: { vault = {} },
  state: {
    form: { from, to, exchange, value },
  },
  store: { addTx },
}) => {
  let block = await addTx({
    category: INTERNAL_TRANSFER,
    title: to.title,
    type: EXPENSE,
    value: parseFloat(value, 10),
    vault: vault.hash,
  });

  if (block) {
    block = await addTx({
      category: INTERNAL_TRANSFER,
      title: from.title,
      type: INCOME,
      value: parseFloat(exchange, 10),
      vault: to.hash,
    });
  }

  return block;
};
