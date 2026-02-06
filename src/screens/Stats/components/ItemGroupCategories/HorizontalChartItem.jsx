import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

import { getStyles } from './HorizontalChartItem.style';
import { Icon, Text, View } from '../../../../components';
import { PriceFriendly } from '../../../../components';
import { useApp } from '../../../../contexts';
import { viewOffset } from '../../../../theme/layout';

const screen = Dimensions.get('window');

const HorizontalChartItem = ({ color, currency, detail, icon, title, value, width: propWidth = 0 }) => {
  const width = useRef(new Animated.Value(propWidth)).current;
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    Animated.timing(width, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      toValue: ((screen.width - viewOffset * 2) * propWidth) / 100,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propWidth]);

  const textProps = {
    bold: !detail,
    tone: detail ? 'secondary' : 'primary',
    size: detail ? 'xs' : 's',
  };

  return (
    <>
      {!detail && (
        <Animated.View style={[style.bar, color ? { backgroundColor: color, opacity: 0.33 } : undefined, { width }]} />
      )}

      <View row style={[style.content, detail && style.detail]}>
        <Icon name={icon} size="xs" />
        <View flex>
          <Text {...textProps}>{title}</Text>
        </View>
        <PriceFriendly {...textProps} currency={currency} fixed={0} value={value} />
      </View>
    </>
  );
};

HorizontalChartItem.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  detail: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
