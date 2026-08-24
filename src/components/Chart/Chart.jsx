import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { getStyles } from './Chart.style';
import { useApp } from '../../contexts';
import {
  chartBounds,
  compactFigure,
  getLastMonths,
  L10N,
  linePath,
  percentText,
  pointAt,
  trendPath,
} from '../../modules';
import { Pressable, Text, View } from '../../primitives';
import { viewOffset } from '../../theme/layout';
import { Eyebrow } from '../Eyebrow';
import { Delta } from '../Delta';
import { PriceFriendly } from '../PriceFriendly';

const PADDING = 10;
const AXIS_LABELS = 6;

const Chart = ({
  axis = true,
  caption,
  currency,
  delta,
  eyebrow,
  height = 112,
  heroValue,
  monthsLimit,
  pointerIndex,
  values = [],
  onPointerChange,
  style: styleContainer,
}) => {
  const { colors } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const style = useMemo(() => getStyles(colors, height), [colors, height]);

  const series = values.filter((value) => Number.isFinite(value));
  const width = windowWidth - viewOffset * 2;
  const geometry = { height, padding: PADDING, width };

  const months = useMemo(() => getLastMonths(monthsLimit || series.length), [monthsLimit, series.length]);
  const labels = useMemo(() => {
    const tail = months.slice(Math.max(0, months.length - series.length));
    if (tail.length <= AXIS_LABELS) return tail;
    const step = (tail.length - 1) / (AXIS_LABELS - 1);
    return Array.from({ length: AXIS_LABELS }, (_item, index) => tail[Math.round(index * step)]);
  }, [months, series.length]);

  if (series.length < 2) return null;

  const { max, min } = chartBounds(series);
  const gridlines = [max, (max + min) / 2, min];
  const marker = Number.isFinite(pointerIndex) ? Math.max(0, Math.min(pointerIndex, series.length - 1)) : undefined;
  const selected = marker !== undefined && marker !== series.length - 1 ? pointAt(series, marker, geometry) : undefined;
  const last = pointAt(series, series.length - 1, geometry);

  return (
    <View style={[style.block, styleContainer]}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

      {heroValue !== undefined ? (
        <View row style={style.heroRow}>
          <PriceFriendly bold currency={currency} size="xl" value={heroValue} />
          <Delta caption={caption} value={delta} />
        </View>
      ) : null}

      <View style={style.chart}>
        <Svg height={height} width={width}>
          {gridlines.map((value, index) => {
            const y = PADDING + ((height - PADDING * 2) / (gridlines.length - 1)) * index;
            return <Line key={index} stroke={colors.border} strokeWidth={1} x1={0} x2={width} y1={y} y2={y} />;
          })}
          <Path
            d={trendPath(series, geometry)}
            fill="none"
            stroke={colors.textMuted}
            strokeDasharray="2 3"
            strokeWidth={1}
          />
          <Path
            d={linePath(series, geometry)}
            fill="none"
            stroke={colors.text}
            strokeLinejoin="round"
            strokeWidth={1.6}
          />
          {selected ? (
            <>
              <Line
                stroke={colors.textMuted}
                strokeDasharray="2 3"
                strokeWidth={1}
                x1={selected.x}
                x2={selected.x}
                y1={0}
                y2={height}
              />
              <Circle
                cx={selected.x}
                cy={selected.y}
                fill={colors.accent}
                r={3.5}
                stroke={colors.background}
                strokeWidth={1.5}
              />
            </>
          ) : null}
          <Circle cx={last.x} cy={last.y} fill={colors.text} r={3} />
        </Svg>

        <View pointerEvents="none" style={style.gridLabels}>
          {gridlines.map((value, index) => (
            <Text key={index} figure="xs" tone="muted">
              {compactFigure(value)}
            </Text>
          ))}
        </View>

        {onPointerChange ? (
          <View row pointerEvents="box-none" style={style.overlay}>
            {series.map((value, index) => (
              <Pressable key={index} style={style.column} onPress={() => onPointerChange(index)} />
            ))}
          </View>
        ) : null}
      </View>

      {axis ? (
        <View row style={style.axis}>
          {labels.map((item, index) => (
            <Text key={index} figure="xs" tone="muted">
              {`${L10N.MONTHS[item?.month] || ''}`.slice(0, 3).toLowerCase()}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

Chart.propTypes = {
  axis: PropTypes.bool,
  caption: PropTypes.string,
  currency: PropTypes.string,
  delta: PropTypes.number,
  eyebrow: PropTypes.string,
  height: PropTypes.number,
  heroValue: PropTypes.number,
  monthsLimit: PropTypes.number,
  pointerIndex: PropTypes.number,
  values: PropTypes.array,
  onPointerChange: PropTypes.func,
  style: PropTypes.any,
};

export { Chart };
