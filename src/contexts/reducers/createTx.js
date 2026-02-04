import { parseTx } from './modules';
import { learnAutoCategory } from '../../modules';

export const createTx = async (data = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  store.get('txs');
  const tx = await store.save(parseTx(data));
  const txs = await store.value;

  if (tx?.category !== undefined) {
    const nextCatalog = learnAutoCategory(settings.autoCategory, tx);
    const nextSettings = { ...settings, autoCategory: nextCatalog };
    await store.get('settings').save(nextSettings);
    setState({ ...state, txs, settings: nextSettings });
    return tx;
  }

  setState({ ...state, txs });

  return tx;
};
