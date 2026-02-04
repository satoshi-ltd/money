import React from 'react';
import { Text as RNText } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { styles } from './Text.styles';

const Text = ({
  align,
  bold,
  tone,
  flex,
  size,
  uppercase,
  style,
  ...props
}) => {
  const sizeStyle =
    size === 'xl'
      ? styles.title
      : size === 'l'
        ? styles.subtitle
        : size === 'm'
          ? styles.detail
          : size === 's'
            ? styles.caption
            : size === 'xs'
              ? styles.tiny
              : null;

  const familyToken = bold ? '$fontBold' : '$fontDefault';

  const toneColor =
    tone === 'primary'
      ? StyleSheet.value('$colorContent')
      : tone === 'secondary' || tone === 'muted'
        ? StyleSheet.value('$colorContentLight')
        : tone === 'accent'
          ? StyleSheet.value('$colorAccent')
          : tone === 'danger'
            ? StyleSheet.value('$colorError')
            : tone === 'warning'
              ? StyleSheet.value('$colorWarning')
              : tone === 'inverse'
                ? StyleSheet.value('$colorBase')
                : undefined;

  const resolvedColor = toneColor || StyleSheet.value('$colorContent');

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        sizeStyle,
        { color: resolvedColor, fontFamily: StyleSheet.value(familyToken) },
        align ? { textAlign: align } : null,
        flex ? { flex: typeof flex === 'number' ? flex : 1 } : null,
        uppercase ? { textTransform: 'uppercase' } : null,
        style,
      ]}
    />
  );
};

export default Text;
