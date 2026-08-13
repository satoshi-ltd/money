import { parseAccount } from './modules';

export const updateAccount = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.findOne({ hash });
  if (!account) return undefined;

  await store.update({ hash }, parseAccount({ ...account, ...data }));
  const accounts = await store.value;
  setState((prev) => ({ ...prev, accounts }));

  return await store.findOne({ hash });
};
