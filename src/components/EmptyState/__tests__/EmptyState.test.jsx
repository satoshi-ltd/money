import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { EmptyState } from '../EmptyState';
import { theme } from '../../../theme';

const SURFACE = '#5URFA0';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: { surface: '#5URFA0' } }) }));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<EmptyState icon="book" title="No accounts yet" {...props} />);
  });
  return renderer.root;
};

const styles = (root) =>
  root
    .findAll((node) => node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

describe('components/EmptyState', () => {
  test('the well is a 56px surface square on the touchable radius', () => {
    const well = styles(render({})).find((style) => style.backgroundColor === SURFACE);

    expect(well).toMatchObject({ borderRadius: theme.borderRadius.sm, height: 56, width: 56 });
  });

  test('renders the title and the caption', () => {
    const root = render({ caption: 'Add your first account.' });
    const copy = root.findAllByType(RNText).map((node) => node.props.children);

    expect(copy).toContain('No accounts yet');
    expect(copy).toContain('Add your first account.');
  });

  test('the action is a 200px button in the requested variant', () => {
    const root = render({ action: 'Add account', onAction: () => {}, variant: 'outlined' });
    const button = root.findAll((node) => node.props?.variant === 'outlined').pop();

    expect(button).toBeDefined();
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ width: 200 });
  });

  test('no action renders no button', () => {
    const root = render({ action: 'Add account' });

    expect(root.findAll((node) => node.props?.variant !== undefined)).toHaveLength(0);
  });
});
