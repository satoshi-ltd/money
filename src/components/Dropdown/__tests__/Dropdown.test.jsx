import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Dropdown from '../Dropdown';
import { theme } from '../../../theme';
import { rowHeight } from '../../../theme/layout';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', background: '#8ACC60', border: '#B0RDE0', surface: '#5URFA0' } }),
}));

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 24 }) }));

jest.mock('../../../hooks/useMotion', () => ({
  useMotion: () => {
    const { Animated } = require('react-native');
    return { animateValue: () => {}, createValue: (value) => new Animated.Value(value) };
  },
}));

const OPTIONS = Array.from({ length: 18 }, (_item, index) => ({
  id: `c${index}`,
  label: `Currency ${index}`,
  symbol: `C${index}`,
  value: `c${index}`,
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Dropdown options={OPTIONS} visible onClose={() => {}} onSelect={() => {}} {...props} />);
  });
  return renderer.root;
};

const flats = (root) =>
  root
    .findAll((node) => node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

describe('components/Dropdown', () => {
  test('every row is exactly one row tall, last one included', () => {
    const rows = flats(render()).filter((flat) => flat.paddingHorizontal !== undefined && flat.justifyContent);
    const heights = new Set(rows.map((flat) => flat.height));

    expect(rows.length).toBeGreaterThan(0);
    expect([...heights]).toEqual([rowHeight]);
  });

  test('a list longer than the window scrolls instead of clipping', () => {
    const root = render({ maxItems: 6 });
    const scroll = root.findAll((node) => node.props?.showsVerticalScrollIndicator === true);
    const panel = flats(root).find((flat) => flat.height !== undefined && flat.width !== undefined);

    expect(scroll.length).toBeGreaterThan(0);
    expect(panel.height).toBe(6 * rowHeight);
  });

  test('it lifts off the page, the one surface allowed to', () => {
    const panel = flats(render()).find((flat) => flat.borderWidth === theme.hairline && flat.width !== undefined);

    expect(panel.elevation).toBe(theme.shadows.overlay.elevation);
  });

  test('it lives in its own window, so the sheet it opens over cannot take its gestures', () => {
    const modal = render().findAll((node) => node.props?.transparent === true && node.props?.visible === true);

    expect(modal.length).toBeGreaterThan(0);
  });

  test('it stays invisible until it knows where its trigger is, rather than flashing in the corner', () => {
    const panel = flats(render()).find((flat) => flat.height !== undefined && flat.width !== undefined);

    expect(panel.opacity).toBe(0);
    expect(panel.left).toBeUndefined();
  });

  test('a hidden dropdown renders nothing at all', () => {
    expect(render({ visible: false }).findAll((node) => node.props?.showsVerticalScrollIndicator === true)).toHaveLength(0);
  });

  test('the symbol well tells two accounts of the same name apart', () => {
    const options = [
      { id: 'a', label: 'Kasikorn', symbol: 'THB' },
      { id: 'b', label: 'Kasikorn', symbol: 'EUR' },
    ];
    const written = render({ options })
      .findAll((node) => typeof node.type === 'string' && typeof node.props?.children === 'string')
      .map((node) => node.props.children);

    expect(written).toEqual(['THB', 'Kasikorn', 'EUR', 'Kasikorn']);
  });
});
