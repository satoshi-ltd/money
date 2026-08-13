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

  test('does not hang when sharing is unavailable', async () => {
    Sharing.isAvailableAsync.mockResolvedValue(false);

    await expect(BackupService.export(PAYLOAD)).rejects.toBeDefined();
  });
});
