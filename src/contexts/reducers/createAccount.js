import { parseAccount } from './modules';

export const createAccount = async (data = {}, [state, setState]) => {
  const { store } = state;

  const collection = store.get('accounts');
  const account = await collection.save(parseAccount(data));
  const accounts = collection.value;
  setState((prev) => ({ ...prev, accounts }));

  return account;
};
