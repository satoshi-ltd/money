import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { FieldRow } from '../FieldRow';
import { ICON } from '../../../modules';
import { theme } from '../../../theme';
import { rowHeight } from '../../../theme/layout';

const BORDER = '#B0RDE0';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: { border: '#B0RDE0' } }) }));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <FieldRow label="Account" {...props}>
        <RNText>N26</RNText>
      </FieldRow>,
    );
  });
  return renderer.root;
};

const flats = (root) =>
  root
    .findAll((node) => node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

const rowOf = (root) => flats(root).find((flat) => flat.minHeight === rowHeight);

describe('components/FieldRow', () => {
  test('label and value sit on one line, whether or not the row is pressable', () => {
    [{}, { onPress: () => {} }].forEach((props) => {
      const row = rowOf(render(props));

      expect(row.flexDirection).toBe('row');
      expect(row.alignItems).toBe('center');
    });
  });

  test('the value is pushed to the right edge', () => {
    const value = flats(render({})).find((flat) => flat.justifyContent === 'flex-end');

    expect(value.flex).toBe(1);
  });

  test('the divider is a hairline on top, so the first row of a group carries none', () => {
    expect(rowOf(render({})).borderTopWidth).toBeUndefined();

    const divided = rowOf(render({ divider: true }));
    expect(divided.borderTopWidth).toBe(theme.hairline);
    expect(divided.borderTopColor).toBe(BORDER);
  });

  test('pressing reports it, and a row with no handler is inert', () => {
    const onPress = jest.fn();
    const pressables = render({ onPress }).findAll((node) => node.props?.onPress);

    act(() => pressables[0].props.onPress());
    expect(onPress).toHaveBeenCalled();
    expect(render({}).findAll((node) => node.props?.onPress)).toHaveLength(0);
  });

  test('the chevron only shows when the row opens something', () => {
    expect(render({ chevron: true }).findAllByProps({ name: ICON.DOWN }).length).toBeGreaterThan(0);
    expect(render({}).findAllByProps({ name: ICON.DOWN })).toHaveLength(0);
  });
});
