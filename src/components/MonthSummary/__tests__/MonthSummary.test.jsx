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

const INSIGHTS = [{ type: 'trend', meta: { baseline: 2118.15, day: 23, direction: 'over', spent: 2970.89 }, value: 40 }];

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<MonthSummary currency="EUR" insights={INSIGHTS} {...props} />);
  });
  return renderer.root;
};

const percent = (value) => Number(`${value}`.replace('%', ''));

const prices = (root) => root.findAllByProps({ testID: 'price' }).map(({ props }) => props);

const texts = (root) =>
  root
    .findAllByType(RNText)
    .flatMap(({ props }) => (typeof props.children === 'string' ? [props.children] : []));

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
      render({
        insights: [{ type: 'trend', meta: { baseline: 2118.15, day: 23, direction: 'under', spent: 1200 }, value: -24 }],
      }),
    );

    expect(percent(styles.find((flat) => flat.backgroundColor === ACCENT).width)).toBeCloseTo((1200 / 2118.15) * 100, 4);
    expect(styles.filter((flat) => flat.backgroundColor === TEXT && flat.height === '100%')).toHaveLength(0);
  });

  // What Home leads with on the 1st, when the running month has nothing worth comparing yet.
  test('the month that closed is named, priced, and read against its own usual', () => {
    const root = render({
      insights: [
        { type: 'trend', meta: { day: 1, spent: 12 } },
        { type: 'closed', value: 2786.4, meta: { at: new Date(2026, 7, 1, 12).getTime(), delta: 40 } },
      ],
    });

    expect(prices(root)).toEqual(expect.arrayContaining([expect.objectContaining({ value: 2786.4 })]));
    expect(texts(root)).toContain(L10N.LAST_MONTH);
    expect(texts(root).some((text) => text.includes('August') && text.includes('40'))).toBe(true);
  });

  test('a closed month with no usual to read against is named without a percentage', () => {
    const root = render({
      insights: [{ type: 'closed', value: 900, meta: { at: new Date(2026, 7, 1, 12).getTime() } }],
    });

    expect(texts(root).some((text) => text.includes('%'))).toBe(false);
  });

  // A young ledger used to render the heading over an empty card, because the whole lead was skipped.
  test('with no baseline it still says what was spent, and draws no bar to lie with', () => {
    const root = render({ insights: [{ type: 'trend', meta: { day: 12, spent: 240 } }] });

    expect(prices(root)).toEqual(expect.arrayContaining([expect.objectContaining({ value: 240 })]));
    expect(flats(root).filter((flat) => flat.backgroundColor === ACCENT)).toHaveLength(0);
    expect(texts(root)).not.toContain(L10N.ABOVE_PACE);
  });

  // The row kept an empty right side on the first days of a month, which is what the whole card avoids.
  test('with no percentage to show, the verdict carries the right side in words', () => {
    const root = render({ insights: [{ type: 'trend', meta: { day: 1, direction: 'over', spent: 169.67 } }] });

    expect(texts(root).join(' ')).toContain(L10N.ABOVE_USUAL);
    expect(texts(root).join(' ')).not.toContain('%');
  });

  test('a month inside its usual range says so, and says it without a figure', () => {
    const root = render({ insights: [{ type: 'trend', meta: { day: 2, direction: 'flat', spent: 12 } }] });

    expect(texts(root).join(' ')).toContain(L10N.AS_USUAL);
  });

  test('the direction comes from the module, so a flat month is never called above pace', () => {
    const root = render({
      insights: [{ type: 'trend', meta: { baseline: 1000, day: 20, direction: 'under', spent: 1000 }, value: 0 }],
    });

    expect(texts(root).join(' ')).toContain(L10N.BELOW_PACE);
  });

  test('the swing is the overshoot in money, named by one category and nothing else', () => {
    const root = render({ insights: [...INSIGHTS, { type: 'swing', value: 809.83, meta: { label: 'Travel' } }] });

    expect(texts(root)).toEqual(expect.arrayContaining([L10N.SWING, 'Travel']));
    expect(prices(root).find(({ value }) => value === 809.83).operator).toBe(true);
  });

  // The bar paints its overshoot in plain ink and only the within-pace fill in gold. Gold on an overspend
  // would have the row congratulating the reader for the thing the bar is flagging.
  test('going over is plain ink and cutting back is gold, the way the bar already reads', () => {
    const over = render({ insights: [...INSIGHTS, { type: 'swing', value: 809.83, meta: { label: 'Travel' } }] });
    const under = render({ insights: [...INSIGHTS, { type: 'swing', value: -412, meta: { label: 'Food' } }] });

    expect(prices(over).find(({ value }) => value === 809.83).tone).toBeNull();
    expect(prices(under).find(({ value }) => value === -412).tone).toBe('positive');
  });

  // The only place on the home screen where money coming in appears at all.
  test('the month says what came in, not only what went out', () => {
    const root = render({ insights: [...INSIGHTS, { type: 'incomes', value: 18690.74, meta: { label: 'Royalties', share: 49 } }] });

    expect(texts(root)).toContain(L10N.INCOMES);
    expect(prices(root)).toEqual(expect.arrayContaining([expect.objectContaining({ value: 18690.74 })]));
  });

  test('one source is named on its own, with no 100% saying it twice', () => {
    const root = render({ insights: [...INSIGHTS, { type: 'incomes', value: 3200, meta: { label: 'Salary' } }] });

    expect(texts(root)).toContain('Salary');
    expect(texts(root).join(' ')).not.toContain('100');
  });

  // The lead broke the grammar the rest of the card keeps: its label and its figure sat at the two far edges.
  test('the lead reads as title, value and caption like every line under it', () => {
    const root = render({ insights: [...INSIGHTS, { type: 'scheduled', value: -50.12, meta: { pending: 3 } }] });
    const keyOf = (label) =>
      StyleSheet.flatten(root.findAllByType(RNText).find(({ props }) => props.children === label).props.style);

    expect(keyOf(L10N.SPENT_SO_FAR).width).toBeGreaterThan(0);
    expect(keyOf(L10N.SPENT_SO_FAR).width).toBe(keyOf(L10N.SCHEDULED_AHEAD).width);
    expect(texts(root).join(' ')).toContain(L10N.ABOVE_PACE);
  });

  // The five lines were five hand-written copies, and they drifted a property at a time: the gutter, the size
  // of the figure, the tone of the caption, the tone of the label. Now there is one line and nothing to drift.
  test('every line is the same line, down to the tone of its label', () => {
    const root = render({
      insights: [
        ...INSIGHTS,
        { type: 'closed', value: 2786.4, meta: { at: new Date(2026, 7, 1, 12).getTime() } },
        { type: 'incomes', value: 18690.74, meta: { label: 'Royalties', share: 49 } },
        { type: 'swing', value: 809.83, meta: { label: 'Travel' } },
        { type: 'scheduled', value: -50.12, meta: { pending: 3 } },
      ],
    });
    const captions = [L10N.SPENT_SO_FAR, L10N.LAST_MONTH, L10N.INCOMES, L10N.SWING, L10N.SCHEDULED_AHEAD].map((label) =>
      root.findAllByType(RNText).find(({ props }) => props.children === label),
    );

    expect(captions.filter(Boolean)).toHaveLength(5);
    expect(captions.every(({ props }) => props.tone === 'muted')).toBe(true);
    expect(new Set(captions.map(({ props }) => StyleSheet.flatten(props.style).width)).size).toBe(1);
  });

  // Every line of this section is title, value and caption: a row with an empty right side reads as broken.
  test('no row is left without a caption', () => {
    const root = render({
      insights: [
        ...INSIGHTS,
        { type: 'incomes', value: 18690.74, meta: { label: 'Royalties', share: 49 } },
        { type: 'swing', value: 809.83, meta: { label: 'Travel' } },
        { type: 'scheduled', value: -50.12, meta: { pending: 1 } },
      ],
    });
    const shown = texts(root).join(' ');

    ['Royalties', 'Travel', `1 ${L10N.PENDING}`].forEach((caption) => expect(shown).toContain(caption));
  });

  // "2 Eingänge · 3 Abbuchungen" is 26 characters in a 115px slot: one count never outgrows the row.
  test('the scheduled line counts what is left without naming both sides', () => {
    const root = render({ insights: [...INSIGHTS, { type: 'scheduled', value: -50.12, meta: { pending: 3 } }] });

    expect(texts(root).join(' ')).toContain(`3 ${L10N.PENDING}`);
  });

  test('a row with no insight behind it is absent, never a zero', () => {
    const shown = texts(render());

    expect(shown).not.toContain(L10N.SWING);
    expect(shown).not.toContain(L10N.INCOMES);
    expect(shown).not.toContain(L10N.SCHEDULED_AHEAD);
  });
});
