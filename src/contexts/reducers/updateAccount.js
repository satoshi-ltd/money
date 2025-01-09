import { parseAccount } from './modules';

export const updateAccount = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.findOne({ hash });
  if (!account) return undefined;

  await store.update({ hash }, parseAccount({ ...account, ...data }));
  setState({ ...state, accounts: await store.value });

  return await store.findOne({ hash });
};
