import { validateBackupPayload } from '../backupValidation';

describe('services/backupValidation', () => {
  test('accepts valid payloads and defaults missing scheduled txs', () => {
    const result = validateBackupPayload({
      accounts: [],
      settings: { theme: 'dark' },
      txs: [],
    });

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      accounts: [],
      scheduledTxs: [],
      schemaVersion: undefined,
      settings: { theme: 'dark' },
      txs: [],
    });
  });

  test('accepts serialized json payloads', () => {
    const result = validateBackupPayload(
      JSON.stringify({
        accounts: [{ hash: 'a1' }],
        scheduledTxs: [],
        schemaVersion: '3',
        settings: { baseCurrency: 'USD' },
        txs: [],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.value.schemaVersion).toBe(3);
  });

  test('rejects invalid json and wrong top-level shapes', () => {
    expect(validateBackupPayload('{')).toEqual({ ok: false, reason: 'invalid_json' });
    expect(validateBackupPayload([])).toEqual({ ok: false, reason: 'invalid_root' });
  });

  test('rejects incompatible backup shapes', () => {
    expect(validateBackupPayload({ accounts: {}, settings: {}, txs: [] })).toEqual({
      ok: false,
      reason: 'invalid_accounts',
    });
    expect(validateBackupPayload({ accounts: [], settings: [], txs: [] })).toEqual({
      ok: false,
      reason: 'invalid_settings',
    });
    expect(validateBackupPayload({ accounts: [], settings: {}, txs: {}, scheduledTxs: [] })).toEqual({
      ok: false,
      reason: 'invalid_txs',
    });
  });

  const base = {
    accounts: [{ hash: 'a1', currency: 'EUR' }],
    settings: { baseCurrency: 'EUR' },
    txs: [{ hash: 't1', account: 'a1', type: 0, value: 4 }],
  };
  const schedule = { id: 's1', account: 'a1', type: 0, value: 9, pattern: { kind: 'weekly', interval: 1, byWeekday: [4] } };

  test('accepts a backup whose schedules and transactions all point at its accounts', () => {
    expect(validateBackupPayload({ ...base, scheduledTxs: [schedule, { ...schedule, id: 's2', pattern: { kind: 'monthly', byMonthDay: 31 } }] }).ok).toBe(true);
  });

  test.each([
    ['a transaction on an unknown account', { txs: [{ ...base.txs[0], account: 'ghost' }] }, 'invalid_tx_record'],
    ['a transaction amount that is not a number', { txs: [{ ...base.txs[0], value: 'abc' }] }, 'invalid_tx_record'],
    ['a transaction amount that is infinite', { txs: [{ ...base.txs[0], value: Infinity }] }, 'invalid_tx_record'],
    ['a transaction that is null', { txs: [null] }, 'invalid_tx_record'],
    ['a transaction of a type that does not exist', { txs: [{ ...base.txs[0], type: 7 }] }, 'invalid_tx_record'],
    ['a transaction date that is not a number', { txs: [{ ...base.txs[0], timestamp: 'yesterday' }] }, 'invalid_tx_record'],
    ['an account that is not an object', { accounts: ['a1'] }, 'invalid_account_record'],
    ['an account without a hash', { accounts: [{ currency: 'EUR' }] }, 'invalid_account_record'],
    ['an account whose currency is not a code', { accounts: [{ hash: 'a1', currency: { code: 'EUR' } }] }, 'invalid_account_record'],
    ['an opening balance that is not a number', { accounts: [{ hash: 'a1', balance: 'lots' }] }, 'invalid_account_record'],
    ['two accounts with the same hash', { accounts: [base.accounts[0], base.accounts[0]] }, 'invalid_account_record'],
    ['a schedule with no account at all', { scheduledTxs: [{ ...schedule, account: undefined }] }, 'invalid_scheduled_record'],
    ['a schedule that repeats on a weekday that does not exist', { scheduledTxs: [{ ...schedule, pattern: { kind: 'weekly', byWeekday: [9] } }] }, 'invalid_scheduled_record'],
    ['a schedule with an unknown recurrence', { scheduledTxs: [{ ...schedule, pattern: { kind: 'daily' } }] }, 'invalid_scheduled_record'],
    ['a schedule on day 40 of the month', { scheduledTxs: [{ ...schedule, pattern: { kind: 'monthly', byMonthDay: 40 } }] }, 'invalid_scheduled_record'],
    ['two schedules with the same id', { scheduledTxs: [schedule, schedule] }, 'invalid_scheduled_record'],
  ])('rejects %s, so nothing of the backup is imported', (_label, change, reason) => {
    expect(validateBackupPayload({ ...base, ...change })).toEqual({ ok: false, reason });
  });

  test('keeps accepting what the app itself wrote before: text balances and amounts, no schedules, retired settings', () => {
    const result = validateBackupPayload({
      accounts: [{ hash: 'a1', currency: 'USD', balance: '12.5', timestamp: 1500000000000, title: 'Cash' }],
      schemaVersion: 3,
      settings: { baseCurrency: 'USD', autoAccount: 'a1', budgets: { 1: 20 } },
      txs: [{ hash: 't1', account: 'a1', type: 1, value: '3.2', category: 99, meta: { moved: true } }],
    });

    expect(result.ok).toBe(true);
  });

  test('a ledger the app itself reached still exports and imports: a retired currency, repeated tx hashes, nulls where a field was never set', () => {
    const result = validateBackupPayload({
      ...base,
      accounts: [{ hash: 'a1', currency: 'RUB', balance: 10, title: null }],
      txs: [base.txs[0], { ...base.txs[0], category: null, meta: null }],
    });

    expect(result.ok).toBe(true);
  });

  test('a schedule whose account was deleted long ago is dropped from the import, not a reason to refuse the file', () => {
    const result = validateBackupPayload({ ...base, scheduledTxs: [schedule, { ...schedule, id: 'orphan', account: 'deleted' }] });

    expect(result.ok).toBe(true);
    expect(result.value.scheduledTxs.map(({ id }) => id)).toEqual(['s1']);
  });
});
