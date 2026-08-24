import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { TransactionItem } from '../TransactionItem';
import { C, eventEmitter } from '../../../modules';

const { EVENT } = C;

const mockNavigate = jest.fn();
const mockDeleteTx = jest.fn();

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => ({ deleteTx: mockDeleteTx, rates: { '2023-11': { USD: 1.0849 } }, settings: { baseCurrency: 'EUR' } }),
}));
jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Swipeable: MockReact.forwardRef(({ children, renderRightActions }, ref) => {
      MockReact.useImperativeHandle(ref, () => ({ close: () => {} }));
      return MockReact.createElement(ReactNative.View, null, children, renderRightActions?.());
    }),
  };
});

const TX = { category: 1, currency: 'EUR', hash: 'tx-1', timestamp: 1700000000000, title: 'Mercadona', type: 0, value: 23.8 };

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<TransactionItem {...TX} />);
  });
  return renderer.root;
};

const pressByTestID = (root, testID) => {
  const node = root.findAllByProps({ testID }).find((item) => item.props.onPress);
  act(() => node.props.onPress());
};

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const allText = (root) => root.findAllByType(RNText).map((node) => collect(node.props.children)).join(' ');

describe('components/TransactionItem', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDeleteTx.mockClear();
  });

  test('the edit action opens the clone screen with the transaction', () => {
    pressByTestID(render(), 'tx-swipe-edit');

    expect(mockNavigate).toHaveBeenCalledWith('clone', expect.objectContaining({ hash: 'tx-1', title: 'Mercadona' }));
  });

  test('an expense is signed negative and a gain carries its plus', () => {
    expect(allText(render())).toContain('−');

    let incomeRenderer;
    act(() => {
      incomeRenderer = TestRenderer.create(<TransactionItem {...TX} type={1} />);
    });
    expect(allText(incomeRenderer.root)).toContain('+');
  });

  test('a foreign-currency transaction shows both amounts, each naming its currency', () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<TransactionItem {...TX} currency="USD" />);
    });
    const text = allText(renderer.root);

    expect(text).toContain('$');
    expect(text).toContain('€');
    expect(text).not.toContain('≈');
  });

  test('the delete action asks for confirmation before deleting', () => {
    const confirms = [];
    const listener = (payload) => confirms.push(payload);
    eventEmitter.on(EVENT.CONFIRM, listener);

    pressByTestID(render(), 'tx-swipe-delete');
    eventEmitter.off(EVENT.CONFIRM, listener);

    expect(confirms).toHaveLength(1);
    expect(mockDeleteTx).not.toHaveBeenCalled();

    confirms[0].onAction();
    expect(mockDeleteTx).toHaveBeenCalledWith({ hash: 'tx-1' });
  });
});
