import { parseAccount } from '../reducers/modules';
import { DEFAULTS, RATES_SCHEMA, SCHEMA_VERSION } from '../store.constants';

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const normalizeScheduled = (item = {}) => {
  // Drop legacy scheduled fields if present (we keep scheduled items "active-only").
  const rest = { ...(item || {}) };
  delete rest.endedAt;
  delete rest.pausedAt;
  delete rest.status;
  return rest;
};

export const migrateState = ({ accounts, rates, scheduledTxs, schemaVersion, settings, txs } = {}) => {
  const resolvedSettings = {
    ...DEFAULTS.settings,
    ...(settings || {}),
    autoCategory: {
      ...DEFAULTS.settings.autoCategory,
      ...(settings?.autoCategory || {}),
    },
    autoAccount: {
      ...DEFAULTS.settings.autoAccount,
      ...(settings?.autoAccount || {}),
    },
    autoAmount: {
      ...DEFAULTS.settings.autoAmount,
      ...(settings?.autoAmount || {}),
    },
  };
  // Read before DEFAULTS lends its own: merged settings always look current, and the gate needs what was stored.
  const storedSchema = Number.isFinite(settings?.schemaVersion) ? settings.schemaVersion : schemaVersion;

  const resolvedSchemaVersion = Number.isFinite(resolvedSettings.schemaVersion)
    ? resolvedSettings.schemaVersion
    : schemaVersion;

  let nextSchemaVersion = Number.isFinite(resolvedSchemaVersion) ? resolvedSchemaVersion : 0;

  if (nextSchemaVersion < SCHEMA_VERSION) {
    // Future migrations go here.
    nextSchemaVersion = SCHEMA_VERSION;
  }

  return {
    accounts: ensureArray(accounts).map(parseAccount),
    rates: storedSchema >= RATES_SCHEMA ? rates : undefined,
    scheduledTxs: ensureArray(scheduledTxs)
      .filter((item) => item?.status !== 'paused' && item?.status !== 'ended')
      .map(normalizeScheduled),
    settings: { ...resolvedSettings, schemaVersion: nextSchemaVersion },
    txs: ensureArray(txs),
  };
};
