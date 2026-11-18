import { C } from '../../modules';

const MAX_TYPE = Math.max(...Object.values(C.TX.TYPE));

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const toSchemaVersion = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
};

const isNumeric = (value) =>
  typeof value === 'number' ? Number.isFinite(value) : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));
const isText = (value) => typeof value === 'string' && value.length > 0;
const isInRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const isOptional = (value, check) => value === undefined || value === null || check(value);

const hasUniqueIds = (records, key) => {
  const ids = records.map((record) => record[key]).filter((id) => id !== undefined);
  return new Set(ids).size === ids.length;
};

const validAccount = (account) =>
  isPlainObject(account) &&
  isText(account.hash) &&
  isOptional(account.currency, (value) => typeof value === 'string' && /^[A-Za-z0-9]{2,10}$/.test(value)) &&
  isOptional(account.balance, isNumeric) &&
  isOptional(account.timestamp, Number.isFinite) &&
  isOptional(account.title, (value) => typeof value === 'string');

const validTx = (tx, accountIds) =>
  isPlainObject(tx) &&
  isOptional(tx.hash, isText) &&
  accountIds.has(tx.account) &&
  isInRange(tx.type, 0, MAX_TYPE) &&
  isNumeric(tx.value) &&
  isOptional(tx.timestamp, Number.isFinite) &&
  isOptional(tx.category, Number.isFinite) &&
  isOptional(tx.title, (value) => typeof value === 'string') &&
  isOptional(tx.meta, isPlainObject);

const validPattern = (pattern) =>
  isPlainObject(pattern) &&
  isOptional(pattern.kind, (value) => value === 'weekly' || value === 'monthly') &&
  isOptional(pattern.interval, (value) => isInRange(value, 1, 365)) &&
  isOptional(pattern.byMonthDay, (value) => isInRange(value, 1, 31)) &&
  isOptional(pattern.byWeekday, (value) => Array.isArray(value) && value.every((day) => isInRange(day, 0, 6)));

const validScheduled = (item) =>
  isPlainObject(item) &&
  isOptional(item.id, isText) &&
  isText(item.account) &&
  isInRange(item.type, 0, MAX_TYPE) &&
  isNumeric(item.value) &&
  isOptional(item.startAt, Number.isFinite) &&
  isOptional(item.category, Number.isFinite) &&
  isOptional(item.title, (value) => typeof value === 'string') &&
  isOptional(item.pattern, validPattern);

const invalidRecords = ({ accounts, scheduledTxs, txs }) => {
  if (!accounts.every(validAccount) || !hasUniqueIds(accounts, 'hash')) return 'invalid_account_record';
  const accountIds = new Set(accounts.map(({ hash }) => hash));
  if (!txs.every((tx) => validTx(tx, accountIds))) return 'invalid_tx_record';
  if (!scheduledTxs.every(validScheduled) || !hasUniqueIds(scheduledTxs, 'id')) return 'invalid_scheduled_record';
  return undefined;
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

  const reason = invalidRecords({
    accounts,
    scheduledTxs: Array.isArray(scheduledTxs) ? scheduledTxs : [],
    txs,
  });
  if (reason) return { ok: false, reason };

  const accountIds = new Set(accounts.map(({ hash }) => hash));

  return {
    ok: true,
    value: {
      accounts: [...accounts],
      scheduledTxs: (Array.isArray(scheduledTxs) ? scheduledTxs : []).filter(({ account }) => accountIds.has(account)),
      schemaVersion: toSchemaVersion(schemaVersion),
      settings: { ...settings },
      txs: [...txs],
    },
  };
};
