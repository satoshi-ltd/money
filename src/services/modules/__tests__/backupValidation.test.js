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
});
