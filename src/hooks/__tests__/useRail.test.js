import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { RailProvider, railFits, useRail, useRailFits } from '../useRail';
import { railBreakpoint } from '../../theme/layout';

let mockWindow = { height: 844, width: 390 };

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindow,
}));

const probe = (hook, wrap = (node) => node) => {
  let value;
  const Probe = () => {
    value = hook();
    return null;
  };
  act(() => {
    TestRenderer.create(wrap(<Probe />));
  });
  return value;
};

describe('hooks/useRail', () => {
  test('a phone keeps its bar and the open Fold gets the rail, the line being 600 points', () => {
    expect(railBreakpoint).toBe(600);
    expect(railFits(390)).toBe(false);
    expect(railFits(599)).toBe(false);
    expect(railFits(600)).toBe(true);
    expect(railFits(790)).toBe(true);
  });

  test('the width is read live from the window, so folding switches it', () => {
    mockWindow = { height: 844, width: 411 };
    expect(probe(useRailFits)).toBe(false);
    mockWindow = { height: 840, width: 790 };
    expect(probe(useRailFits)).toBe(true);
  });

  test('a screen asks whether it sits beside the rail, and without one it does not', () => {
    expect(probe(useRail)).toBe(false);
    expect(probe(useRail, (node) => <RailProvider value>{node}</RailProvider>)).toBe(true);
  });
});
