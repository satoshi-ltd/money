import { parseTx } from './modules';
import { learnAutoAccount, learnAutoAmount, learnAutoCategory } from '../../modules';

export const updateTx = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  store.get('txs');
  const tx = await store.findOne({ hash });
  if (!tx) return undefined;

  await store.update({ hash }, parseTx({ ...tx, ...data }));
  const txs = await store.value;
  const nextTx = await store.findOne({ hash });

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
    await store.get('settings').save(nextSettings);
    setState({ ...state, txs, settings: nextSettings });
    return nextTx;
  }

  setState({ ...state, txs });

  return nextTx;
};
