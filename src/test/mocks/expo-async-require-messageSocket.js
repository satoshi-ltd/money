// Expo SDK 54 ships this module as TypeScript in `expo/src/...`, which Jest won't resolve by default.
// We only need it to exist so `jest-expo` can mock it during test setup.
module.exports = undefined;

