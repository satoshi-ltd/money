import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Line, Rect, Svg } from 'react-native-svg';

import { style } from './FlowChart.style';
import { buildFlowColumns, FLOW_VISIBLE, flowLayout, flowScrollOffset } from './helpers';
import { useApp } from '../../contexts';
import { L10N } from '../../modules';
import { Pressable, ScrollView, Text, View } from '../../primitives';
import { Heading } from '../Heading';
import { viewOffset } from '../../theme/layout';
import { PriceFriendly } from '../PriceFriendly';

const CHART_HEIGHT = 132;

const FlowChart = ({ currency, expenses = [], incomes = [], monthsLimit, selectedIndex, onSelectMonth, ...others }) => {
  const { colors } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef(null);
  const viewportWidth = windowWidth - viewOffset * 2;
  const slotWidth = viewportWidth / FLOW_VISIBLE;

  const columns = useMemo(() => buildFlowColumns({ expenses, incomes, monthsLimit }), [expenses, incomes, monthsLimit]);
  const layout = useMemo(() => flowLayout({ columns, slotWidth, height: CHART_HEIGHT }), [columns, slotWidth]);

  const count = columns.length;
  useEffect(() => {
    if (!count || !Number.isFinite(selectedIndex)) return;
    const x = flowScrollOffset({ count, index: selectedIndex, slotWidth, viewportWidth });
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [count, selectedIndex, slotWidth, viewportWidth]);

  if (!layout) return null;

  const { averages, bars, baselineY, expenseAverageY, incomeAverageY, width } = layout;

  return (
    <View style={[style.block, others.style]}>
      <Heading value={L10N.CASHFLOW} />

      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        style={style.chart}
        contentContainerStyle={{ width }}
      >
        <View>
          <Svg width={width} height={CHART_HEIGHT}>
            <Line x1={0} y1={baselineY} x2={width} y2={baselineY} stroke={colors.border} strokeWidth={1} />
            {bars.map((bar, index) => (
              <React.Fragment key={columns[index].globalIndex}>
                {bar.incomeHeight > 0 ? (
                  <Rect x={bar.x} y={bar.incomeY} width={bar.width} height={bar.incomeHeight} fill={colors.accent} />
                ) : null}
                {bar.expenseHeight > 0 ? (
                  <Rect x={bar.x} y={bar.expenseY} width={bar.width} height={bar.expenseHeight} fill={colors.text} />
                ) : null}
              </React.Fragment>
            ))}
            <Line
              x1={0}
              y1={incomeAverageY}
              x2={width}
              y2={incomeAverageY}
              stroke={colors.positive}
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.75}
            />
            <Line
              x1={0}
              y1={expenseAverageY}
              x2={width}
              y2={expenseAverageY}
              stroke={colors.textSecondary}
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.85}
            />
          </Svg>
          {onSelectMonth ? (
            <View pointerEvents="box-none" style={style.overlay}>
              {columns.map(({ globalIndex }) => (
                <Pressable
                  key={globalIndex}
                  style={[style.column, { width: slotWidth }]}
                  onPress={() => onSelectMonth(globalIndex)}
                />
              ))}
            </View>
          ) : null}

          <View row style={style.labels}>
            {columns.map(({ globalIndex, label }) => {
              const selected = globalIndex === selectedIndex;
              return (
                <Text
                  key={globalIndex}
                  align="center"
                  figure="xs"
                  medium={selected}
                  style={[style.label, { width: slotWidth }]}
                  tone={selected ? 'primary' : 'muted'}
                >
                  {label}
                </Text>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View row style={style.legend}>
        <View row style={style.legendItem}>
          <View style={[style.dot, { backgroundColor: colors.accent }]} />
          <PriceFriendly
            currency={currency}
            fixed={0}
            label={`${L10N.FLOW_IN} · ${L10N.AVERAGE} `}
            size="xs"
            tone="muted"
            value={averages.income}
          />
        </View>
        <View row style={style.legendItem}>
          <View style={[style.dot, { backgroundColor: colors.text }]} />
          <PriceFriendly
            currency={currency}
            fixed={0}
            label={`${L10N.FLOW_OUT} · ${L10N.AVERAGE} `}
            size="xs"
            tone="muted"
            value={averages.expense}
          />
        </View>
      </View>
    </View>
  );
};

FlowChart.propTypes = {
  currency: PropTypes.string,
  expenses: PropTypes.array,
  incomes: PropTypes.array,
  monthsLimit: PropTypes.number,
  selectedIndex: PropTypes.number,
  onSelectMonth: PropTypes.func,
};

export { FlowChart };
