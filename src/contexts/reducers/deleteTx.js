export const deleteTx = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('txs');

  await store.remove({ hash });
  setState({ ...state, txs: await store.value });
};
