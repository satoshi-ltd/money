import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { LineChart as LineChartBase } from 'react-native-gifted-charts';

import { style } from './LineChart.style';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
// ! TODO: Should refactor this method
import { getLastMonths } from '../../screens/Stats/components/SliderMonths/modules';
import { PriceFriendly } from '../PriceFriendly';

const { COLOR, STATS_MONTHS_LIMIT } = C;

const LineChart = ({
  color: propColor,
  currency,
  height,
  showPointer = false,
  values = [],
  width,
  style: propStyle,
  ...props
}) => {
  const { settings: { colorCurrency = false } = {} } = useStore();

  const color = propColor || (colorCurrency && COLOR[currency]) || StyleSheet.value('$colorAccent');

  values = values.filter((value) => typeof value === 'number' && !isNaN(value));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  const maxValue = max + range * 0.05;
  const minValue = min - range * 0.15;

  const months = getLastMonths(STATS_MONTHS_LIMIT);

  return (
    <View style={{ height, opacity: 1, width: '100%', ...propStyle }}>
      <LineChartBase
        {...{ color, height, maxValue, minValue, width }}
        adjustToWidth
        curved
        data={values.map((value, index) => ({ index, value, dataPointText: parseInt(value) }))}
        disableScroll
        endSpacing={0}
        hideAxesAndRules
        hideDataPoints
        initialSpacing={0}
        isAnimated
        thickness={2}
        xAxisLabelHeight={0}
        yAxisLabelWidth={0}
        // -- area
        areaChart
        startFillColor={color}
        startOpacity={0.33}
        endOpacity={0}
        endFillColor={color}
        // -- pointer
        pointerConfig={
          showPointer
            ? {
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: ([{ index, value }]) => (
                  <View align="center">
                    <Text bold tiny style={style.pointerCaption}>
                      {L10N.MONTHS[months[index - 1]?.month || 0]} {months[index - 1]?.year || ''}
                    </Text>
                    <View style={style.pointerValue}>
                      <PriceFriendly bold caption color="base" {...{ currency, value }} />
                    </View>
                  </View>
                ),
                pointerLabelHeight: 48,
                pointerLabelWidth: 96,
                pointerColor: color,
                pointerStripColor: StyleSheet.value('$colorContentLight'),
                pointerStripWidth: 1,
              }
            : undefined
        }
        {...props}
      />
    </View>
  );
};

LineChart.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  height: PropTypes.number,
  showPointer: PropTypes.bool,
  values: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  style: PropTypes.any,
};

export { LineChart };
