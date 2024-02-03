export const createTransaction = async ({
  props: { account = {}, type },
  state: {
    form: { category, value, title = '' },
  },
  store: { addTx },
}) =>
  addTx({
    category: parseInt(category, 10),
    title,
    type,
    value: parseFloat(value, 10),
    // ! TODO: Somehow we have data con `tx.vault` but should be `tx.account`
    vault: account.hash,
  });
