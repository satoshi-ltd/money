import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';
import { IconButton } from '../IconButton';
import { Masthead } from '../Masthead';
import Screen from '../Screen';

const Panel = ({
  children,
  floatingElement,
  title,
  onBack,
  sheet = false,
  rightElement,
  disableScroll = false,
  style,
  ...props
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useApp();
  const paddingBottom = viewOffset + bottom;
  const showHeader = title !== undefined || onBack || rightElement;
  const baseColor = sheet ? colors.surface : colors.background;
  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: baseColor, paddingTop: sheet ? theme.spacing.sm : 0 },
        screen: { paddingBottom },
      }),
    [baseColor, paddingBottom, sheet],
  );

  return (
    <SafeAreaView edges={sheet ? [] : ['top']} style={dynamic.safeArea}>
      {sheet ? (
        <Masthead rule={false} section={title}>
          {rightElement}
          {onBack ? <IconButton icon={ICON.CLOSE} onPress={onBack} /> : null}
        </Masthead>
      ) : showHeader ? (
        <Masthead section={title} onBack={onBack}>
          {rightElement}
        </Masthead>
      ) : null}
      <Screen disableScroll={disableScroll} keyboardSpacer={!sheet} {...props} style={[style, dynamic.screen, { backgroundColor: baseColor }]}>
        {children}
      </Screen>
      {floatingElement}
    </SafeAreaView>
  );
};

export default Panel;
