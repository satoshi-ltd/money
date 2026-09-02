import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import FormTransaction from '../FormTransaction';
import { L10N } from '../../../../modules';
import { theme } from '../../../../theme';


let mockTxs = [];

jest.mock('../../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#accent', border: '#border', surface: '#surface', text: '#text' } }),
  useStore: () => ({ rates: {}, session: {}, settings: {}, txs: mockTxs }),
}));

jest.mock('../../../../modules', () => ({
  ...jest.requireActual('../../../../modules'),
  suggestCategory: jest.fn(() => 1),
  suggestAccount: jest.fn(() => undefined),
  suggestAmount: jest.fn(() => undefined),
}));

jest.mock('@react-native-community/datetimepicker', () => () => null);

jest.mock('../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Chip: ({ label, onPress }) =>
      MockReact.createElement(ReactNative.View, { testID: 'suggestion-chip', accessibilityLabel: label, onPress }),
    Checkbox: (props) => MockReact.createElement(ReactNative.View, { testID: 'checkbox', ...props }),
    Dropdown: stub('dropdown'),
    FieldRow: ({ children, label, ...props }) =>
      MockReact.createElement(
        ReactNative.View,
        { testID: 'fieldrow', ...props },
        MockReact.createElement(ReactNative.Text, null, label),
        children,
      ),
    Heading: stub('heading'),
    Icon: stub('icon'),
    Input: stub('input'),
    Modal: stub('modal'),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    PriceFriendly: stub('price'),
    SegmentedToggle: stub('segmented'),
    ScrollView: MockReact.forwardRef((props, ref) => {
      MockReact.useImperativeHandle(ref, () => ({ scrollTo: () => {} }));
      return MockReact.createElement(ReactNative.View, props);
    }),
    Text: ({ align, bold, figure, flex, medium, size, tone, uppercase, ...props }) =>
      MockReact.createElement(ReactNative.Text, props),
    View: ({ row, flex, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

let renderer;

const render = (props = {}) => {
  act(() => {
    renderer = TestRenderer.create(
      <FormTransaction autoSuggest account={{ hash: 'a1', currency: 'EUR' }} form={{}} onChange={props.onChange} {...props} />,
    );
  });
  return renderer.root;
};

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
});

const inputs = (root) => root.findAllByProps({ testID: 'input' }).filter((node) => node.props.onChange);

const flatStyles = (root) =>
  root
    .findAll((node) => typeof node.type === 'string' && node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

const typeConcept = (root, text) => {
  const field = inputs(root).find((node) => node.props.keyboardType === undefined);
  act(() => field.props.onChange(text));
};

describe('screens/Transaction/FormTransaction', () => {
  test('typing a concept applies the suggestion and shows the dismissible chip', () => {
    const onChange = jest.fn();
    const root = render({ onChange });

    typeConcept(root, 'Mercadona');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ form: expect.objectContaining({ category: 1 }) }));
    const chip = root.findAllByProps({ testID: 'suggestion-chip' }).find((node) => node.props.onPress);
    expect(chip.props.accessibilityLabel).toContain(L10N.SUGGESTED);
  });

  test('dismissing the chip reverts what the suggestion changed', () => {
    const onChange = jest.fn();
    const root = render({ onChange });

    typeConcept(root, 'Mercadona');
    const chip = root.findAllByProps({ testID: 'suggestion-chip' }).find((node) => node.props.onPress);
    act(() => chip.props.onPress());

    const { form } = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(form.category).toBeUndefined();
    expect(root.findAllByProps({ testID: 'suggestion-chip' }).filter((node) => node.props.onPress)).toHaveLength(0);
  });

  test('the amount is a field row like the rest, its figure right-aligned in the mono face', () => {
    const root = render({ onChange: () => {} });
    const amount = inputs(root).find((node) => node.props.keyboardType === 'decimal-pad');
    const flat = StyleSheet.flatten(amount.props.style);

    expect(flat.fontFamily).toBe(theme.typography.fontFaces.monoMedium);
    expect(flat.fontSize).toBe(theme.typography.figureSizes.md);
    expect(flat.textAlign).toBe('right');
    expect(flat.borderWidth).toBeUndefined();
  });

  test('the two typed fields lead, so the concept can fill in everything below it', () => {
    const root = render({
      accountsList: [{ hash: 'a1', title: 'N26', currency: 'EUR' }],
      form: {},
      onChange: () => {},
      onSelectAccount: () => {},
      showAccount: true,
    });
    const labels = root
      .findAllByProps({ testID: 'fieldrow' })
      .filter((node) => typeof node.type === 'function')
      .map((row) => row.findAll((node) => typeof node.props?.children === 'string')[0].props.children);

    expect(labels).toEqual([L10N.CONCEPT, L10N.AMOUNT, L10N.ACCOUNT, L10N.CATEGORY, L10N.DATE]);
  });

  test('the amount row carries its currency symbol beside the figure', () => {
    const root = render({ onChange: () => {} });
    const amount = root
      .findAllByProps({ testID: 'fieldrow' })
      .filter((node) => typeof node.type === 'function')
      .find((row) => row.findAll((node) => node.props?.children === L10N.AMOUNT).length);

    expect(amount.findAll((node) => node.props?.keyboardType === 'decimal-pad')).not.toHaveLength(0);
    expect(amount.findAll((node) => node.props?.children === '\u20AC')).not.toHaveLength(0);

    // Label and value, nothing in between: the base-currency equivalent belongs to the list, not the form.
    expect(amount.findAllByProps({ testID: 'price' })).toHaveLength(0);
  });

  test('the category is a field row with a dropdown, the same control as the account', () => {
    const root = render();
    const dropdowns = root.findAllByProps({ testID: 'dropdown' }).filter((node) => typeof node.type === 'function');

    const categories = dropdowns.find(({ props }) => props.options?.length > 1);
    expect(categories).toBeDefined();
    expect(categories.props.options.every(({ label }) => typeof label === 'string')).toBe(true);

    const glyphs = root
      .findAllByProps({ testID: 'icon' })
      .filter((node) => typeof node.type === 'function')
      .map((node) => node.props.name);
    expect(glyphs.every((name) => name.startsWith('chevron'))).toBe(true);
  });

  test('the field group is a bare column of hairline-separated rows, flush with the rest of the sheet', () => {
    const root = render({
      accountsList: [{ hash: 'a1', title: 'N26', currency: 'EUR' }],
      form: {},
      onChange: () => {},
      onSelectAccount: () => {},
      showAccount: true,
    });
    const flats = flatStyles(root);

    // No fill and no inset: on a sheet the group already sits on the surface, so padding it only
    // pushed the rows out of line with the masthead and the actions.
    const group = flats.find((flat) => flat.marginBottom === theme.spacing.md && flat.paddingHorizontal === undefined);
    expect(group).toBeDefined();
    expect(group.backgroundColor).toBeUndefined();

    // Every field is the same FieldRow; only the first of the group goes without a divider.
    const rows = root.findAllByProps({ testID: 'fieldrow' }).filter((node) => typeof node.type === 'function');
    expect(rows).toHaveLength(5);
    expect(rows.filter((node) => node.props.divider)).toHaveLength(4);
    expect(rows[0].props.divider).toBeFalsy();
  });

  test('normalizes commas and rejects non-numeric amounts', () => {
    const onChange = jest.fn();
    const root = render({ onChange });
    const amount = inputs(root).find((node) => node.props.keyboardType === 'decimal-pad');

    act(() => amount.props.onChange('12,5'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ form: expect.objectContaining({ value: '12.5' }) }));

    act(() => amount.props.onChange('abc'));
    const { form } = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(form.value).toBeUndefined();
  });

  describe('the repeat proposal', () => {
    const LEDGER = [
      { account: 'a1', category: 2, timestamp: 10, title: 'Coffee', type: 0, value: 40 },
      { account: 'a1', category: 2, timestamp: 20, title: 'Coffee', type: 0, value: 40 },
    ];

    afterEach(() => {
      mockTxs = [];
    });

    test('typing a prefix offers back what you already did', () => {
      mockTxs = LEDGER;
      const rows = () =>
        render({ autoSuggest: true, form: { title: 'cof' }, onChange: () => {} })
          .findAllByProps({ testID: 'fieldrow' })
          .filter((node) => typeof node.type === 'function');

      expect(rows().some((row) => row.findAll((node) => node.props?.children === 'Coffee').length)).toBe(true);
    });

    // The offer is the amount, account and category, so a finished title still deserves one.
    test('a finished title still gets the offer, since the rest of the form is still empty', () => {
      mockTxs = LEDGER;
      const rows = render({ autoSuggest: true, form: { title: 'Coffee' }, onChange: () => {} })
        .findAllByProps({ testID: 'fieldrow' })
        .filter((node) => typeof node.type === 'function');

      expect(rows.some((row) => row.findAll((node) => node.props?.children === 'Coffee').length)).toBe(true);
    });

    test('with nothing to repeat there is no extra row', () => {
      const before = render({ form: {}, onChange: () => {} }).findAllByProps({ testID: 'fieldrow' }).length;
      const after = render({ autoSuggest: true, form: { title: 'zz' }, onChange: () => {} }).findAllByProps({
        testID: 'fieldrow',
      }).length;

      expect(after).toBe(before);
    });
  });
});
