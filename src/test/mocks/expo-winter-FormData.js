// See package.json jest.moduleNameMapper.
// jest-expo tries to mock deep Expo internals that are protected by package exports.

module.exports = {
  installFormDataPatch: () => {},
};
