import React from 'react';
import { Appearance } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { useNativeScheme } from '../useNativeScheme';

const render = (preference) => {
  const Probe = ({ value }) => {
    useNativeScheme(value);
    return null;
  };
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Probe value={preference} />);
  });
  return { renderer, Probe };
};

describe('hooks/useNativeScheme', () => {
  beforeEach(() => {
    jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'unspecified'],
    [undefined, 'unspecified'],
  ])('a preference of %p hands %p to the system chrome', (preference, expected) => {
    render(preference);

    expect(Appearance.setColorScheme).toHaveBeenCalledWith(expected);
  });

  test('changing the preference updates it', () => {
    const { renderer, Probe } = render('dark');

    act(() => renderer.update(<Probe value="system" />));

    expect(Appearance.setColorScheme).toHaveBeenLastCalledWith('unspecified');
  });
});
