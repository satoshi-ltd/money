import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { BackupService } from '../BackupService';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

const PAYLOAD = {
  accounts: [{ hash: 'a1', currency: 'EUR', title: 'Cash' }],
  scheduledTxs: [],
  schemaVersion: 3,
  settings: { baseCurrency: 'EUR' },
  txs: [{ hash: 't1', account: 'a1', category: 1, type: 0, value: 10, timestamp: 1700000000000, title: 'Coffee' }],
};

const parseCsv = (text) => {
  const rows = [[]];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      rows[rows.length - 1].push(field);
      field = '';
    } else if (char === '\n') {
      rows[rows.length - 1].push(field);
      field = '';
      rows.push([]);
    } else field += char;
  }
  rows[rows.length - 1].push(field);
  return rows;
};

const pickBackup = (payload) => {
  DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///backup.json' }] });
  FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(payload));
};

describe('services/BackupService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('writes one CSV line per transaction', async () => {
    await BackupService.exportCsv(PAYLOAD);

    const [, data] = FileSystem.writeAsStringAsync.mock.calls[0];
    const lines = data.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('date,type,amount,currency,category,title,account');
    expect(lines[1]).toContain('"Coffee"');
  });

  test('account and transaction names with quotes, commas and line breaks stay one field each, all seven columns intact', async () => {
    const title = 'Travel "cash", EUR';
    await BackupService.exportCsv({
      ...PAYLOAD,
      accounts: [{ ...PAYLOAD.accounts[0], title }],
      txs: [
        { ...PAYLOAD.txs[0], title: 'Café "d\'or",\r\nbar' },
        { ...PAYLOAD.txs[0], hash: 't2', title: '' },
      ],
    });

    const [, data] = FileSystem.writeAsStringAsync.mock.calls[0];
    const [header, first, second] = parseCsv(data);

    expect(header).toHaveLength(7);
    expect(first).toHaveLength(7);
    expect(first.slice(2)).toEqual(['10', 'EUR', '1', 'Café "d\'or",\r\nbar', title]);
    expect(second.slice(5)).toEqual(['', title]);
  });

  test('never writes the derived account payload into the backup', async () => {
    await BackupService.export({
      ...PAYLOAD,
      accounts: [{ ...PAYLOAD.accounts[0], txs: PAYLOAD.txs, chartBalance: [1, 2], currentBalance: 10 }],
    });

    const [, data] = FileSystem.writeAsStringAsync.mock.calls[0];
    const [account] = JSON.parse(data).accounts;

    expect(account.txs).toBeUndefined();
    expect(account.chartBalance).toBeUndefined();
    expect(account.currentBalance).toBeUndefined();
    expect(account).toMatchObject({ hash: 'a1', currency: 'EUR', title: 'Cash' });
  });

  test('never lets the lock pin or the learning catalogs leave in a backup', async () => {
    await BackupService.export({
      ...PAYLOAD,
      settings: {
        baseCurrency: 'EUR',
        pin: '4821',
        biometricUnlockEnabled: true,
        theme: 'dark',
        autoCategory: { rules: { coffee: 1 }, stats: {} },
        autoAccount: { rules: {}, stats: {} },
        autoAmount: { rules: {}, stats: {} },
      },
    });

    const [, data] = FileSystem.writeAsStringAsync.mock.calls[0];
    const { settings } = JSON.parse(data);

    expect(data).not.toContain('4821');
    expect(settings.pin).toBeUndefined();
    // Whether this phone has a reader armed says nothing about the ledger, and everything about the phone.
    expect(settings.biometricUnlockEnabled).toBeUndefined();
    expect(settings.autoCategory).toBeUndefined();
    expect(settings.autoAccount).toBeUndefined();
    expect(settings.autoAmount).toBeUndefined();
    expect(settings).toMatchObject({ baseCurrency: 'EUR', theme: 'dark' });
  });

  test('resolves with nothing when the picker is cancelled', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true, assets: null });

    await expect(BackupService.import()).resolves.toBeUndefined();
  });

  test('reads a valid backup file', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///backup.json' }] });
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(PAYLOAD));

    await expect(BackupService.import()).resolves.toMatchObject({
      accounts: PAYLOAD.accounts,
      txs: PAYLOAD.txs,
    });
  });

  test('rejects a payload whose transactions are not a list instead of importing nothing', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///backup.json' }] });
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify({ ...PAYLOAD, txs: { t1: {} } }));

    await expect(BackupService.import()).rejects.toBeDefined();
  });

  test('rejects a backup without accounts', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///backup.json' }] });
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify({ ...PAYLOAD, accounts: [] }));

    await expect(BackupService.import()).rejects.toBeDefined();
  });

  test.each([
    ['a transaction on an account that is not in the backup', { txs: [{ ...PAYLOAD.txs[0], account: 'ghost' }] }],
    ['a transaction with a nonnumeric amount', { txs: [{ ...PAYLOAD.txs[0], value: 'ten' }] }],
    ['a transaction that is null', { txs: [null] }],
    ['a currency that is not a code', { accounts: [{ ...PAYLOAD.accounts[0], currency: 5 }] }],
    ['two accounts with the same hash', { accounts: [PAYLOAD.accounts[0], PAYLOAD.accounts[0]] }],
  ])('rejects the whole import for %s', async (_label, change) => {
    pickBackup({ ...PAYLOAD, ...change });

    await expect(BackupService.import()).rejects.toBeDefined();
  });

  test('still reads a schema 3 backup: opening balance as text, no schedules, a retired setting', async () => {
    const legacy = {
      accounts: [{ hash: 'a1', currency: 'EUR', balance: '120.50', timestamp: 1600000000000, title: 'Cash' }],
      schemaVersion: 3,
      settings: { baseCurrency: 'EUR', retiredThing: true },
      txs: [{ hash: 't1', account: 'a1', type: 1, value: '5', timestamp: 1700000000000, title: 'Gift' }],
    };
    pickBackup(legacy);

    await expect(BackupService.import()).resolves.toMatchObject({ accounts: legacy.accounts, scheduledTxs: [], txs: legacy.txs });
  });

  test('does not hang when sharing is unavailable', async () => {
    Sharing.isAvailableAsync.mockResolvedValue(false);

    await expect(BackupService.export(PAYLOAD)).rejects.toBeDefined();
  });
});
