export const saveSettings = async (store, changes = {}) => {
  const stored = store.get('settings').value || {};
  const nextSettings = { ...stored, ...changes };

  await store.save(nextSettings);

  return nextSettings;
};
