import { parseTx } from './modules';
import { learnAutoCategory } from '../../modules';

export const updateTx = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  store.get('txs');
  const tx = await store.findOne({ hash });
  if (!tx) return undefined;

  await store.update({ hash }, parseTx({ ...tx, ...data }));
  const txs = await store.value;
  const nextTx = await store.findOne({ hash });

  if (nextTx?.category !== undefined) {
    const nextCatalog = learnAutoCategory(settings.autoCategory, nextTx);
    const nextSettings = { ...settings, autoCategory: nextCatalog };
    await store.get('settings').save(nextSettings);
    setState({ ...state, txs, settings: nextSettings });
    return nextTx;
  }

  setState({ ...state, txs });

  return nextTx;
};
