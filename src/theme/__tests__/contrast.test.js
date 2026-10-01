import fs from 'fs';
import path from 'path';

import { theme } from '../theme';

const channel = (value) => {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (foreground, background) => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

const PAIRS = [
  ['text', 'background'],
  ['textSecondary', 'background'],
  ['textMuted', 'background'],
  ['text', 'surface'],
  ['textMuted', 'surface'],
  ['onAccent', 'accent'],
  ['text', 'accentSoft'],
  ['danger', 'dangerSoft'],
  ['background', 'text'],
];

describe('theme/contrast', () => {
  test.each(['light', 'dark'])('%s: every ink reads on the ground it is painted on', (mode) => {
    const colors = theme.colors[mode];

    const failures = PAIRS.filter(([ink, ground]) => ratio(colors[ink], colors[ground]) < 4.5).map(
      ([ink, ground]) => `${ink} on ${ground}: ${ratio(colors[ink], colors[ground]).toFixed(2)}`,
    );

    expect(failures).toEqual([]);
  });

  test.each(['light', 'dark'])('%s: the ranked inks stay apart from each other and from the page', (mode) => {
    const colors = theme.colors[mode];
    const ramp = [colors.accent, colors.text, colors.textSecondary, colors.textMuted];

    ramp.forEach((ink) => expect(ratio(ink, colors.background)).toBeGreaterThan(1.4));
    ramp.slice(1).forEach((ink, index) => expect(ratio(ink, ramp[index])).toBeGreaterThan(1.15));
  });

  test('colour is spent on the accent alone: no decorative palette survives', () => {
    ['light', 'dark'].forEach((mode) => {
      expect(theme.colors[mode].category).toBeUndefined();
      expect(theme.colors[mode].currency).toBeUndefined();
    });
  });

  test('the palette is fifteen roles, the same in both themes, and nothing in src reads a role that is not there', () => {
    const roles = Object.keys(theme.colors.light);

    expect(roles).toHaveLength(15);
    expect(Object.keys(theme.colors.dark)).toEqual(roles);

    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
        return /\.jsx?$/.test(entry.name) ? [full] : [];
      });
    const read = walk(path.join(__dirname, '..', '..'))
      .flatMap((file) => [...fs.readFileSync(file, 'utf8').matchAll(/(?<![\w.])colors(?:\?\.|\.|\[['"])(\w+)/g)].map((match) => `${path.basename(file)}: ${match[1]}`))
      .filter((use) => !roles.includes(use.split(': ')[1]));

    expect(read).toEqual([]);
  });

  test('the tones of Text and Icon resolve to a role that exists', () => {
    const roles = Object.keys(theme.colors.light);
    const tones = [...fs.readFileSync(path.join(__dirname, '..', '..', 'primitives', 'Text', 'Text.styles.js'), 'utf8').matchAll(/tone\w+: \{ color: colors\.(\w+)/g)];
    const icon = [...fs.readFileSync(path.join(__dirname, '..', '..', 'primitives', 'Icon', 'Icon.jsx'), 'utf8').matchAll(/^ {2}\w+: '(\w+)',$/gm)];

    expect(tones.length).toBeGreaterThan(5);
    expect(icon.length).toBeGreaterThan(5);
    [...tones, ...icon].forEach(([, role]) => expect(roles).toContain(role));

    const styles = fs.readFileSync(path.join(__dirname, '..', '..', 'primitives', 'Text', 'Text.styles.js'), 'utf8');
    const named = [...fs.readFileSync(path.join(__dirname, '..', '..', 'primitives', 'Text', 'Text.jsx'), 'utf8').matchAll(/^ {2}\w+: '(tone\w+)',$/gm)];

    expect(named.length).toBeGreaterThan(5);
    named.forEach(([, style]) => expect(styles).toContain(`    ${style}: {`));
  });
});
