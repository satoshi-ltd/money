import { Pressable, Text, View } from '../../../../components';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './NumKeyboard.style';

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, undefined, 0, undefined];
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

const NumKeyboard = ({ onPress }) => (
  <View flex style={style.container}>
    {KEYS.map((key, index) => (
      <Pressable key={index} onPress={typeof key === 'number' ? () => onPress(key) : undefined} style={style.pressable}>
        <View style={style.key}>
          {typeof key === 'number' && (
            <>
              <Text bold subtitle>
                {key}
              </Text>
              <Text color="contentLight" tiny>
                {LETTERS[key] || ' '}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    ))}
  </View>
);

NumKeyboard.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export { NumKeyboard };
