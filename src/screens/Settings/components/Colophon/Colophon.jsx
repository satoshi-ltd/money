import React, { useMemo } from 'react';
import { Linking } from 'react-native';

import { getStyles } from './Colophon.style';
import { Eyebrow, Pressable, Text, View } from '../../../../components';
import { useApp } from '../../../../contexts';
import { C, L10N } from '../../../../modules';

const { MAKER_EMAIL, MAKER_NAME, VERSION } = C;

const Colophon = () => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={style.container}>
      <Eyebrow style={style.version}>{`v${VERSION}`}</Eyebrow>

      <View style={style.rule} />

      <Eyebrow style={style.maker}>{MAKER_NAME}</Eyebrow>

      <Text align="center" bold size="l">
        {L10N.COLOPHON_TITLE}
      </Text>
      <Text align="center" size="xs" style={style.caption} tone="secondary">
        {L10N.COLOPHON_CAPTION}
      </Text>
      <Text align="center" size="xs" style={style.who} tone="muted">
        {L10N.COLOPHON_WHO}
      </Text>

      <Text align="center" figure="xs" style={style.vitals} tone="muted">
        {L10N.COLOPHON_VITALS}
      </Text>

      <Pressable style={style.mail} onPress={() => Linking.openURL(`mailto:${MAKER_EMAIL}`)}>
        <Text align="center" size="xs" tone="accent">
          {MAKER_EMAIL}
        </Text>
      </Pressable>
    </View>
  );
};

Colophon.displayName = 'Colophon';

export { Colophon };
