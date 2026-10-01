import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import FormTransaction from '../FormTransaction';
import { L10N, suggestAccount, suggestCategory } from '../../../../modules';
import { theme } from '../../../../theme';
import { rowHeight } from '../../../../theme/layout';


let mockTxs = [];
let mockSettings = {};

jest.mock('../../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#accent', border: '#border', surface: '#surface', text: '#text' } }),
  useStore: () => ({ rates: {}, session: {}, settings: mockSettings, txs: mockTxs }),
}));

jest.mock('../../../../modules', () => ({
  ...jest.requireActual('../../../../modules'),
  suggestCategory: jest.fn(() => 1),
  suggestAccount: jest.fn(() => undefined),
}));


jest.mock('../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Chip: ({ label, onPress, size }) =>
      MockReact.createElement(ReactNative.View, { testID: 'suggestion-chip', accessibilityLabel: label, onPress, size }),
    Checkbox: (props) => MockReact.createElement(ReactNative.View, { testID: 'checkbox', ...props }),
    DatePicker: stub('date-picker'),
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
    expect(chip.props.size).toBe('s');
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

  test('the hide label wraps beside its box instead of pushing it off, and the row keeps its height', () => {
    const root = render({ form: {}, onChange: () => {} });
    const [row] = root.findAll((node) => node.props?.accessibilityRole === 'checkbox' && node.props?.accessibilityLabel);
    const label = root.findAll((node) => typeof node.type === 'string' && node.props?.children === L10N.HIDE_FROM_ANALYTICS)[0];

    expect(StyleSheet.flatten(label.props.style).flexShrink).toBe(1);
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({ minHeight: rowHeight, gap: theme.spacing.sm });
  });

  test('the hide row is one checkbox to a screen reader, named and stated', () => {
    const row = (form) =>
      render({ form, onChange: () => {} }).findAll((node) => node.props?.accessibilityRole === 'checkbox' && node.props?.accessibilityLabel)[0];

    expect(row({}).props.accessibilityLabel).toBe(L10N.HIDE_FROM_ANALYTICS);
    expect(row({}).props.accessibilityState).toEqual({ checked: false });
    expect(row({ moved: true }).props.accessibilityState).toEqual({ checked: true });
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

  describe('the date', () => {
    const openDate = (root) => {
      const row = root.findAllByProps({ testID: 'fieldrow' }).find((node) => node.props.onPress && node.findAll((child) => child.props.children === L10N.DATE).length > 0);
      act(() => row.props.onPress());
    };
    const picker = (root) => root.findAllByProps({ testID: 'date-picker' }).filter((node) => node.props.onSelect);

    test('the date row opens the shared picker, capped at today', () => {
      const root = render({ onChange: () => {} });
      expect(picker(root)).toHaveLength(0);

      openDate(root);

      const [open] = picker(root);
      expect(open.props.maximumDate.toDateString()).toBe(new Date().toDateString());
      expect(open.props.minimumDate).toBeUndefined();
    });

    test('a chosen day is written to the form as a timestamp, and closing removes the picker', () => {
      const onChange = jest.fn();
      const root = render({ onChange });
      openDate(root);
      const day = new Date(2026, 8, 9, 12);

      act(() => picker(root)[0].props.onSelect(day));
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ form: expect.objectContaining({ timestamp: day.getTime() }) }));

      act(() => picker(root)[0].props.onClose());
      expect(picker(root)).toHaveLength(0);
    });
  });

  describe('the title memory', () => {
    const LEDGER = [
      { account: 'a1', category: 2, timestamp: 10, title: 'Coffee', type: 0, value: 40 },
      { account: 'a1', category: 2, timestamp: 20, title: 'Coffee', type: 0, value: 45 },
      { account: 'a1', category: 2, timestamp: 30, title: 'Coffee beans', type: 0, value: 320 },
      { account: 'a1', category: 2, timestamp: 5, title: 'Coffeeshop', type: 0, value: 90 },
    ];

    // Only a proposal row carries a price: its first text is the title it offers.
    const offered = (root) =>
      root
        .findAllByProps({ testID: 'pressable' })
        .filter((node) => typeof node.type === 'function' && node.findAllByProps({ testID: 'price' }).length)
        .map((row) => row.findAll((node) => typeof node.props?.children === 'string' && node.props.children)[0])
        .map((node) => node.props.children);

    afterEach(() => {
      mockTxs = [];
    });

    test('typing a prefix offers the two titles you repeat most under it, no more', () => {
      mockTxs = LEDGER;
      const root = render({ autoSuggest: true, form: { title: 'cof' }, onChange: () => {} });

      expect(offered(root)).toEqual(['Coffee', 'Coffee beans']);
    });

    // The offer is the amount, account and category, so a finished title still deserves one.
    test('a finished title still gets the offer, since the rest of the form is still empty', () => {
      mockTxs = LEDGER;
      const root = render({ autoSuggest: true, form: { title: 'Coffee' }, onChange: () => {} });

      expect(offered(root)).toContain('Coffee');
    });

    test('typing a title never fills the amount, however stable the amounts under it are: only a proposal you tap does', () => {
      mockTxs = [10, 20, 30, 40].map((timestamp) => ({ account: 'a1', category: 2, timestamp, title: 'Coffee', type: 0, value: 40 }));
      mockSettings = { autoAmount: { rules: { 0: { a1: { coffee: '40' } } }, stats: { 0: { a1: { coffee: { amounts: { 40: 4 }, total: 4 } } } } } };
      const onChange = jest.fn();
      const root = render({ autoSuggest: true, onChange });

      typeConcept(root, 'Coffee');

      const { form } = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(form.value).toBeUndefined();
      expect(form.title).toBe('Coffee');
      mockSettings = {};
    });

    test('the word rules, asked for a title never seen, are read from the ledger itself and never from a catalog kept in settings', () => {
      const gasolina = (timestamp, account) => ({ account, category: 5, timestamp, title: 'Gasolina diesel', type: 0, value: 30 });
      mockTxs = [gasolina(1, 'a2'), gasolina(2, 'a2'), gasolina(3, 'a2')];
      mockSettings = { autoCategory: { rules: { 0: { gasolina: 9 } }, stats: {} }, autoAccount: { rules: { 0: { gasolina: 'stale' } }, stats: {} } };
      suggestCategory.mockClear();
      suggestAccount.mockClear();

      typeConcept(
        render({ accountsList: [{ currency: 'EUR', hash: 'a1' }, { currency: 'EUR', hash: 'a2' }], autoSuggest: true, onAutoSelectAccount: () => {}, onChange: () => {} }),
        'Gasolina',
      );

      expect(suggestCategory.mock.calls[0][0].rules[0].gasolina).toBe(5);
      expect(suggestAccount.mock.calls[0][0]?.rules?.[0]?.gasolina).toBe('a2');
      mockSettings = {};
    });

    test('with nothing to repeat there is no extra row', () => {
      expect(offered(render({ autoSuggest: true, form: { title: 'zz' }, onChange: () => {} }))).toEqual([]);
    });

    test('an offer is one full-width row: the title, where it went under it, the amount in the accent', () => {
      mockTxs = [{ account: 'a1', category: 1, timestamp: 10, title: 'Coffee', type: 0, value: 40 }];
      const root = render({
        accountsList: [{ hash: 'a1', title: 'N26', currency: 'EUR' }],
        autoSuggest: true,
        form: { title: 'cof' },
        onChange: () => {},
      });
      const [row] = root
        .findAllByProps({ testID: 'pressable' })
        .filter((node) => typeof node.type === 'function' && node.findAllByProps({ testID: 'price' }).length);
      const strings = row
        .findAll((node) => node.type === 'Text' && typeof node.props.children === 'string')
        .map((node) => node.props.children);
      const [price] = row.findAllByProps({ testID: 'price' }).filter((node) => typeof node.type === 'function');

      expect(row.props.accessibilityRole).toBe('button');
      expect(row.findAllByProps({ testID: 'fieldrow' })).toHaveLength(0);
      expect(strings).toEqual(['Coffee', `N26 \u00b7 ${L10N.CATEGORIES[0][1]}`]);
      expect(price.props).toMatchObject({ currency: 'EUR', showSymbol: true, tone: 'accent' });
    });

    // The word rule mock answers 1; the title's own history says 2.
    test('a title already seen is filled from its own history, not from the words it shares', () => {
      mockTxs = LEDGER;
      const onChange = jest.fn();
      const root = render({ onChange });

      typeConcept(root, 'Coffee');

      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ form: expect.objectContaining({ category: 2 }) }));
    });

    test('a title seen even once is filled from its own history', () => {
      mockTxs = LEDGER;
      const onChange = jest.fn();
      const root = render({ onChange });

      typeConcept(root, 'Coffeeshop');

      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ form: expect.objectContaining({ category: 2 }) }));
    });
  });
  describe('what a keystroke fills in', () => {
    const A1 = { currency: 'EUR', hash: 'a1', title: 'N26' };
    const A2 = { currency: 'THB', hash: 'a2', title: 'Kasikorn' };
    const LEDGER = [
      { account: 'a2', category: 2, timestamp: 10, title: 'Coffee', type: 0, value: 40 },
      { account: 'a2', category: 2, timestamp: 20, title: 'Coffee', type: 0, value: 40 },
      { account: 'a1', category: 5, timestamp: 30, title: 'Coffee beans', type: 0, value: 320 },
      { account: 'a1', category: 5, timestamp: 40, title: 'Coffee beans', type: 0, value: 300 },
    ];

    // The screen owns the form and the account; both have to move for the next keystroke to see them.
    const Harness = ({ form: initial = {}, onChange, ...props }) => {
      const [form, setForm] = React.useState(initial);
      const [account, setAccount] = React.useState(A1);

      return (
        <FormTransaction
          autoSuggest
          account={account}
          accountsList={[A1, A2]}
          form={form}
          onAutoSelectAccount={setAccount}
          onChange={(payload) => {
            setForm(payload.form);
            onChange(payload);
          }}
          onSelectAccount={setAccount}
          {...props}
        />
      );
    };

    const renderControlled = (props) => {
      act(() => {
        renderer = TestRenderer.create(<Harness {...props} />);
      });
      return renderer.root;
    };
    const lastForm = (onChange) => onChange.mock.calls[onChange.mock.calls.length - 1][0].form;
    const currentAccount = (root) => root.findByType(FormTransaction).props.account;
    const proposalRows = (root) =>
      root
        .findAllByProps({ testID: 'pressable' })
        .filter((node) => typeof node.type === 'function' && node.findAllByProps({ testID: 'price' }).length);

    beforeEach(() => {
      mockTxs = LEDGER;
    });

    afterEach(() => {
      mockTxs = [];
      suggestCategory.mockImplementation(() => 1);
    });

    test('a longer title is read anew: what the shorter one filled in does not stick', () => {
      const onChange = jest.fn();
      const root = renderControlled({ onChange });

      typeConcept(root, 'Coffee');
      expect(lastForm(onChange).category).toBe(2);
      expect(currentAccount(root).hash).toBe('a2');

      typeConcept(root, 'Coffee beans');
      expect(lastForm(onChange).category).toBe(5);
      expect(currentAccount(root).hash).toBe('a1');

      // Unknown again: the word rule (mocked to 1) answers, not the memory of a prefix.
      typeConcept(root, 'Coffee bean');
      expect(lastForm(onChange).category).toBe(1);
    });

    test('a category you chose yourself is never overwritten by typing on', () => {
      const onChange = jest.fn();
      const root = renderControlled({ categoryTouched: true, form: { category: 7 }, onChange });

      typeConcept(root, 'Coffee');
      typeConcept(root, 'Coffee beans');

      expect(lastForm(onChange).category).toBe(7);
    });

    // The screen opens with the account's most frequent category already in place; that is a default, not a choice.
    test('a category the screen defaulted gives way to what the title says', () => {
      const onChange = jest.fn();
      const root = renderControlled({ form: { category: 1 }, onChange });

      typeConcept(root, 'Coffee');
      expect(lastForm(onChange).category).toBe(2);

      const chip = root.findAllByProps({ testID: 'suggestion-chip' }).find((node) => node.props.onPress);
      act(() => chip.props.onPress());
      expect(lastForm(onChange).category).toBe(1);
    });

    test('the type switches only for a title you have filed under the other type', () => {
      mockTxs = [...LEDGER, { account: 'a1', category: 3, timestamp: 50, title: 'Salary', type: 1, value: 3000 }];
      const onAutoSelectType = jest.fn();
      const onChange = jest.fn();
      const root = renderControlled({ onAutoSelectType, onChange });

      // Unknown everywhere, but the word rule answers for the other type: that used to flip the form.
      suggestCategory.mockImplementation((catalog, { type }) => (type === 1 ? 1 : undefined));
      typeConcept(root, 'Zzz');
      expect(onAutoSelectType).not.toHaveBeenCalled();
      expect(lastForm(onChange).category).toBeUndefined();

      typeConcept(root, 'Salary');
      expect(onAutoSelectType).toHaveBeenLastCalledWith(1);
      expect(lastForm(onChange).category).toBe(3);
    });

    // "sal" on Expense offered nothing because Salary only exists as an income.
    test('a title known only under the other type is offered marked with that type, and one tap flips the type', () => {
      mockTxs = [{ account: 'a1', category: 3, timestamp: 30, title: 'Salary', type: 1, value: 3000 }];
      const onChange = jest.fn();
      const onProposalType = jest.fn();
      const root = renderControlled({ form: { title: 'sal' }, onChange, onProposalType });
      const rows = proposalRows(root);
      const chip = rows[0].findAllByProps({ testID: 'suggestion-chip' }).find((node) => typeof node.type === 'function');
      const price = rows[0].findAllByProps({ testID: 'price' }).find((node) => typeof node.type === 'function');

      expect(rows).toHaveLength(1);
      expect(chip.props.accessibilityLabel).toBe(L10N.INCOME);
      expect(price.props).toMatchObject({ operator: true, value: 3000 });
      act(() => rows[0].props.onPress());

      expect(onProposalType).toHaveBeenCalledWith(1);
      expect(lastForm(onChange)).toMatchObject({ category: 3, title: 'Salary', value: 3000 });
    });

    test('the type is flipped after the account is chosen, because choosing an account unsettles the type', () => {
      mockTxs = [{ account: 'a2', category: 3, timestamp: 30, title: 'Salary', type: 1, value: 3000 }];
      const onProposalType = jest.fn();
      const onSelectAccount = jest.fn();
      const root = renderControlled({ form: { title: 'sal' }, onChange: () => {}, onProposalType, onSelectAccount });

      act(() => proposalRows(root)[0].props.onPress());

      expect(onSelectAccount).toHaveBeenCalled();
      expect(onSelectAccount.mock.invocationCallOrder[0]).toBeLessThan(onProposalType.mock.invocationCallOrder[0]);
    });

    test('the other type is never offered when the current type has a proposal of its own', () => {
      mockTxs = [
        { account: 'a1', category: 3, timestamp: 30, title: 'Salary', type: 1, value: 3000 },
        { account: 'a1', category: 2, timestamp: 31, title: 'Salad', type: 0, value: 90 },
      ];
      const rows = proposalRows(renderControlled({ form: { title: 'sal' }, onChange: () => {} }));
      const marks = rows.flatMap((row) => row.findAllByProps({ testID: 'suggestion-chip' }).filter((node) => typeof node.type === 'function'));

      expect(rows).toHaveLength(1);
      expect(marks).toHaveLength(0);
    });

    test('one tap on a proposal writes the whole entry and withdraws the offers', () => {
      const onChange = jest.fn();
      const onManualAmountChange = jest.fn();
      const onManualCategorySelect = jest.fn();
      const root = renderControlled({ form: { title: 'cof' }, onChange, onManualAmountChange, onManualCategorySelect });

      expect(proposalRows(root)).toHaveLength(2);
      const coffee = proposalRows(root).find((row) => row.findAll((node) => node.props?.children === 'Coffee').length);
      act(() => coffee.props.onPress());

      expect(onChange).toHaveBeenLastCalledWith({ form: { category: 2, title: 'Coffee', value: 40 }, valid: true });
      expect(currentAccount(root).hash).toBe('a2');
      expect(onManualCategorySelect).toHaveBeenCalled();
      expect(onManualAmountChange).toHaveBeenCalled();
      expect(proposalRows(root)).toHaveLength(0);
    });
  });
});
