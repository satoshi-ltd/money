const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const toSchemaVersion = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
};

export const validateBackupPayload = (input) => {
  let parsed = input;

  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input);
    } catch {
      return { ok: false, reason: 'invalid_json' };
    }
  }

  if (!isPlainObject(parsed)) return { ok: false, reason: 'invalid_root' };

  const { accounts, scheduledTxs, schemaVersion, settings, txs } = parsed;

  if (!Array.isArray(accounts)) return { ok: false, reason: 'invalid_accounts' };
  if (scheduledTxs !== undefined && !Array.isArray(scheduledTxs)) return { ok: false, reason: 'invalid_scheduled' };
  if (!isPlainObject(settings)) return { ok: false, reason: 'invalid_settings' };
  if (!Array.isArray(txs)) return { ok: false, reason: 'invalid_txs' };
  if (schemaVersion !== undefined && toSchemaVersion(schemaVersion) === undefined) {
    return { ok: false, reason: 'invalid_schema' };
  }

  return {
    ok: true,
    value: {
      accounts: [...accounts],
      scheduledTxs: Array.isArray(scheduledTxs) ? [...scheduledTxs] : [],
      schemaVersion: toSchemaVersion(schemaVersion),
      settings: { ...settings },
      txs: [...txs],
    },
  };
};
