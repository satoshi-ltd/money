export const createTransaction = async ({
  props: { account = {}, type },
  state: {
    form: { category, moved, timestamp, value, title = '' },
  },
  store: { createTx },
}) =>
  createTx({
    account: account.hash,
    category: parseInt(category, 10),
    // parseTx keeps `meta` and drops anything else it does not name, so the mark has to travel inside it.
    meta: moved ? { moved: true } : undefined,
    title,
    timestamp: timestamp || Date.now(),
    type,
    value: parseFloat(value, 10),
  });
