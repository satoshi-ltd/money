export const deleteTx = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('txs');

  const tx = await store.findOne({ hash });
  const transferId = tx?.meta?.kind === 'transfer' ? tx.meta.transferId : undefined;

  await store.remove({ hash });

  if (transferId) {
    const siblings = (await store.value).filter((item) => item?.meta?.transferId === transferId);
    for (let index = 0; index < siblings.length; index += 1) {
      await store.remove({ hash: siblings[index].hash });
    }
  }

  const txs = await store.value;
  setState((prev) => ({ ...prev, txs }));
};
