import { parseAccount } from './modules';

export const updateAccount = async ({ hash, ...data } = {}, [state, setState]) => {
  const { store } = state;

  const collection = store.get('accounts');
  const account = collection.findOne({ hash });
  if (!account) return undefined;

  await collection.update({ hash }, parseAccount({ ...account, ...data }));
  const accounts = collection.value;
  setState((prev) => ({ ...prev, accounts }));

  return collection.findOne({ hash });
};
