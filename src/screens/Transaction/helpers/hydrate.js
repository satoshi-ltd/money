import { FORM } from '../../../modules';

const { TRANSFER } = FORM;

export const hydrate = ({ account, destination } = {}, accounts = []) => {
  const { currency } = accounts.find(({ hash }) => hash === account);
  const { currency: destinationCurrency = currency } = accounts.find(({ hash }) => hash === destination) || {};

  return {
    ...TRANSFER,
    value: { ...TRANSFER.value, currency },
    exchange: { ...TRANSFER.exchange, currency: destinationCurrency },
  };
};
