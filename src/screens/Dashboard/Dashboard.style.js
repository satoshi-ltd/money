import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { cardAccountSize, cardGap, viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: viewOffset,
  },

  scrollView: {
    marginBottom: theme.spacing.md,
    paddingRight: viewOffset,
  },
  insightsHeading: {
    marginTop: 0,
  },
  insightsScroll: {
    marginBottom: theme.spacing.xxs,
    paddingRight: viewOffset,
  },
  insightCard: {
    width: cardAccountSize,
    height: cardAccountSize,
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
  insightCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  insightContent: {
    flex: 0,
    gap: theme.spacing.xxs,
  },
  insightHeader: {
    gap: theme.spacing.xxs,
  },
  insightValueRow: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  insightChart: {
    marginTop: theme.spacing.xs,
  },
  insightChartTrend: {
    marginTop: 0,
    marginLeft: theme.spacing.sm * -1,
  },
  insightTrendValue: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  insightValue: {},
  insightCategories: {
    gap: theme.spacing.xxs,
  },
  insightCategoryItem: {
    gap: theme.spacing.xxs,
  },
  insightMetrics: {
    gap: theme.spacing.xxs,
  },
  insightEmpty: {
    marginBottom: theme.spacing.md,
    marginHorizontal: viewOffset,
  },
  accountsHeading: {
    marginTop: theme.spacing.md,
  },
  headingTight: {
    marginTop: theme.spacing.xs,
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

  inputSearch: {
    marginHorizontal: viewOffset,
    marginBottom: viewOffset,
  },
});
