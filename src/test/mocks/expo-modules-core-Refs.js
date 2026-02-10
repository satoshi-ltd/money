// Jest-expo (Expo SDK 53+) deep-mocks this module path. With modern Expo packages,
// package "exports" can prevent resolving `expo-modules-core/src/Refs` directly.
// A simple moduleNameMapper -> this stub restores resolution so jest-expo can run.

module.exports = {
  createSnapshotFriendlyRef: () => {
    const ref = { current: null };
    Object.defineProperty(ref, 'toJSON', {
      value: () => '[React.ref]',
    });
    return ref;
  },
};
