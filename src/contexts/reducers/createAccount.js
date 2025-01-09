import { parseAccount } from '../modules';

export const createAccount = async (data = {}, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.save(parseAccount(data));
  setState({ ...state, accounts: await store.value });

  return account;
};
