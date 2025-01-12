export const deleteAccount = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.findOne({ hash });
  if (!account) return undefined;

  await store.remove({ hash });
  await store.get('txs').remove({ account: hash });

  setState({
    ...state,
    account: await store.get('accounts').value,
    txs: await store.get('txs').value,
  });
};
