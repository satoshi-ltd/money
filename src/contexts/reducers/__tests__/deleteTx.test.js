import { deleteTx } from '../deleteTx';

const createStore = (data) => {
  let key;

  const store = {
    get(next) {
      key = next;
      return store;
    },
    get value() {
      return data[key];
    },
    findOne(query) {
      return data[key].find((row) => Object.keys(query).every((field) => row[field] === query[field]));
    },
    remove(query) {
      const removed = data[key].filter((row) => Object.keys(query).every((field) => row[field] === query[field]));
      data[key] = data[key].filter((row) => !removed.includes(row));
      return removed;
    },
  };

  return store;
};

const transferLegs = [
  { hash: 'from', account: 'a1', value: 100, meta: { kind: 'transfer', transferId: 'tr1', leg: 'from' } },
  { hash: 'to', account: 'a2', value: 90, meta: { kind: 'transfer', transferId: 'tr1', leg: 'to' } },
];

describe('contexts/reducers/deleteTx', () => {
  test('removes both legs of a transfer, whichever one is deleted', async () => {
    const data = { txs: [...transferLegs, { hash: 'other', account: 'a1', value: 5 }] };

    await deleteTx({ hash: 'to' }, [{ store: createStore(data) }, jest.fn()]);

    expect(data.txs).toEqual([{ hash: 'other', account: 'a1', value: 5 }]);
  });

  test('leaves other transfers alone', async () => {
    const data = {
      txs: [
        ...transferLegs,
        { hash: 'from2', account: 'a1', value: 20, meta: { kind: 'transfer', transferId: 'tr2', leg: 'from' } },
        { hash: 'to2', account: 'a2', value: 20, meta: { kind: 'transfer', transferId: 'tr2', leg: 'to' } },
      ],
    };

    await deleteTx({ hash: 'from' }, [{ store: createStore(data) }, jest.fn()]);

    expect(data.txs.map(({ hash }) => hash)).toEqual(['from2', 'to2']);
  });

  test('removes a single transaction that is not a transfer', async () => {
    const data = { txs: [{ hash: 't1', account: 'a1', value: 5 }, { hash: 't2', account: 'a1', value: 9 }] };

    await deleteTx({ hash: 't1' }, [{ store: createStore(data) }, jest.fn()]);

    expect(data.txs.map(({ hash }) => hash)).toEqual(['t2']);
  });
});
