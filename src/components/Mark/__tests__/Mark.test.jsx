import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Mark } from '../Mark';
import { theme } from '../../../theme';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: {} }) }));

const flatten = (style) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Mark {...props} />);
  });
  return renderer.root;
};

describe('components/Mark', () => {
  test('it is the two letters of the icon, not the wordmark', () => {
    expect(render().findByType('Text').props.children).toBe('MÔ');
  });

  // The icon is the one place the mark inverts: it stays ink-on-paper whatever the theme is doing.
  test('the plate is ink and the letters are paper, in either theme', () => {
    const root = render();
    const plate = flatten(root.findByType('View').props.style);
    const letters = flatten(root.findByType('Text').props.style);

    expect(plate.backgroundColor).toBe(theme.colors.light.text);
    expect(letters.color).toBe(theme.colors.light.background);
  });

  test('it scales as one piece, so the letters follow the plate', () => {
    const small = flatten(render({ size: 44 }).findByType('Text').props.style);
    const large = flatten(render({ size: 88 }).findByType('Text').props.style);

    expect(large.fontSize).toBe(small.fontSize * 2);
    expect(flatten(render({ size: 88 }).findByType('View').props.style)).toMatchObject({ height: 88, width: 88 });
  });
});
