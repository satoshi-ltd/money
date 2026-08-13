import { deleteTx } from '../deleteTx';
import { createTestStore } from '../../../test/createTestStore';

const transferLegs = [
  { hash: 'from', account: 'a1', value: 100, meta: { kind: 'transfer', transferId: 'tr1', leg: 'from' } },
  { hash: 'to', account: 'a2', value: 90, meta: { kind: 'transfer', transferId: 'tr1', leg: 'to' } },
];

const hashes = (store) => store.get('txs').value.map(({ hash }) => hash);

describe('contexts/reducers/deleteTx', () => {
  test('removes both legs of a transfer, whichever one is deleted', async () => {
    const store = await createTestStore({ txs: [...transferLegs, { hash: 'other', account: 'a1', value: 5 }] });

    await deleteTx({ hash: 'to' }, [{ store }, jest.fn()]);

    expect(hashes(store)).toEqual(['other']);
  });

  test('leaves other transfers alone', async () => {
    const store = await createTestStore({
      txs: [
        ...transferLegs,
        { hash: 'from2', account: 'a1', value: 20, meta: { kind: 'transfer', transferId: 'tr2', leg: 'from' } },
        { hash: 'to2', account: 'a2', value: 20, meta: { kind: 'transfer', transferId: 'tr2', leg: 'to' } },
      ],
    });

    await deleteTx({ hash: 'from' }, [{ store }, jest.fn()]);

    expect(hashes(store)).toEqual(['from2', 'to2']);
  });

  test('removes a single transaction that is not a transfer', async () => {
    const store = await createTestStore({
      txs: [
        { hash: 't1', account: 'a1', value: 5 },
        { hash: 't2', account: 'a1', value: 9 },
      ],
    });

    await deleteTx({ hash: 't1' }, [{ store }, jest.fn()]);

    expect(hashes(store)).toEqual(['t2']);
  });

  test('hands the surviving transactions to react state', async () => {
    const store = await createTestStore({ txs: [{ hash: 't1' }, { hash: 't2' }] });
    const setState = jest.fn();

    await deleteTx({ hash: 't1' }, [{ store }, setState]);

    expect(setState.mock.calls[0][0]({ txs: [] }).txs.map(({ hash }) => hash)).toEqual(['t2']);
  });
});
