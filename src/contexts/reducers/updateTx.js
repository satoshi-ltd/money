import { parseTx } from './modules';

export const updateTx = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store } = state;

  store.get('txs');
  const tx = await store.findOne({ hash });
  if (!tx) return undefined;

  await store.update({ hash }, parseTx({ ...tx, ...data }));
  setState({ ...state, txs: await store.value });

  return await store.findOne({ hash });
};
