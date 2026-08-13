import { createTransfer } from '../createTransfer';

const ACCOUNT = { hash: 'a1', title: 'Cash' };
const TO = { hash: 'a2', title: 'Savings' };

const run = ({ createTx, deleteTx }) =>
  createTransfer({
    props: { account: ACCOUNT },
    state: { form: { from: ACCOUNT, to: TO, value: 100, exchange: 90 } },
    store: { createTx, deleteTx },
  });

describe('screens/Transaction/createTransfer', () => {
  test('links both legs with the same transfer id', async () => {
    const created = [];
    const createTx = jest.fn(async (tx) => {
      created.push(tx);
      return { ...tx, hash: `h${created.length}` };
    });

    await run({ createTx, deleteTx: jest.fn() });

    expect(created).toHaveLength(2);
    expect(created[0].meta.transferId).toBe(created[1].meta.transferId);
    expect(created.map(({ meta }) => meta.leg)).toEqual(['from', 'to']);
    expect(created[0].value).toBe(100);
    expect(created[1].value).toBe(90);
  });

  test('does not leave half a transfer behind when the second leg fails', async () => {
    const deleteTx = jest.fn();
    const createTx = jest
      .fn()
      .mockResolvedValueOnce({ hash: 'h1' })
      .mockRejectedValueOnce(new Error('storage is full'));

    await expect(run({ createTx, deleteTx })).resolves.toBeUndefined();
    expect(deleteTx).toHaveBeenCalledWith({ hash: 'h1' });
  });

  test('does not delete anything when the second leg simply returns nothing', async () => {
    const deleteTx = jest.fn();
    const createTx = jest.fn().mockResolvedValueOnce(undefined);

    await expect(run({ createTx, deleteTx })).resolves.toBeUndefined();
    expect(createTx).toHaveBeenCalledTimes(1);
    expect(deleteTx).not.toHaveBeenCalled();
  });
});
