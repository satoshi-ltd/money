import React from 'react';
import { StyleSheet, Text as RNText, View as RNView } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Confirm } from '../Confirm';
import { C, eventEmitter } from '../../../modules';
import { theme } from '../../../theme';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: {} }) }));

const { EVENT } = C;

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Confirm />);
  });
  return renderer;
};

const emit = (payload) => act(() => eventEmitter.emit(EVENT.CONFIRM, payload));

const texts = (root) => root.findAllByType(RNText).map((node) => node.props.children);

const press = (root, label) => {
  let node = root.findAllByType(RNText).find((item) => item.props.children === label);
  while (node && !node.props.onPress) node = node.parent;
  act(() => node.props.onPress());
};

const flattenedStyles = (root) => root.findAllByType(RNView).map((node) => StyleSheet.flatten(node.props.style) || {});

describe('components/Confirm', () => {
  test('the dialog is a flat hairline block, never a floating card', () => {
    const renderer = render();
    emit({ title: 'Borrar' });

    const dialog = flattenedStyles(renderer.root).find((style) => style.alignSelf === 'stretch' && style.borderWidth);

    expect(dialog.borderWidth).toBe(theme.hairline);
    expect(dialog.borderRadius).toBe(0);
    expect(dialog.shadowOpacity).toBeUndefined();
    expect(dialog.elevation).toBeUndefined();
  });

  test('stays hidden until a confirm event arrives', () => {
    const renderer = render();

    expect(renderer.toJSON()).toBeNull();

    emit({ title: 'Borrar movimiento' });
    expect(texts(renderer.root)).toContain('Borrar movimiento');
  });

  test('the action button runs the callback and closes', () => {
    const onAction = jest.fn();
    const renderer = render();
    emit({ title: 'Borrar', actionLabel: 'Eliminar', onAction });

    press(renderer.root, 'Eliminar');

    expect(onAction).toHaveBeenCalled();
    expect(renderer.toJSON()).toBeNull();
  });

  test('cancel closes without running the callback', () => {
    const onAction = jest.fn();
    const renderer = render();
    emit({ title: 'Borrar', cancelLabel: 'Atras', onAction });

    press(renderer.root, 'Atras');

    expect(onAction).not.toHaveBeenCalled();
    expect(renderer.toJSON()).toBeNull();
  });

  test('an action that emits again keeps the dialog open with the new content', () => {
    const renderer = render();
    emit({
      title: 'Primero',
      actionLabel: 'Seguir',
      onAction: () => eventEmitter.emit(EVENT.CONFIRM, { title: 'Segundo' }),
    });

    press(renderer.root, 'Seguir');

    expect(texts(renderer.root)).toContain('Segundo');
    expect(texts(renderer.root)).not.toContain('Primero');
  });
});
