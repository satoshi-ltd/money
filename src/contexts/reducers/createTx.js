import { parseTx, saveSettings } from './modules';
import { learnAutoAccount, learnAutoCategory } from '../../modules';

export const createTx = async (data = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  const collection = store.get('txs');
  const tx = await collection.save(parseTx(data));
  const txs = collection.value;

  const nextAutoCategory = tx?.category !== undefined ? learnAutoCategory(settings.autoCategory, tx) : undefined;
  const nextAutoAccount = tx?.account ? learnAutoAccount(settings.autoAccount, tx) : undefined;
  if (nextAutoCategory || nextAutoAccount) {
    const nextSettings = {
      ...settings,
      ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
      ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
    };
    const settings = await saveSettings(store, nextSettings);
    setState((prev) => ({ ...prev, txs, settings }));
    return tx;
  }

  setState((prev) => ({ ...prev, txs }));

  return tx;
};
