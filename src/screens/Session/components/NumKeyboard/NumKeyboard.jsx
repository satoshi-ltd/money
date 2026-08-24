import PropTypes from 'prop-types';
import React from 'react';

import { style } from './NumKeyboard.style';
import { Eyebrow, Icon, Pressable, Text, View } from '../../../../components';
import { ICON } from '../../../../modules';

const KEY_DELETE = 'delete';
const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, undefined, 0, KEY_DELETE];
const LETTERS = {
  2: 'ABC',
  3: 'DEF',
  4: 'GHI',
  5: 'JKL',
  6: 'MNO',
  7: 'PQRS',
  8: 'TUV',
  9: 'WXYZ',
};

const NumKeyboard = ({ onDelete, onPress }) => {
  const handlerFor = (key) => {
    if (typeof key === 'number') return () => onPress(key);
    if (key === KEY_DELETE && onDelete) return onDelete;
    return undefined;
  };

  return (
    <View flex style={style.container}>
      {KEYS.map((key, index) => (
        <Pressable key={index} onPress={handlerFor(key)} style={style.pressable}>
          <View style={style.key}>
            {typeof key === 'number' ? (
              <>
                <Text figure="xl">{key}</Text>
                <Eyebrow>{LETTERS[key] || ' '}</Eyebrow>
              </>
            ) : key === KEY_DELETE && onDelete ? (
              <Icon name={ICON.BACKSPACE} size="l" tone="muted" testID="numkeyboard-delete" />
            ) : undefined}
          </View>
        </Pressable>
      ))}
    </View>
  );
};

NumKeyboard.propTypes = {
  onDelete: PropTypes.func,
  onPress: PropTypes.func.isRequired,
};

export { NumKeyboard };
