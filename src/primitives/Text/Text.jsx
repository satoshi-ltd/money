import React, { useMemo } from 'react';
import { Text as RNText } from 'react-native';

import { getStyles } from './Text.styles';
import { useApp } from '../../contexts';

const Text = ({ align, bold, tone, flex, size, uppercase, style, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const sizeStyle =
    size === 'xl'
      ? styles.title
      : size === 'l'
      ? styles.subtitle
      : size === 'm'
      ? styles.body
      : size === 's'
      ? styles.caption
      : size === 'xs'
      ? styles.tiny
      : null;

  const toneStyle =
    tone === 'secondary' || tone === 'muted'
      ? styles.toneSecondary
      : tone === 'accent'
      ? styles.toneAccent
      : tone === 'danger'
      ? styles.toneDanger
      : tone === 'warning'
      ? styles.toneWarning
      : tone === 'onAccent'
      ? styles.toneOnAccent
      : tone === 'onInverse'
      ? styles.toneOnInverse
      : styles.tonePrimary;

  const alignStyle =
    align === 'center' ? styles.alignCenter : align === 'right' ? styles.alignRight : align ? styles.alignLeft : null;

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        sizeStyle,
        bold ? styles.bold : null,
        toneStyle,
        alignStyle,
        flex ? styles.flex : null,
        uppercase ? styles.uppercase : null,
        style,
      ]}
    />
  );
};

export default Text;
