import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { SegmentedToggle } from '../SegmentedToggle';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { border: '#B0RDE0', inverse: '#1', onInverse: '#F', textMuted: '#6' } }),
}));

const OPTIONS = [
  { label: 'Expense', value: 0 },
  { label: 'Income', value: 1 },
];

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<SegmentedToggle options={OPTIONS} value={1} {...props} />);
  });
  return renderer.root;
};

describe('components/SegmentedToggle', () => {
  test('each segment is a named button that says whether it is the selected one', () => {
    const segments = render().findAll((node) => typeof node.type === 'string' && node.props?.accessibilityRole === 'button');

    expect(segments.map((node) => node.props.accessibilityLabel)).toEqual(['Expense', 'Income']);
    expect(segments.map((node) => node.props.accessibilityState.selected)).toEqual([false, true]);
  });
});
