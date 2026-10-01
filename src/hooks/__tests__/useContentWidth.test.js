import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { RailProvider } from '../useRail';
import { useContentWidth } from '../useContentWidth';
import { columnWidth, railWidth, viewOffset } from '../../theme/layout';

let mockWindow = { height: 844, width: 390 };

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindow,
}));

const widthAt = (width) => {
  mockWindow = { height: 844, width };
  let value;
  const Probe = () => {
    value = useContentWidth();
    return null;
  };
  act(() => {
    TestRenderer.create(<Probe />);
  });
  return value;
};

describe('hooks/useContentWidth', () => {
  test('on a phone the content is the window less the gutters, as it always was', () => {
    expect(widthAt(390)).toBe(390 - viewOffset * 2);
  });

  test('on the open Fold it stops at the column instead of stretching across the window', () => {
    expect(widthAt(720)).toBe(columnWidth - viewOffset * 2);
    expect(widthAt(1100)).toBe(columnWidth - viewOffset * 2);
  });
});

describe('hooks/useContentWidth beside the rail', () => {
  const widthWithRail = (width) => {
    mockWindow = { height: 844, width };
    let value;
    const Probe = () => {
      value = useContentWidth();
      return null;
    };
    act(() => {
      TestRenderer.create(
        <RailProvider value>
          <Probe />
        </RailProvider>,
      );
    });
    return value;
  };

  test('it is the window less the rail and the gutters, with no cap', () => {
    expect(widthWithRail(790)).toBe(790 - railWidth - viewOffset * 2);
    expect(widthWithRail(1100)).toBe(1100 - railWidth - viewOffset * 2);
  });
});
