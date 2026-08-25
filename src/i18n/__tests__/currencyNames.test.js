import * as dictionaries from '../dictionaries';
import { C } from '../../modules';

const CODES = Object.keys(C.SYMBOL);
const LANGUAGES = Object.keys(dictionaries);

describe('i18n/CURRENCY_NAME', () => {
  // CAD shipped for years with no name, so the picker offered "CAD · CAD": every code needs a word in every language.
  test.each(LANGUAGES)('%s names every currency the app offers', (language) => {
    const missing = CODES.filter((code) => !dictionaries[language].CURRENCY_NAME[code]);

    expect(missing).toEqual([]);
  });

  test.each(LANGUAGES)('%s names no currency the app dropped', (language) => {
    const extra = Object.keys(dictionaries[language].CURRENCY_NAME).filter((code) => !CODES.includes(code));

    expect(extra).toEqual([]);
  });
});
