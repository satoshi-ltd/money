import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { HorizontalChartItem } from '../HorizontalChartItem';
import { percentText } from '../../../../../modules';

jest.mock('../../../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', danger: '#DANG00', text: '#TEXT00' } }),
  useAmountSettings: () => ({ baseCurrency: 'EUR', maskAmount: false }),
}));

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const render = (props = {}) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <HorizontalChartItem color="#accent" currency="EUR" title="groceries" value={300} width={42} {...props} />,
    );
  });
  return renderer.root;
};

const BUDGET = { over: 0, spent: 105, state: 'within', total: 120 };

describe('screens/Stats/HorizontalChartItem with a budget', () => {
  const colors = { accent: '#ACCE07', danger: '#DANG00', text: '#TEXT00' };
  const fillOf = (root) => root.findAllByType('View').map((node) => StyleSheet.flatten(node.props.style)).find((flat) => flat?.height === '100%');
  const noteOf = (root) => root.findAllByType(RNText).map((node) => collect(node.props.children)).find((text) => /%$/.test(text));

  test('ink while within and from four fifths, danger past the limit', () => {
    const fill = (budget) => fillOf(render({ budget: { ...BUDGET, ...budget } }));

    expect(fill({ spent: 60, state: 'within' }).backgroundColor).toBe(colors.text);
    expect(fill({}).backgroundColor).toBe(colors.text);
    expect(fill({ over: 21, spent: 141, state: 'over' }).backgroundColor).toBe(colors.danger);
  });

  test('the track runs to the limit, never past it', () => {
    expect(fillOf(render({ budget: BUDGET })).width).toBe('88%');
    expect(fillOf(render({ budget: { over: 21, spent: 141, state: 'over', total: 120 } })).width).toBe('100%');
  });

  test('the note beside the bar is the share of the month for every row, budgeted or not, and never the limit or the excess', () => {
    const over = { over: 21, spent: 141, state: 'over', total: 120 };

    expect(noteOf(render({ budget: BUDGET }))).toBe(percentText(42));
    expect(noteOf(render({ budget: over }))).toBe(percentText(42));
    expect(noteOf(render())).toBe(percentText(42));
    expect(render({ budget: over }).findAllByType(RNText).map((node) => collect(node.props.children)).some((text) => /^(of|\+)/.test(text))).toBe(false);
  });

  test('past the limit the amount turns danger and the note stays muted', () => {
    const root = render({ budget: { over: 21, spent: 141, state: 'over', total: 120 } });
    const note = root.findAll((node) => typeof node.type === 'function' && node.props.figure === 'xs' && node.props.numberOfLines === 1)[0];
    const amount = root.findAll((node) => typeof node.type === 'function' && node.props.fixed === 0)[0];

    expect(note.props.tone).toBe('muted');
    expect(amount.props.tone).toBe('danger');
  });

  test('without a budget the track is the share and the note is the percentage, as before', () => {
    expect(fillOf(render()).width).toBe('42%');
  });
});

describe('screens/Stats/HorizontalChartItem', () => {
  test('the percent column keeps one line and grows with the font scale instead of wrapping', () => {
    const percent = render()
      .findAllByType(RNText)
      .find((node) => /%$/.test(collect(node.props.children)));
    const style = StyleSheet.flatten(percent.props.style);

    expect(percent.props.numberOfLines).toBe(1);
    expect(style.width).toBeUndefined();
    expect(style.flexShrink).toBe(0);
    expect(style.minWidth).toBeGreaterThan(0);
  });
});
