import { Platform } from 'react-native';

const LOCALES = {
  default: { decimal: ',', thousands: '.' },
  'en-US': { decimal: '.', thousands: ',' },
  'en-EN': { decimal: '.', thousands: ',' },
};

const IS_WEB = Platform.OS === 'web';
const LEFT_SYMBOLS = ['$', '£'];

const MASK_SYMBOL = '*';

export const format = ({ currency, fixed = 2, locale, mask, operator = '', symbol, value: amount = 0 } = {}) => {
  let value;
  let leftSide = '';
  let rightSide = '';

  if (symbol && symbol.length > 0) {
    leftSide = LEFT_SYMBOLS.includes(symbol) ? symbol : '';
    rightSide = !LEFT_SYMBOLS.includes(symbol) ? symbol : '';
  } else if (currency && currency.length > 0) leftSide = `${currency}`;

  if (IS_WEB && Number.prototype.toLocaleString) {
    value = parseFloat(amount.toFixed(fixed)).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fixed,
    });
  } else {
    const { decimal, thousands } = LOCALES[locale] || LOCALES.default;

    const int = parseInt(Math.abs(amount || 0).toFixed(fixed), 10).toString();
    const intThousands = int.length > 3 ? int.length % 3 : 0;
    const strInt =
      (intThousands ? `${int.substr(0, intThousands)}${thousands}` : '') +
      int.substr(intThousands).replace(/(\d{3})(?=\d)/g, `$1${thousands}`);
    const strFloat =
      fixed && Math.abs(amount - int) > 0
        ? decimal +
          Math.abs(amount - int)
            .toFixed(fixed)
            .slice(2)
        : '';

    value = `${amount < 0 ? '-' : ''}${strInt}${strFloat}`;
  }

  return mask ? `${value}`.replace(/[0-9]/gi, MASK_SYMBOL) : `${operator}${leftSide}${value}${rightSide}`;
};
