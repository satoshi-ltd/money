export const createTransaction = async ({
  props: { account = {}, type },
  state: {
    form: { category, value, title = '' },
  },
  store: { createTx },
}) =>
  createTx({
    account: account.hash,
    category: parseInt(category, 10),
    title,
    type,
    value: parseFloat(value, 10),
  });
