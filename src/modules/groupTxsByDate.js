const dayKey = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const groupTxsByDate = (txs = []) => {
  const query = [];
  let key;

  [...txs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((tx) => {
      const txKey = dayKey(tx.timestamp);

      if (key !== txKey) {
        key = txKey;
        query.push({ title: tx.timestamp, data: [] });
      }

      query[query.length - 1].data.push(tx);
    });

  return query;
};
