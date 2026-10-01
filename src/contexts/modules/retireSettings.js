const RETIRED = ['autoAccount', 'autoAmount', 'autoCategory'];

export const retireSettings = async ({ migrated, stored = {}, store }) => {
  if (!RETIRED.some((key) => Object.prototype.hasOwnProperty.call(stored || {}, key))) return;

  await store.replace({ settings: migrated.settings });
};
