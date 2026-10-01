import { parseTx, saveSettings } from './modules';
import { learnAutoAccount, learnAutoCategory } from '../../modules';

export const updateTx = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  const collection = store.get('txs');
  const tx = collection.findOne({ hash });
  if (!tx) return undefined;

  await collection.update({ hash }, parseTx({ ...tx, ...data }));
  const txs = collection.value;
  const nextTx = collection.findOne({ hash });

  const nextAutoCategory = nextTx?.category !== undefined ? learnAutoCategory(settings.autoCategory, nextTx) : undefined;
  const nextAutoAccount = nextTx?.account ? learnAutoAccount(settings.autoAccount, nextTx) : undefined;
  if (nextAutoCategory || nextAutoAccount) {
    const nextSettings = {
      ...settings,
      ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
      ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
    };
    const settings = await saveSettings(store, nextSettings);
    setState((prev) => ({ ...prev, txs, settings }));
    return nextTx;
  }

  setState((prev) => ({ ...prev, txs }));

  return nextTx;
};
