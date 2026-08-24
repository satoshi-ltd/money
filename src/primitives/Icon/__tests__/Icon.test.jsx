import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Icon from '../Icon';
import { GLYPHS } from '../glyphs';
import { ICON } from '../../../modules';
import { theme } from '../../../theme';

const COLORS = { accent: '#ACCE07', danger: '#DA9GE2', text: '#15140F', textSecondary: '#8A8474' };

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', danger: '#DA9GE2', text: '#15140F', textSecondary: '#8A8474' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Icon {...props} />);
  });
  return renderer.root;
};

const svgOf = (root) => root.findAll((node) => node.props?.viewBox === '0 0 24 24')[0];

describe('primitives/Icon', () => {
  test('every name the app can ask for draws something', () => {
    const blank = Object.entries(ICON).filter(([, name]) => !GLYPHS[name]?.length).map(([key]) => key);

    expect(blank).toEqual([]);
  });

  test('an unknown name draws nothing instead of throwing', () => {
    expect(render({ name: 'not-an-icon' }).findAll((node) => node.props?.viewBox)).toHaveLength(0);
  });

  test('glyphs are strokes on a transparent ground, never filled shapes', () => {
    const svg = svgOf(render({ name: ICON.SEARCH }));

    expect(svg.props.fill).toBe('none');
    expect(svg.props.strokeWidth).toBeLessThan(2);
    expect(svg.props.strokeLinecap).toBe('round');
  });

  test('sizes come off the icon ramp, and a number passes straight through', () => {
    expect(svgOf(render({ name: ICON.ADD, size: 's' })).props.width).toBe(theme.typography.iconSizes.caption);
    expect(svgOf(render({ name: ICON.ADD })).props.width).toBe(theme.typography.iconSizes.body);
    expect(svgOf(render({ name: ICON.ADD, size: 40 })).props.width).toBe(40);
  });

  test('the stroke takes its tone from the palette, and defaults to ink', () => {
    expect(svgOf(render({ name: ICON.ADD, tone: 'accent' })).props.stroke).toBe(COLORS.accent);
    expect(svgOf(render({ name: ICON.ADD, tone: 'muted' })).props.stroke).toBe(COLORS.textSecondary);
    expect(svgOf(render({ name: ICON.ADD })).props.stroke).toBe(COLORS.text);
  });

  test('no glyph is dead weight: every one in the table has a name pointing at it', () => {
    const used = new Set(Object.values(ICON));

    expect(Object.keys(GLYPHS).filter((name) => !used.has(name))).toEqual([]);
  });
});
