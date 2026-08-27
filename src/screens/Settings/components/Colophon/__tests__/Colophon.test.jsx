import React from 'react';
import { Linking, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Colophon } from '../Colophon';
import { C, L10N } from '../../../../../modules';

jest.mock('../../../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0' } }),
}));

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Colophon />);
  });
  return renderer.root;
};

const texts = (root) =>
  root.findAllByType(RNText).flatMap(({ props }) => (typeof props.children === 'string' ? [props.children] : []));

describe('screens/Settings/Colophon', () => {
  test('it signs the app and says why it is given away', () => {
    const shown = texts(render());

    expect(shown).toEqual(expect.arrayContaining([C.MAKER_NAME, L10N.COLOPHON_TITLE, L10N.COLOPHON_WHO]));
  });

  // The version used to float alone above the fold, repeating a privacy promise this block now makes properly.
  test('it carries the version, and says the privacy line only once', () => {
    const shown = texts(render());

    expect(shown).toContain(`v${C.VERSION}`);
    expect(shown.filter((copy) => copy.includes(C.VERSION))).toHaveLength(1);
  });

  // The same promise onboarding makes, in the face the app reserves for figures.
  test('the vitals are set in the mono face, like every other figure', () => {
    const vitals = render()
      .findAllByProps({ children: L10N.COLOPHON_VITALS })
      .find((node) => node.props.figure !== undefined);

    expect(vitals.props.figure).toBe('xs');
  });

  test('the address opens a mail composer and nothing else', () => {
    const open = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
    const [mail] = render().findAll((node) => typeof node.props?.onPress === 'function');

    act(() => mail.props.onPress());

    expect(open).toHaveBeenCalledWith(`mailto:${C.MAKER_EMAIL}`);
    open.mockRestore();
  });
});
