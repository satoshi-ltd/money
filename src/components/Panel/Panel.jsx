import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { viewOffset } from '../../theme/layout';
import Header from '../Header';
import Screen from '../Screen';

const Panel = ({
  children,
  title,
  onBack,
  leftElement,
  rightElement,
  showBorder = false,
  transparent = false,
  disableScroll = false,
  style,
  ...props
}) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useApp();
  const paddingBottom = viewOffset + bottom;
  const showHeader = title !== undefined || onBack || leftElement || rightElement;
  const baseColor = colors.background;
  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: baseColor },
        headerBg: { backgroundColor: baseColor },
        screen: { paddingBottom },
      }),
    [baseColor, paddingBottom],
  );

  return (
    <SafeAreaView edges={['top']} style={dynamic.safeArea}>
      {showHeader ? (
        <Header
          title={title ?? ''}
          onBack={onBack}
          leftElement={leftElement}
          rightElement={rightElement}
          showBorder={showBorder}
          transparent={transparent}
          style={!transparent ? dynamic.headerBg : null}
        />
      ) : null}
      <Screen disableScroll={disableScroll} {...props} style={[style, dynamic.screen]}>
        {children}
      </Screen>
    </SafeAreaView>
  );
};

export default Panel;
