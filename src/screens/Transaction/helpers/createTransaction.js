export const createTransaction = async ({
  props: { vault = {}, type },
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
    vault: vault.hash,
  });
