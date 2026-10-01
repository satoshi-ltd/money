import { parseTx } from './modules';

export const updateTx = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store } = state;

  const collection = store.get('txs');
  const tx = collection.findOne({ hash });
  if (!tx) return undefined;

  await collection.update({ hash }, parseTx({ ...tx, ...data }));
  const txs = collection.value;

  setState((prev) => ({ ...prev, txs }));

  return collection.findOne({ hash });
};
