export const groupTxsByDate = (txs = []) => {
  const query = [];
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  let date;
  let dateIndex = 0;

  txs.forEach((tx) => {
    const txDate = new Date(new Date(tx.timestamp).getTime() - offset).toISOString().substr(0, 10);

    if (date !== txDate) {
      date = txDate;
      dateIndex = query.length;
      query.push({ timestamp: tx.timestamp, data: [] });
    }

    query[dateIndex].data.push(tx);
  });

  return query;
};
