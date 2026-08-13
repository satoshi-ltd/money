import { parseTx, saveSettings } from './modules';
import { learnAutoAccount, learnAutoAmount, learnAutoCategory } from '../../modules';

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
  const nextAutoAmount =
    nextTx?.account && Number.isFinite(nextTx?.value) && nextTx.value > 0 ? learnAutoAmount(settings.autoAmount, nextTx) : undefined;

  if (nextAutoCategory || nextAutoAccount || nextAutoAmount) {
    const nextSettings = {
      ...settings,
      ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
      ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
      ...(nextAutoAmount ? { autoAmount: nextAutoAmount } : null),
    };
    const settings = await saveSettings(store, nextSettings);
    setState((prev) => ({ ...prev, txs, settings }));
    return nextTx;
  }

  setState((prev) => ({ ...prev, txs }));

  return nextTx;
};
