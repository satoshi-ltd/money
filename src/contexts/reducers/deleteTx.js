export const deleteTx = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('txs');

  await store.remove({ hash });
  const txs = await store.value;
  setState((prev) => ({ ...prev, txs }));
};
