import { parseTx } from './modules';
import { learnAutoAccount, learnAutoAmount, learnAutoCategory } from '../../modules';

export const createTx = async (data = {}, [state, setState]) => {
  const { store, settings = {} } = state;

  store.get('txs');
  const tx = await store.save(parseTx(data));
  const txs = await store.value;

  const nextAutoCategory = tx?.category !== undefined ? learnAutoCategory(settings.autoCategory, tx) : undefined;
  const nextAutoAccount = tx?.account ? learnAutoAccount(settings.autoAccount, tx) : undefined;
  const nextAutoAmount =
    tx?.account && Number.isFinite(tx?.value) && tx.value > 0 ? learnAutoAmount(settings.autoAmount, tx) : undefined;

  if (nextAutoCategory || nextAutoAccount || nextAutoAmount) {
    const nextSettings = {
      ...settings,
      ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
      ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
      ...(nextAutoAmount ? { autoAmount: nextAutoAmount } : null),
    };
    await store.get('settings').save(nextSettings);
    setState({ ...state, txs, settings: nextSettings });
    return tx;
  }

  setState({ ...state, txs });

  return tx;
};
