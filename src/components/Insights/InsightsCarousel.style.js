import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { cardAccountSize, cardGap, viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  scroll: {
    marginBottom: theme.spacing.xxs,
    paddingRight: viewOffset,
  },
  card: {
    marginLeft: cardGap,
  },
  firstCard: {
    marginLeft: viewOffset,
  },
  lastCard: {
    marginRight: viewOffset,
  },

  insightCard: {
    width: cardAccountSize,
    height: cardAccountSize,
  },
  insightCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  insightHeader: {
    gap: theme.spacing.xxs,
  },
  insightContent: {
    flex: 0,
    gap: theme.spacing.xxs,
  },
  insightValue: {},
  insightValueRow: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  insightTrendValue: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  insightChart: {
    marginTop: theme.spacing.xs,
  },
  insightChartTrend: {
    marginTop: 0,
    marginLeft: theme.spacing.sm * -1,
  },
  insightCategories: {
    gap: theme.spacing.xxs,
  },
  insightCategoryItem: {
    gap: theme.spacing.xxs,
  },
  insightMetrics: {
    gap: theme.spacing.xxs,
  },

  balanceCardContent: {
    flex: 1,
  },
  balanceOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  balanceChart: {
    bottom: theme.spacing.xxs,
    left: theme.spacing.sm * -1,
    right: theme.spacing.sm * -1,
    position: 'absolute',
    zIndex: 0,
  },
  balancePercentage: {
    alignSelf: 'flex-start',
  },
});
