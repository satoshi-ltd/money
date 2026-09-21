export const isTransactionComplete = (form = {}, { showCategory = true } = {}) =>
  (!showCategory || form.category !== undefined) &&
  typeof form.title === 'string' &&
  form.title.trim() !== '' &&
  Number(form.value) > 0;
