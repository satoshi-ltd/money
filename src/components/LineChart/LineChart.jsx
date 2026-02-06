import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { CurveType, LineChart as LineChartBase } from 'react-native-gifted-charts';

import { getLastMonths } from './helpers';
import { useApp } from '../../contexts';
import { C, L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';
import { getStyles } from './LineChart.style';
import { Text, View } from '../../primitives';

const LineChart = ({
  color: propColor,
  currency,
  height,
  multipleData = false,
  monthsLimit,
  pointerConfig = {},
  showPointer = false,
  values = [],
  width,
  onPointerChange = () => {},
  style: propStyle,
  ...props
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const colorAccent = colors.accent;
  const [color, color2] = multipleData ? propColor : [propColor || colorAccent];
  let [data = [], data2 = []] = multipleData ? values : [values];
  const lastPointerIndexRef = useRef();

  const normalize = (series = []) =>
    series.filter((value) => typeof value === 'number' && !isNaN(value)).map((value) => Math.max(0, value));

  const resolvedWidth = Number.isFinite(width) ? width : windowWidth;
  const resolvedHeight = Number.isFinite(height) ? height : 128;

  data = normalize(data);
  data2 = normalize(data2);
  const hasData = data.length > 0;
  const max = hasData ? Math.max(...data) : 0;
  const min = hasData ? Math.min(...data) : 0;
  const range = max - min;
  // Gifted-charts can produce invalid SVG paths if maxValue === minValue (range = 0).
  const safeRange = range === 0 ? (max === 0 ? 1 : Math.abs(max)) : range;
  const maxValue = hasData ? max + safeRange * 0.05 : 0;
  const minValue = hasData ? Math.max(0, min - safeRange * 0.15) : 0;

  const months = useMemo(() => getLastMonths(monthsLimit), [monthsLimit]);
  const sizedStyle = useMemo(
    () =>
      StyleSheet.create({
        sized: { height: resolvedHeight, width: resolvedWidth },
      }).sized,
    [resolvedHeight, resolvedWidth],
  );

  const handlePointerIndex = useCallback(
    (index) => {
      if (!Number.isFinite(index)) return;
      if (lastPointerIndexRef.current === index) return;
      lastPointerIndexRef.current = index;
      onPointerChange(index);
    },
    [onPointerChange],
  );

  return (
    <View style={[style.container, sizedStyle, propStyle]}>
      <LineChartBase
        {...{
          color,
          height: resolvedHeight,
          maxValue,
          minValue,
          width: resolvedWidth,
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
                  handlePointerIndex(index);

                  return !multipleData ? (
                    <View align="center">
                      <Text bold style={style.pointerCaption} size="xs">
                        {L10N.MONTHS[months[index]?.month || 0]} {months[index]?.year || ''}
                      </Text>
                      <View style={style.pointerValue}>
                        <PriceFriendly bold size="s" tone="onInverse" {...{ currency, value }} />
                      </View>
                    </View>
                  ) : null;
                },
                pointerVanishDelay: 0,
                pointerLabelHeight: 48,
                pointerLabelWidth: 96,
                pointerColor: color,
                pointer2Color: color2,
                pointerStripColor: colors.textSecondary,
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
  monthsLimit: PropTypes.number,
  pointerConfig: PropTypes.shape({}),
  showPointer: PropTypes.bool,
  values: PropTypes.any,
  width: PropTypes.number,
  style: PropTypes.any,
  onPointerChange: PropTypes.func,
};

export { LineChart };
