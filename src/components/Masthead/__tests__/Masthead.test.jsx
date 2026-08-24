import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Masthead } from '../Masthead';
import { ICON, L10N } from '../../../modules';
import { theme } from '../../../theme';
import { iconButtonSize } from '../../../theme/layout';

const BORDER = '#B0RDE0';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', background: '#8ACC60', border: '#B0RDE0', rule: '#RULE00' } }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Masthead section="Aug 23" {...props} />);
  });
  return renderer.root;
};

const iconsNamed = (root, name) => root.findAllByProps({ name }).filter((node) => typeof node.type === 'function');

const texts = (root) => root.findAllByType(RNText).map((node) => node.props.children);

describe('components/Masthead', () => {
  test('the wordmark is always there, on every screen that uses it', () => {
    expect(render({}).findAll((node) => node.type?.name === 'Logo').length).toBeGreaterThan(0);
    expect(render({ section: undefined }).findAll((node) => node.type?.name === 'Logo').length).toBeGreaterThan(0);
  });

  test('the search action is the same framed square as every other header button', () => {
    const root = render({ onSearch: () => {} });
    const [button] = root.findAll((node) => node.type?.name === 'IconButton');
    const frame = root
      .findAll((node) => node.props?.style !== undefined)
      .map((node) => StyleSheet.flatten(node.props.style))
      .find((flat) => flat?.width === iconButtonSize && flat?.borderWidth === theme.hairline);

    expect(button).toBeDefined();
    expect(frame).toBeDefined();
    expect(frame.borderColor).toBe(BORDER);
    expect(frame.borderRadius).toBe(theme.borderRadius.sm);
  });

  test('the bar is the same height with an action, without one, and while searching', () => {
    const heights = [{}, { onSearch: () => {} }, { onSearch: () => {}, searching: true }].map((props) => {
      const root = render(props);
      return root
        .findAll((node) => node.props?.style !== undefined)
        .map((node) => StyleSheet.flatten(node.props.style))
        .find((flat) => flat?.paddingHorizontal !== undefined && flat?.height !== undefined)?.height;
    });

    expect(heights[0]).toBeDefined();
    expect(new Set(heights).size).toBe(1);
  });

  test('it takes the colour of whatever hosts it, so a sheet header is not a paper band', () => {
    const fills = render({})
      .findAll((node) => node.props?.style !== undefined)
      .map((node) => StyleSheet.flatten(node.props.style))
      .filter((flat) => flat?.backgroundColor !== undefined);

    expect(fills.map((flat) => flat.backgroundColor)).not.toContain('#8ACC60');
  });

  test('no search action means no button at all', () => {
    expect(render({}).findAll((node) => node.type?.name === 'IconButton')).toHaveLength(0);
  });

  test('searching turns the header itself into the field, not a box further down', () => {
    const root = render({ onSearch: () => {}, query: 'mercadona', searching: true });

    expect(iconsNamed(root, ICON.SEARCH).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ value: 'mercadona' }).length).toBeGreaterThan(0);
    expect(texts(root)).not.toContain('Aug 23');
  });

  test('the close action leaves the search', () => {
    const onSearch = jest.fn();
    const root = render({ onSearch, searching: true });
    const close = root.findAll((node) => node.type?.name === 'IconButton').pop();

    act(() => close.props.onPress());
    expect(onSearch).toHaveBeenCalled();
  });

  test('typing is reported straight away', () => {
    const onQueryChange = jest.fn();
    const root = render({ onQueryChange, onSearch: () => {}, searching: true });
    const [input] = root.findAllByProps({ placeholder: `${L10N.SEARCH}…` });

    act(() => input.props.onChange('lidl'));
    expect(onQueryChange).toHaveBeenCalledWith('lidl');
  });
});
