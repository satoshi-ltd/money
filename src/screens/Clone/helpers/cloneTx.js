import { C } from '../../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE },
  },
  WIPE,
} = C;

export const cloneTx = async ({
  dataSource: { category, hash, value, vault, title, type },
  store: { addTx },
  wipe = false,
}) =>
  await addTx({
    category,
    title,
    type,
    value,
    vault: vault,
    ...(wipe ? { category: WIPE, tx: hash, type: type === EXPENSE ? INCOME : EXPENSE } : {}),
  });
