export const saveSettings = async (store, changes = {}) => {
  const collection = store.get('settings');
  const nextSettings = { ...(collection.value || {}), ...changes };

  await collection.save(nextSettings);

  return nextSettings;
};
