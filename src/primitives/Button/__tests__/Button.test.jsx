import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Button from '../Button';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0', danger: '#D', inverse: '#1', onAccent: '#0', onInverse: '#F', surfaceSoft: '#6', text: '#T', textSecondary: '#2' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Button onPress={() => {}} {...props} />);
  });
  return renderer.root;
};

const buttons = (root) => root.findAll((node) => typeof node.type === 'string' && node.props?.accessibilityRole === 'button');

describe('primitives/Button', () => {
  test('every button carries the button trait, and an icon-only one keeps the label it is given', () => {
    expect(buttons(render({ children: 'Save' }))).toHaveLength(1);

    const [icon] = buttons(render({ accessibilityLabel: 'Add scheduled transaction', icon: 'plus' }));
    expect(icon.props.accessibilityLabel).toBe('Add scheduled transaction');
  });
});
