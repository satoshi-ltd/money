import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import Chip from '../Chip';
import { ICON, L10N } from '../../../modules';
import { chipHeight } from '../Chip.styles';
import { rowHeight } from '../../../theme/layout';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', accentSoft: '#ACCE70', border: '#B0RDE0', text: '#1', onAccent: '#0', onAccentSoft: '#0', background: '#F', surface: '#5', textSecondary: '#2' } }),
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

  test('a chip you can press reaches the platform touch target at either size, and one that labels claims none', () => {
    ['xs', 's'].forEach((size) => {
      const [button] = buttons(render({ onPress: () => {}, size }));
      const { bottom, left, right, top } = button.props.hitSlop;

      expect(chipHeight[size] + top + bottom).toBeGreaterThanOrEqual(rowHeight);
      expect(left).toBe(right);
    });
    expect(render().findAll((node) => node.props?.hitSlop)).toHaveLength(0);
  });

  test('a chip that only labels is not a button', () => {
    expect(buttons(render())).toHaveLength(0);
  });
});
