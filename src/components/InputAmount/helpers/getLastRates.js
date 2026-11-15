export const getLastRates = (rates = {}) => {
  const keys = Object.keys(rates).sort();

  return keys.length === 0 ? rates : rates[keys[keys.length - 1]];
};
