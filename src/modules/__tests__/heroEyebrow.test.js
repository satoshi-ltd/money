import fs from 'fs';
import path from 'path';

import { accountBalanceEyebrow, netWorthEyebrow } from '../heroEyebrow';
import { setLanguage } from '../../i18n';
import { L10N } from '../l10n';

describe('modules/heroEyebrow', () => {
  afterEach(() => setLanguage('en'));

  test('the whole ledger reads as net worth, over how many accounts and in which currency', () => {
    expect(netWorthEyebrow({ accounts: 20, currency: 'USD' })).toBe(`${L10N.NET_WORTH} · 20 accounts · USD`);
  });

  // German capitalises nouns.
  test('the count keeps the language\'s own case', async () => {
    await setLanguage('de');

    expect(netWorthEyebrow({ accounts: 4, currency: 'USD' })).toBe('Gesamtvermögen · 4 Konten · USD');
    expect(netWorthEyebrow({ accounts: 1, currency: 'USD' })).toBe('Gesamtvermögen · 1 Konto · USD');
  });

  test('one account is singular', () => {
    expect(netWorthEyebrow({ accounts: 1, currency: 'EUR' })).toBe(`${L10N.NET_WORTH} · 1 account · EUR`);
  });

  test('a single account names its own scope too, in its own currency', () => {
    expect(accountBalanceEyebrow('THB')).toBe(`${L10N.ACCOUNT_BALANCE} · THB`);
  });

  test('the two never collide: one names the ledger, the other names an account', () => {
    expect(netWorthEyebrow({ accounts: 1, currency: 'EUR' })).not.toBe(accountBalanceEyebrow('EUR'));
  });

  test('no screen writes its own: three heroes showed the same figure under three different names', () => {
    const screens = path.join(__dirname, '..', '..', 'screens');
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
        return entry.name.endsWith('.jsx') ? [full] : [];
      });

    const handRolled = walk(screens).filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /L10N\.(NET_WORTH|ACCOUNT_BALANCE)\b/.test(source);
    });

    expect(handRolled).toEqual([]);
  });
});
