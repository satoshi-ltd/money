import { parseTx } from './modules';

export const createTx = async (data = {}, [state, setState]) => {
  const { store } = state;

  store.get('txs');
  const tx = await store.save(parseTx(data));
  setState({ ...state, txs: await store.value });

  return tx;
};
