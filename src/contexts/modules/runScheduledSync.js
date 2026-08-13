import { parseTx } from '../reducers/modules';
import {
  C,
  eventEmitter,
  getOccurrencesBetween,
  L10N,
  learnAutoAccount,
  learnAutoAmount,
  learnAutoCategory,
} from '../../modules';
import { NotificationsService } from '../../services';

const { EVENT, MS_IN_DAY } = C;
const MAX_SCHEDULED_AUTOCREATE = 100;
const WINDOW_DAYS = 90;

export const runScheduledSync = async ({ migrated, store }) => {
  const accounts = Array.isArray(migrated?.accounts) ? migrated.accounts : undefined;
  const accountHashes = accounts ? new Set(accounts.map(({ hash }) => hash)) : undefined;
  const scheduledTxs = (Array.isArray(migrated?.scheduledTxs) ? migrated.scheduledTxs : []).filter(
    ({ account } = {}) => !accountHashes || accountHashes.has(account),
  );
  const txs = Array.isArray(migrated?.txs) ? migrated.txs : [];

  if (scheduledTxs.length === 0) {
    await NotificationsService.syncScheduled({ scheduledTxs, txs });
    return migrated;
  }

  const now = Date.now();
  const windowAt = now - WINDOW_DAYS * MS_IN_DAY;
  const toAt = now;
  const existingIndex = txs.reduce((memo, tx) => {
    const meta = tx?.meta;
    if (meta?.kind !== 'scheduled') return memo;
    if (!meta?.scheduledId || !Number.isFinite(meta?.occurrenceAt)) return memo;
    memo[`${meta.scheduledId}:${meta.occurrenceAt}`] = true;
    return memo;
  }, {});

  const newTxs = [];
  let hitLimit = false;
  for (let i = 0; i < scheduledTxs.length; i += 1) {
    const scheduled = scheduledTxs[i];
    const fromAt = Number.isFinite(scheduled.materialiseFrom)
      ? Math.max(windowAt, scheduled.materialiseFrom)
      : windowAt;
    const occurrences = getOccurrencesBetween({ scheduled, fromAt, toAt });
    for (let j = 0; j < occurrences.length; j += 1) {
      if (newTxs.length >= MAX_SCHEDULED_AUTOCREATE) {
        hitLimit = true;
        break;
      }
      const occurrenceAt = occurrences[j];
      const key = `${scheduled.id}:${occurrenceAt}`;
      if (existingIndex[key]) continue;
      existingIndex[key] = true;
      newTxs.push(
        parseTx({
          account: scheduled.account,
          category: scheduled.category,
          title: scheduled.title,
          timestamp: occurrenceAt,
          type: scheduled.type,
          value: scheduled.value,
          meta: { kind: 'scheduled', scheduledId: scheduled.id, occurrenceAt },
        }),
      );
    }
    if (newTxs.length >= MAX_SCHEDULED_AUTOCREATE) {
      if (i < scheduledTxs.length - 1) hitLimit = true;
      break;
    }
  }

  let next = migrated;
  if (newTxs.length > 0) {
    const collection = store.get('txs');
    await collection.save(newTxs);
    const nextTxs = collection.value;

    let nextSettings = migrated.settings;
    const categoryTxs = newTxs.filter((tx) => tx?.category !== undefined);
    const nextAutoCategory =
      categoryTxs.length > 0
        ? categoryTxs.reduce((catalog, tx) => learnAutoCategory(catalog, tx), migrated.settings.autoCategory)
        : undefined;

    const accountTxs = newTxs.filter((tx) => !!tx?.account);
    const nextAutoAccount =
      accountTxs.length > 0
        ? accountTxs.reduce((catalog, tx) => learnAutoAccount(catalog, tx), migrated.settings.autoAccount)
        : undefined;

    const amountTxs = newTxs.filter((tx) => !!tx?.account && Number.isFinite(tx?.value) && tx.value > 0);
    const nextAutoAmount =
      amountTxs.length > 0
        ? amountTxs.reduce((catalog, tx) => learnAutoAmount(catalog, tx), migrated.settings.autoAmount)
        : undefined;

    if (nextAutoCategory || nextAutoAccount || nextAutoAmount) {
      nextSettings = {
        ...migrated.settings,
        ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
        ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
        ...(nextAutoAmount ? { autoAmount: nextAutoAmount } : null),
      };
      await store.get('settings').save(nextSettings);
    }

    next = { ...migrated, txs: nextTxs, settings: nextSettings };
  }

  await NotificationsService.syncScheduled({ scheduledTxs, txs: next.txs });

  if (hitLimit) {
    eventEmitter.emit(EVENT.NOTIFICATION, {
      title: L10N.SCHEDULED,
      text: L10N.SCHEDULED_AUTOCREATE_LIMIT,
    });
  }

  return next;
};
