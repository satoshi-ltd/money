import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Checkbox } from '../Checkbox';
import { theme } from '../../../theme';

const ACCENT = '#ACCE07';
const BORDER = '#B0RDE0';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0', onAccent: '#0A0A0A' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Checkbox {...props} />);
  });
  return renderer.root;
};

const boxOf = (root) =>
  root
    .findAll((node) => node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean)
    .find((flat) => flat.borderRadius === theme.borderRadius.sm);

describe('components/Checkbox', () => {
  // The house has three radii and one hairline; a control that invents its own reads as a foreign part.
  test('unchecked, it is a hairline outline in the house radius', () => {
    const box = boxOf(render());

    expect(box.borderColor).toBe(BORDER);
    expect(box.borderWidth).toBe(theme.hairline);
    expect(box.backgroundColor).toBeUndefined();
    expect(box.height).toBe(theme.spacing.lg);
    expect(box.width).toBe(theme.spacing.lg);
  });

  test('checked, it fills with the accent the way every other selected thing does', () => {
    const box = boxOf(render({ checked: true }));

    expect(box.backgroundColor).toBe(ACCENT);
    expect(box.borderColor).toBe(ACCENT);
  });

  test('it presses only when it is given something to do', () => {
    const onPress = jest.fn();
    const root = render({ onPress });
    const pressable = root.findAll((node) => typeof node.props?.onPress === 'function')[0];

    act(() => pressable.props.onPress());

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(render().findAll((node) => typeof node.props?.onPress === 'function')).toHaveLength(0);
  });
});
