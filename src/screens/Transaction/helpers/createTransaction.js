export const createTransaction = async ({
  props: { account = {}, type },
  state: {
    form: { category, timestamp, value, title = '' },
  },
  store: { createTx },
}) =>
  createTx({
    account: account.hash,
    category: parseInt(category, 10),
    title,
    timestamp: timestamp || Date.now(),
    type,
    value: parseFloat(value, 10),
  });
