import React from 'react';
import { Text as RNText } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { resolveColor } from '../../components/utils/resolveColor';
import { styles } from './Text.styles';

const Text = ({
  align,
  bold,
  caption,
  color,
  detail,
  flex,
  secondary,
  subtitle,
  tiny,
  title,
  uppercase,
  style,
  ...props
}) => {
  const sizeStyle =
    (title && styles.title) ||
    (subtitle && styles.subtitle) ||
    (detail && styles.detail) ||
    (caption && styles.caption) ||
    (tiny && styles.tiny) ||
    styles.base;

  const familyToken = secondary
    ? bold
      ? '$fontBoldSecondary'
      : '$fontDefaultSecondary'
    : bold
      ? '$fontBold'
      : '$fontDefault';

  const resolvedColor = resolveColor(color, StyleSheet.value('$colorContent'));

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
