// See package.json jest.moduleNameMapper.
// jest-expo attempts to require this deep path to install web globals.
// In this app we don't run web targets; tests can safely no-op it.

module.exports = {};
