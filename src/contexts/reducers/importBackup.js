export const importBackup = async ({ accounts = [], settings = {}, txs = [] } = {}, [state, setState]) => {
  const { store } = state;

  await store.wipe('accounts');
  await store.wipe('settings');
  await store.wipe('txs');
  await store.get('accounts').save(accounts);
  await store.get('settings').save(settings);
  await store.get('txs').save(txs);

  setState({
    ...state,
    settings,
    accounts,
    txs,
  });
};
