import React from 'react';
import { Switch } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Setting from '../Setting';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0', surface: '#5', surfaceSoft: '#6', textSecondary: '#2' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Setting title="Backup reminder" {...props} />);
  });
  return renderer.root;
};

describe('components/Setting', () => {
  const host = (root, role) => root.findAll((node) => typeof node.type === 'string' && node.props?.accessibilityRole === role);

  test('a row that navigates is a button read by its own text, with its disabled state', () => {
    const [button] = host(render({ onPress: () => {}, subtitle: 'Sunday 08:00' }), 'button');

    expect(button.props.accessibilityLabel).toBeUndefined();
    expect(button.props.accessibilityState).toEqual({ busy: false, disabled: false });
    expect(host(render({ disabled: true, onPress: () => {} }), 'button')[0].props.accessibilityState).toEqual({ busy: false, disabled: true });
  });

  // On iOS an accessible row is a leaf: a switch inside it is never reached, so the row itself is the switch.
  test('a toggle row is one switch, checked or not, that flips on press, with the native switch hidden', () => {
    const onValueChange = jest.fn();
    const root = render({ type: 'toggle', value: true, onValueChange });
    const [row] = host(root, 'switch');

    expect(row.props.accessibilityState).toEqual({ busy: false, checked: true, disabled: false });
    expect(root.findByType(Switch).props.accessible).toBe(false);
    expect(host(root, 'button')).toHaveLength(0);

    const [pressable] = root.findAll((node) => typeof node.props?.onPress === 'function' && node.props?.accessibilityRole === 'switch');
    act(() => pressable.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  test('a row whose action is in flight ignores a second press', () => {
    const onValueChange = jest.fn();
    const root = render({ activity: true, type: 'toggle', value: false, onValueChange });
    const [pressable] = root.findAll((node) => typeof node.props?.onPress === 'function' && node.props?.accessibilityRole === 'switch');

    act(() => pressable.props.onPress());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(host(root, 'switch')[0].props.accessibilityState.busy).toBe(true);
  });
});
