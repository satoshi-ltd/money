import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { CurveType, LineChart as LineChartBase } from 'react-native-gifted-charts';

import { getLastMonths } from './helpers';
import { style } from './LineChart.style';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const LineChart = ({
  color: propColor,
  currency,
  height,
  multipleData = false,
  pointerConfig = {},
  showPointer = false,
  values = [],
  width,
  onPointerChange = () => {},
  style: propStyle,
  ...props
}) => {
  const { settings: { colorCurrency } = {} } = useStore();

  const colorAccent = (colorCurrency && C.COLOR[currency]) || StyleSheet.value('$colorAccent');

  const [color, color2] = multipleData ? propColor : [propColor || colorAccent];
  let [data = [], data2 = []] = multipleData ? values : [values];

  data = data.filter((value) => typeof value === 'number' && !isNaN(value));
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const maxValue = max + range * 0.05;
  const minValue = min - range * 0.15;

  const months = getLastMonths();

  return (
    <View style={{ height, opacity: 1, width: '100%', ...propStyle }}>
      <LineChartBase
        {...{
          color,
          height,
          maxValue,
          minValue,
          width,
        }}
        adjustToWidth
        curved
        curveType={CurveType.QUADRATIC}
        data={data.map((value, index) => ({ index, value, dataPointText: value }))}
        data2={data2?.map((value, index) => ({ index, value: value, dataPointText: value }))}
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
        {...(multipleData ? { color2, startFillColor2: color2, endFillColor2: color2 } : {})}
        // -- pointer
        pointerConfig={
          showPointer
            ? {
                autoAdjustPointerLabelPosition: true,
                initialPointerIndex: data.length ? data.length - 1 : undefined,
                pointerLabelComponent: ([{ index, value } = {}]) => {
                  // ! TODO: Seems is dispatching too much times
                  onPointerChange(index);

                  return !multipleData ? (
                    <View align="center">
                      <Text bold tiny style={style.pointerCaption}>
                        {L10N.MONTHS[months[index]?.month || 0]} {months[index]?.year || ''}
                      </Text>
                      <View style={style.pointerValue}>
                        <PriceFriendly bold caption color="base" {...{ currency, value }} />
                      </View>
                    </View>
                  ) : null;
                },
                pointerVanishDelay: 0,
                pointerLabelHeight: 48,
                pointerLabelWidth: 96,
                pointerColor: color,
                pointer2Color: color2,
                pointerStripColor: StyleSheet.value('$colorContentLight'),
                pointerStripWidth: 1,
                ...pointerConfig,
              }
            : undefined
        }
        {...props}
      />
    </View>
  );
};

LineChart.propTypes = {
  color: PropTypes.any,
  currency: PropTypes.string,
  height: PropTypes.number,
  multipleData: PropTypes.bool,
  pointerConfig: PropTypes.shape({}),
  showPointer: PropTypes.bool,
  values: PropTypes.any,
  width: PropTypes.number,
  style: PropTypes.any,
  onPointerChange: PropTypes.func,
};

export { LineChart };
