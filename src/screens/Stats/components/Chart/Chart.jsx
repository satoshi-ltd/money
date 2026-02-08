import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';

import { style } from './Chart.style';
import { Heading, Text, View } from '../../../../components';
import { LineChart, PriceFriendly } from '../../../../components';
import { L10N } from '../../../../modules';
import { viewOffset } from '../../../../theme/layout';
import { calcScales } from '../../modules';

const Chart = ({
  compact = false,
  color,
  currency,
  multipleData,
  headingRight,
  monthsLimit,
  pointerIndex,
  scaleMode = 'median',
  title,
  values = [],
  onPointerChange,
  style: styleContainer,
}) => {
  const [color1, color2] = multipleData ? color : [color];
  const [data1 = [], data2 = []] = multipleData ? values : [values];
  const normalize = (data = []) =>
    data.filter((val) => typeof val === 'number' && !isNaN(val)).map((val) => Math.max(0, val));
  const normalizedData1 = normalize(data1);
  const normalizedData2 = normalize(data2);
  const safePointerIndex = (() => {
    const len1 = normalizedData1.length;
    const len2 = normalizedData2.length;
    const hasData = multipleData ? len1 > 0 || len2 > 0 : len1 > 0;
    if (!hasData) return undefined;

    const maxIndex1 = Math.max(0, len1 - 1);
    const maxIndex2 = Math.max(0, len2 - 1);
    const maxIndex = multipleData
      ? len1 > 0 && len2 > 0
        ? Math.min(maxIndex1, maxIndex2)
        : Math.max(maxIndex1, maxIndex2)
      : maxIndex1;

    const requested = Number.isFinite(pointerIndex) ? pointerIndex : maxIndex;
    return Math.max(0, Math.min(requested, maxIndex));
  })();
  const { width } = useWindowDimensions();
  const chartWidth = width - viewOffset * 2;
  const chartHeight = compact ? 108 : 128;

  // Gifted-charts `isAnimated` can be visually flaky here; keep charts static and animate a safe reveal.
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.stopAnimation();
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: chartWidth,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [chartWidth, reveal]);

  const resolveScaleEntries = (dataSource = []) => {
    const scales = calcScales(dataSource);
    const entries = Object.entries(scales).filter(([, value]) => Number.isFinite(value));

    if (scaleMode !== 'median') return entries;

    const medEntry = entries.find(([key]) => key === 'med');
    if (medEntry) return [medEntry];

    const maxEntry = entries.find(([key]) => key === 'max');
    if (maxEntry) return [maxEntry];

    const minEntry = entries.find(([key]) => key === 'min');
    return minEntry ? [minEntry] : [];
  };

  // eslint-disable-next-line react/prop-types
  const Scale = ({ color, dataSource }) => {
    const filtered = resolveScaleEntries(dataSource);

    return (
      <View row style={style.scale}>
        {filtered.map(([key, value], index) => (
          <View key={key} row style={style.scale}>
            <PriceFriendly {...{ color, currency, value }} bold fixed={0} size="xs" label={`${L10N.SCALE_KEY[key]} `} />
            {index < filtered.length - 1 && (
              <Text tone="secondary" size="xs">
                |
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const CombinedScale = () => {
    const first = resolveScaleEntries(normalizedData1)?.[0];
    const second = resolveScaleEntries(normalizedData2)?.[0];
    if (!first && !second) return null;

    return (
      <View row style={style.scale}>
        {first ? (
          <PriceFriendly
            color={color1}
            bold
            currency={currency}
            fixed={0}
            value={first[1]}
            size="xs"
            label={`${L10N.INCOMES} ${L10N.SCALE_KEY[first[0]]} `}
          />
        ) : null}
        {first && second ? (
          <Text tone="secondary" size="xs">
            |
          </Text>
        ) : null}
        {second ? (
          <PriceFriendly
            color={color2}
            bold
            currency={currency}
            fixed={0}
            value={second[1]}
            size="xs"
            label={`${L10N.EXPENSES} ${L10N.SCALE_KEY[second[0]]} `}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View offset style={styleContainer}>
      <Heading value={title}>{headingRight}</Heading>

      {multipleData ? <CombinedScale /> : <Scale color={color1} dataSource={normalizedData1} />}

      <Animated.View style={{ width: reveal, overflow: 'hidden' }}>
        <LineChart
          {...{
            currency,
            color,
            multipleData,
            monthsLimit,
            values: multipleData ? [normalizedData1, normalizedData2] : normalizedData1,
            onPointerChange,
          }}
          height={chartHeight}
          pointerConfig={{
            // Range toggles can briefly render with a stale/out-of-bounds pointerIndex.
            // Clamp to available data to avoid gifted-charts crashing on undefined datapoints.
            initialPointerIndex: safePointerIndex,
            persistPointer: true,
            pointerLabelHeight: compact ? 42 : 48,
            pointerLabelWidth: compact ? 88 : 96,
            shiftPointerLabelY: compact ? 8 : 12,
          }}
          showPointer
          width={chartWidth}
        />
      </Animated.View>
    </View>
  );
};

Chart.propTypes = {
  compact: PropTypes.bool,
  color: PropTypes.any,
  currency: PropTypes.string,
  multipleData: PropTypes.bool,
  headingRight: PropTypes.node,
  monthsLimit: PropTypes.number,
  pointerIndex: PropTypes.number,
  scaleMode: PropTypes.oneOf(['full', 'median']),
  title: PropTypes.string,
  values: PropTypes.any,
  onPointerChange: PropTypes.func,
  style: PropTypes.any,
};

export { Chart };
