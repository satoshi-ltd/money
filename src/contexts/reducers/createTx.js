import { parseTx } from './modules';

export const createTx = async (data = {}, [state, setState]) => {
  const { store } = state;

  const collection = store.get('txs');
  const tx = await collection.save(parseTx(data));
  const txs = collection.value;

  setState((prev) => ({ ...prev, txs }));

  return tx;
};
