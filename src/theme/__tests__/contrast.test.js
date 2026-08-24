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
  ['onAccentSoft', 'accentSoft'],
  ['danger', 'dangerSoft'],
  ['onInverse', 'inverse'],
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
});
