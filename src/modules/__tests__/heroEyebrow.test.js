import fs from 'fs';
import path from 'path';

import { accountBalanceEyebrow, netWorthEyebrow } from '../heroEyebrow';
import { L10N } from '../l10n';

describe('modules/heroEyebrow', () => {
  test('the whole ledger reads as net worth, over how many accounts and in which currency', () => {
    expect(netWorthEyebrow({ accounts: 20, currency: 'USD' })).toBe(`${L10N.NET_WORTH} · 20 accounts · USD`);
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
