import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { MonthSummary } from '../MonthSummary';
import { L10N } from '../../../modules';

const ACCENT = '#ACCE07';
const TEXT = '#TEXT00';

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', border: '#B0RDE0', surface: '#5URFA0', text: '#TEXT00', textMuted: '#MUTED0' },
  }),
}));

jest.mock('../../../primitives', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Text: ({ figure, size, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ flex, row, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

jest.mock('../../PriceFriendly', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { PriceFriendly: (props) => MockReact.createElement(ReactNative.View, { testID: 'price', ...props }) };
});

const INSIGHTS = [
  { type: 'trend', meta: { baseline: 2118.15, day: 23, spent: 2970.89 }, value: 40 },
  { type: 'pace', value: 3321.05 },
];

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<MonthSummary currency="EUR" insights={INSIGHTS} {...props} />);
  });
  return renderer.root;
};

const percent = (value) => Number(`${value}`.replace('%', ''));

const flats = (root) =>
  root
    .findAllByType('View')
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

describe('components/MonthSummary', () => {
  test('the bar runs accent to the usual pace, then ink for whatever went over it', () => {
    const styles = flats(render());
    const fill = styles.find((flat) => flat.backgroundColor === ACCENT);
    const excess = styles.find((flat) => flat.backgroundColor === TEXT && flat.height === '100%');
    const tick = styles.find((flat) => flat.width === 1 && flat.position === 'absolute');

    // Spent 2970.89 against a 2118.15 pace: accent stops at the pace, ink carries the overshoot.
    expect(percent(fill.width)).toBeCloseTo((2118.15 / 2970.89) * 100, 4);
    expect(percent(excess.width)).toBeCloseTo(((2970.89 - 2118.15) / 2970.89) * 100, 4);
    expect(percent(fill.width) + percent(excess.width)).toBeCloseTo(100, 4);
    expect(tick.backgroundColor).toBe(TEXT);
  });

  test('keeping under the pace paints no ink at all', () => {
    const styles = flats(
      render({ insights: [{ type: 'trend', meta: { baseline: 2118.15, day: 23, spent: 1200 }, value: -24 }] }),
    );

    expect(percent(styles.find((flat) => flat.backgroundColor === ACCENT).width)).toBeCloseTo((1200 / 2118.15) * 100, 4);
    expect(styles.filter((flat) => flat.backgroundColor === TEXT && flat.height === '100%')).toHaveLength(0);
  });

  // Spending under the pace is the wanted direction, so it takes the accent like any other delta.
  test('under the pace takes the accent, over it stays plain ink', () => {
    const over = render().findAllByType(RNText).find((node) => `${node.props.children}`.includes('above pace'));
    expect(over.props.tone).toBeUndefined();
    expect(over.props.medium).toBe(true);

    const under = render({
      insights: [{ type: 'trend', meta: { baseline: 2118.15, day: 23, spent: 1200 }, value: -24 }],
    })
      .findAllByType(RNText)
      .find((node) => `${node.props.children}`.includes('below pace'));
    expect(under.props.tone).toBe('positive');
    expect(under.props.medium).toBe(true);
  });

  test('the bar is a flat block, never a pill', () => {
    const fill = flats(render()).find((flat) => flat.backgroundColor === ACCENT);

    expect(fill.borderRadius).toBeUndefined();
  });

  // A render error slipped past because nothing here ever passed a scheduled block.
  test('the scheduled line names only the side that has something pending', () => {
    const copy = (scheduled) =>
      render({ scheduled })
        .findAllByType(RNText)
        .map((node) => `${node.props.children}`);

    expect(copy({ charges: 1, credits: 0, net: -50 })).toContain('1 charge');
    expect(copy({ charges: 1, credits: 0, net: -50 }).join(' ')).not.toContain('0 credit');
    expect(copy({ charges: 2, credits: 1, net: 120 })).toContain(`1 ${L10N.CREDIT} · 2 ${L10N.CHARGES}`);
  });
});
