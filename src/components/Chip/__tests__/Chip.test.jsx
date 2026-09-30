import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Chip from '../Chip';
import { ICON, L10N } from '../../../modules';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', accentSoft: '#ACCE70', border: '#B0RDE0', inverse: '#1', onAccent: '#0', onAccentSoft: '#0', onInverse: '#F', surface: '#5', textSecondary: '#2' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Chip label="Suggested: Home" {...props} />);
  });
  return renderer.root;
};

const buttons = (root) => root.findAll((node) => node.props?.accessibilityRole === 'button');

describe('components/Chip', () => {
  test('a chip you can press is a named button, and its close glyph says it dismisses', () => {
    const [button] = buttons(render({ iconRight: ICON.CLOSE, onPress: () => {} }));

    expect(button.props.accessibilityLabel).toBe('Suggested: Home');
    expect(button.props.accessibilityHint).toBe(L10N.A11Y_DISMISS);
  });

  test('a chip that only labels is not a button', () => {
    expect(buttons(render())).toHaveLength(0);
  });
});
