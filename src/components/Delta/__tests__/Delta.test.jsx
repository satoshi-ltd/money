import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Delta } from '../Delta';
import { theme } from '../../../theme';

const COLORS = { accentSoft: '#50FT', positive: '#G0LD', surface: '#5URF', text: '#1NK' };

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accentSoft: '#50FT', positive: '#G0LD', surface: '#5URF', text: '#1NK' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Delta {...props} />);
  });
  return renderer.root;
};

const flats = (root) =>
  root
    .findAll((node) => node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

const chipOf = (root) => flats(root).find((flat) => flat.borderRadius === theme.borderRadius.sm);
const figures = (root) => root.findAll((node) => node.props?.figure !== undefined);
const toneOf = (root) => figures(root)[0]?.props.tone;

describe('components/Delta', () => {
  test('a rise takes the accent, on the soft accent chip', () => {
    expect(chipOf(render({ value: 2.5 })).backgroundColor).toBe(COLORS.accentSoft);
    expect(toneOf(render({ value: 2.5 }))).toBe('positive');
  });

  test('a fall takes plain ink, on a plain surface chip: the house puts no red on a figure', () => {
    expect(chipOf(render({ value: -69.2 })).backgroundColor).toBe(COLORS.surface);
    expect(toneOf(render({ value: -69.2 }))).toBeUndefined();
  });

  test('inverted, a fall is the wanted direction: spending less is the good news', () => {
    expect(toneOf(render({ inverted: true, value: -28 }))).toBe('positive');
    expect(toneOf(render({ inverted: true, value: 28 }))).toBeUndefined();
  });

  test('the chip belongs to a hero, so a list row asks for the tones without it', () => {
    expect(chipOf(render({ plain: true, value: 2.5 }))).toBeUndefined();
    expect(toneOf(render({ plain: true, value: 2.5 }))).toBe('positive');
  });

  test('nothing to report draws nothing: no zero chip, no chip for a missing figure', () => {
    expect(figures(render({ value: 0 }))).toHaveLength(0);
    expect(figures(render({ value: undefined }))).toHaveLength(0);
    expect(figures(render({ value: NaN }))).toHaveLength(0);
  });

  test('the caption rides beside the chip, never inside it', () => {
    const root = render({ caption: 'this month', value: 2.5 });
    const caption = root.findAll((node) => node.props?.children === 'this month')[0];

    expect(caption).toBeDefined();
    expect(caption.props.tone).toBe('muted');
  });

  test('it can take the size of the figures it sits among, rather than shrinking beside them', () => {
    expect(figures(render({ value: 2.5 }))[0].props.figure).toBe('xs');
    expect(figures(render({ size: 'md', value: 2.5 }))[0].props.figure).toBe('md');
  });
});
