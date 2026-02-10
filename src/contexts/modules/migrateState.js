import { DEFAULTS, SCHEMA_VERSION } from '../store.constants';

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const normalizeScheduled = (item = {}) => {
  // Drop legacy scheduled fields if present (we keep scheduled items "active-only").
  const rest = { ...(item || {}) };
  delete rest.endedAt;
  delete rest.pausedAt;
  delete rest.status;
  return rest;
};

export const migrateState = ({ accounts, scheduledTxs, schemaVersion, settings, txs } = {}) => {
  const resolvedSettings = {
    ...DEFAULTS.settings,
    ...(settings || {}),
    autoCategory: {
      ...DEFAULTS.settings.autoCategory,
      ...(settings?.autoCategory || {}),
    },
  };
  const resolvedSchemaVersion = Number.isFinite(resolvedSettings.schemaVersion)
    ? resolvedSettings.schemaVersion
    : schemaVersion;

  let nextSchemaVersion = Number.isFinite(resolvedSchemaVersion) ? resolvedSchemaVersion : 0;

  if (nextSchemaVersion < SCHEMA_VERSION) {
    // Future migrations go here.
    nextSchemaVersion = SCHEMA_VERSION;
  }

  return {
    accounts: ensureArray(accounts),
    scheduledTxs: ensureArray(scheduledTxs)
      .filter((item) => item?.status !== 'paused' && item?.status !== 'ended')
      .map(normalizeScheduled),
    settings: { ...resolvedSettings, schemaVersion: nextSchemaVersion },
    txs: ensureArray(txs),
  };
};
