import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Text from '../Text';

let mockTextScale;

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { text: '#15140F', textMuted: '#8A8474', positive: '#A87B14' },
    textScale: mockTextScale,
  }),
}));

beforeEach(() => {
  mockTextScale = undefined;
});

const render = (props, children = 'hola') => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Text {...props}>{children}</Text>);
  });
  return StyleSheet.flatten(renderer.root.findByType(RNText).props.style);
};

describe('primitives/Text', () => {
  test('copy is set in the sans face', () => {
    expect(render({}).fontFamily).toBe('font-default');
  });

  test('medium and bold pick their own faces', () => {
    expect(render({ medium: true }).fontFamily).toBe('font-medium');
    expect(render({ bold: true }).fontFamily).toBe('font-bold');
  });

  test('a figure is always mono and tabular', () => {
    const style = render({ figure: 'md' });

    expect(style.fontFamily).toBe('font-mono');
    expect(style.fontVariant).toContain('tabular-nums');
  });

  test('a bold figure uses the mono medium face, never the sans bold', () => {
    expect(render({ figure: 'lg', bold: true }).fontFamily).toBe('font-mono-medium');
  });

  test('the figure ramp is independent from the copy ramp', () => {
    expect(render({ figure: 'hero' }).fontSize).toBe(36);
    expect(render({ figure: 'xs' }).fontSize).toBe(10);
    expect(render({ size: 'xxl' }).fontSize).toBe(28);
    expect(render({ size: 'xl' }).fontSize).toBe(22);
    expect(render({ size: 'xxs' }).fontSize).toBe(10);
  });

  test('uppercase carries the eyebrow tracking', () => {
    const style = render({ uppercase: true });

    expect(style.textTransform).toBe('uppercase');
    expect(style.letterSpacing).toBeGreaterThan(0);
  });

  test('positive tone paints with the gold color', () => {
    expect(render({ tone: 'positive' }).color).toBe('#A87B14');
  });

  test('muted tone is available for times, cents and labels', () => {
    expect(render({ tone: 'muted' }).color).toBe('#8A8474');
  });

  test('the reader size multiplies every ramp, copy and figures alike', () => {
    mockTextScale = 1.3;

    expect(render({ size: 'm' }).fontSize).toBe(18);
    expect(render({ figure: 'hero' }).fontSize).toBe(47);
  });

  test('the line height grows with the size, so scaled copy does not collide', () => {
    const regular = render({ size: 'm' });
    mockTextScale = 1.3;
    const large = render({ size: 'm' });

    expect(large.lineHeight).toBe(Math.round(regular.lineHeight * 1.3));
  });

  // Chip, Masthead and the amount fields set their own fontSize, and they have to scale like the rest.
  test('a size handed in by the caller scales too', () => {
    mockTextScale = 1.15;

    expect(render({ style: { fontSize: 20 } }).fontSize).toBe(23);
  });

  test('the default size leaves the ramp exactly where the theme put it', () => {
    mockTextScale = 1;

    expect(render({ size: 'm' }).fontSize).toBe(14);
  });
});
