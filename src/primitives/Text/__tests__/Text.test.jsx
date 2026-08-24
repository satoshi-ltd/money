import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Text from '../Text';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { text: '#15140F', textMuted: '#8A8474', positive: '#A87B14' } }),
}));

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
});
