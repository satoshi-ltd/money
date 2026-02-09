import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { getStyles } from './InsightsCarousel.style';
import { useApp, useStore } from '../../contexts';
import { ICON, L10N } from '../../modules';
import { Icon, Pressable, ScrollView, Text, View } from '../../primitives';
import { theme } from '../../theme';
import { cardAccountSize, cardAccountSnap, cardGap, viewOffset } from '../../theme/layout';
import Card from '../Card';
import { LineChart } from '../LineChart';
import { MetricBar } from '../MetricBar';
import { PriceFriendly } from '../PriceFriendly';

const InsightsCarousel = ({
  animateCharts = false,
  balanceCard,
  currency,
  highlightBalanceCard = false,
  insights = [],
}) => {
  const { colors } = useApp();
  const { settings: { maskAmount } = {}, updateSettings } = useStore();
  const { width } = useWindowDimensions();
  const style = useMemo(() => getStyles(colors), [colors]);
  const chartStagger = useMemo(() => Math.round(theme.animations.duration.quick / 5), []);

  const cards = useMemo(() => {
    const normalized = Array.isArray(insights) ? insights : [];
    return balanceCard ? [{ id: 'balance_card', type: 'balance_card', ...balanceCard }, ...normalized] : normalized;
  }, [balanceCard, insights]);

  const hasCards = cards.length > 0;
  const twoCardMode = cards.length === 2;
  const twoCardSize = (width - viewOffset * 2 - cardGap) / 2;
  const cardSize = twoCardMode ? twoCardSize : cardAccountSize;
  const cardStyle = { width: cardSize, height: cardAccountSize };

  const formatSignedPercent = (value = 0) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;

  const renderBalanceCard = (card, index = 0) => {
    const { chartValues = [], progressionPercentage, title, value } = card || {};
    const showChart = Array.isArray(chartValues) && chartValues.length > 0;
    const showPercentage = Number.isFinite(progressionPercentage) && progressionPercentage !== 0;
    const toggleMask = () => updateSettings?.({ maskAmount: !maskAmount });
    const shouldAnimateChart = animateCharts && index < 4;
    const isHighlighted = highlightBalanceCard;
    const contentTone = isHighlighted ? 'onAccent' : undefined;
    const chartColor = isHighlighted ? colors.onAccent : undefined;

    const content = (
      <Pressable onPress={toggleMask}>
        <Card active={isHighlighted} style={[style.insightCard, cardStyle]}>
          <View style={style.balanceCardContent}>
            {showChart ? (
              <LineChart
                color={chartColor}
                height={cardSize / 2}
                isAnimated={false}
                reveal={shouldAnimateChart}
                revealDelay={shouldAnimateChart ? index * chartStagger : 0}
                revealResetKey={card?.id}
                values={chartValues}
                width={cardSize}
                style={style.balanceChart}
              />
            ) : null}

            <View style={style.balanceOverlay}>
              <View>
                <View row>
                  <Text bold ellipsizeMode="tail" numberOfLines={1} size="xs" tone={contentTone}>
                    {`${title}`.toUpperCase()}
                  </Text>
                </View>
                <PriceFriendly bold size="l" tone={contentTone} currency={currency} value={value} />
              </View>

              {showPercentage ? (
                <PriceFriendly
                  bold
                  size="s"
                  currency="%"
                  fixed={2}
                  operator
                  style={[style.balancePercentage, style.chartLabel, isHighlighted && style.chartLabelOnAccent]}
                  tone={isHighlighted ? 'onAccent' : 'accent'}
                  value={progressionPercentage}
                />
              ) : null}
            </View>
          </View>
        </Card>
      </Pressable>
    );

    return content;
  };

  const renderInsightCard = (insight, index = 0) => {
    const isAmount = insight.type === 'net' || insight.type === 'pace';
    const showCategories = insight.type === 'categories';
    const showChart = !!insight.chart?.values?.length;
    const topItems = (insight.items || []).slice(0, 3);
    const shouldAnimateChart = animateCharts && index < 4;

    return (
      <Card style={[style.insightCard, cardStyle]}>
        <View style={style.insightCardContent}>
          <View style={style.insightHeader}>
            <Text align="left" bold uppercase numberOfLines={2} size="xs">
              {insight.title}
            </Text>
            {insight.caption ? (
              <Text tone="secondary" numberOfLines={2} size="xs">
                {insight.caption}
              </Text>
            ) : null}
          </View>
          <View flex style={style.insightContent}>
            {isAmount ? (
              <View style={style.insightValue}>
                <PriceFriendly bold size="l" currency={currency} operator value={insight.value} />
              </View>
            ) : null}
            {insight.type === 'trend' && insight.valueLabel ? (
              <View style={style.insightTrendValue}>
                <PriceFriendly
                  bold
                  tone="accent"
                  currency="%"
                  fixed={0}
                  operator
                  size="s"
                  style={style.chartLabel}
                  value={insight.value}
                />
              </View>
            ) : null}
            {insight.type === 'alert' && insight.valueLabel ? (
              <View row style={style.insightValueRow}>
                <Icon name={ICON.ALERT} tone="accent" size="xs" />
                <Text bold tone="accent" size="xl">
                  {insight.valueLabel}
                </Text>
              </View>
            ) : null}
            {insight.type === 'mover' && insight.valueLabel ? (
              <View row style={style.insightValueRow}>
                <Text bold tone="accent" size="xl" style={style.chartLabel}>
                  {formatSignedPercent(insight.value)}
                </Text>
              </View>
            ) : null}
            {insight.type === 'mover' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  color="accent"
                  percent={(insight.meta.current / Math.max(1, insight.meta.current + insight.meta.avg)) * 100}
                  title={L10N.INSIGHT_THIS_MONTH}
                  value={<PriceFriendly size="xs" tone="secondary" currency={currency} value={insight.meta.current} />}
                />
                <MetricBar
                  color="content"
                  percent={(insight.meta.avg / Math.max(1, insight.meta.current + insight.meta.avg)) * 100}
                  title={L10N.INSIGHT_3MO_AVG}
                  value={<PriceFriendly size="xs" tone="secondary" currency={currency} value={insight.meta.avg} />}
                />
              </View>
            ) : null}
            {insight.type === 'net' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  color="accent"
                  percent={(insight.meta.incomes / Math.max(1, insight.meta.incomes + insight.meta.expenses)) * 100}
                  title={L10N.INCOME}
                  value={<PriceFriendly size="xs" tone="secondary" currency={currency} value={insight.meta.incomes} />}
                />
                <MetricBar
                  color="content"
                  percent={(insight.meta.expenses / Math.max(1, insight.meta.incomes + insight.meta.expenses)) * 100}
                  title={L10N.EXPENSE}
                  value={<PriceFriendly size="xs" tone="secondary" currency={currency} value={insight.meta.expenses} />}
                />
              </View>
            ) : null}
            {insight.type === 'pace' && insight.meta ? (
              <View style={style.insightMetrics}>
                <MetricBar
                  percent={(insight.meta.day / insight.meta.daysInMonth) * 100}
                  title={L10N.INSIGHT_MONTH_PROGRESS}
                  value={`${insight.meta.day}/${insight.meta.daysInMonth}`}
                />
              </View>
            ) : null}
            {showChart ? (
              <LineChart
                height={cardSize * 0.35}
                reveal={shouldAnimateChart}
                revealDelay={shouldAnimateChart ? index * chartStagger : 0}
                revealResetKey={insight?.id}
                monthsLimit={insight.chart.monthsLimit}
                values={insight.chart.values}
                style={insight.type === 'trend' ? style.insightChartTrend : style.insightChart}
                width={insight.type === 'trend' ? cardSize : cardSize - theme.spacing.sm * 2}
              />
            ) : null}
            {showCategories ? (
              <View style={style.insightCategories}>
                {topItems.map((item) => (
                  <View key={`${insight.id}-${item.category}`} style={style.insightCategoryItem}>
                    <MetricBar percent={item.share} title={item.label} value={`${Math.round(item.share)}%`} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  if (!hasCards) return null;

  if (twoCardMode) {
    return (
      <View row style={style.twoCardsRow}>
        {cards.map((card, index) => {
          const body = card.type === 'balance_card' ? renderBalanceCard(card, index) : renderInsightCard(card, index);
          return (
            <View
              key={card.id || `${card.type}-${index}`}
              style={[style.twoCard, index === 1 && style.twoCardGap, { width: cardSize }]}
            >
              {body}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView horizontal snapTo={cardAccountSnap} style={style.scroll}>
      {cards.map((card, index) => {
        const isFirst = index === 0;
        const isLast = index === cards.length - 1;
        const body = card.type === 'balance_card' ? renderBalanceCard(card, index) : renderInsightCard(card, index);
        return (
          <View
            key={card.id || `${card.type}-${index}`}
            style={[style.card, isFirst && style.firstCard, isLast && style.lastCard]}
          >
            {body}
          </View>
        );
      })}
    </ScrollView>
  );
};

InsightsCarousel.propTypes = {
  animateCharts: PropTypes.bool,
  currency: PropTypes.string,
  highlightBalanceCard: PropTypes.bool,
  insights: PropTypes.arrayOf(PropTypes.shape({})),
  balanceCard: PropTypes.shape({
    title: PropTypes.string,
    value: PropTypes.number,
    chartValues: PropTypes.arrayOf(PropTypes.number),
    progressionPercentage: PropTypes.number,
  }),
};

export { InsightsCarousel };
