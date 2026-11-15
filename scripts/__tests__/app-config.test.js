const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const settings = fs.readFileSync(path.join(root, 'src/screens/Settings/Settings.constants.js'), 'utf8');

describe('app.json', () => {
  test('the System theme can follow a dark phone because the app is not pinned to light', () => {
    expect(settings).toContain("value: 'system'");
    expect(expo.userInterfaceStyle).toBe('automatic');
  });
});
