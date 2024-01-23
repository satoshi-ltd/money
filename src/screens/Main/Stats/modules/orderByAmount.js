export default (dataSource = {}) =>
  Object.keys(dataSource)
    .map((key) => ({ key, amount: dataSource[key] }))
    .sort((a, b) => (a.amount > b.amount ? -1 : 1));
