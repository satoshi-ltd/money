export const deleteTx = async ({ hash }, [state, setState]) => {
  const { store } = state;

  const collection = store.get('txs');

  const tx = collection.findOne({ hash });
  const transferId = tx?.meta?.kind === 'transfer' ? tx.meta.transferId : undefined;

  await collection.remove({ hash });

  if (transferId) {
    const siblings = collection.value.filter((item) => item?.meta?.transferId === transferId);
    for (let index = 0; index < siblings.length; index += 1) {
      await collection.remove({ hash: siblings[index].hash });
    }
  }

  const txs = collection.value;
  setState((prev) => ({ ...prev, txs }));
};
