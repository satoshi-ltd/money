import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$viewOffset',
  },

  scrollView: {
    marginBottom: '$spaceM',
    paddingRight: '$viewOffset',
  },
  summary: {
    marginBottom: '$spaceL',
  },
  insightsHeading: {
    marginTop: '$spaceS',
  },
  insightsScroll: {
    marginBottom: '$spaceXXS',
    paddingRight: '$viewOffset',
  },
  insightCard: {
    width: '$cardAccountSize',
    height: '$cardAccountSize',
    padding: '$spaceS',
  },
  insightCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  insightContent: {
    flex: 0,
    gap: '$spaceXXS',
  },
  insightHeader: {
    gap: '$spaceXXS',
  },
  insightValueRow: {
    alignItems: 'center',
    gap: '$spaceXS',
  },
  insightChart: {
    marginTop: '$spaceXS',
  },
  insightChartTrend: {
    marginTop: 0,
    marginLeft: '$spaceS * -1',
  },
  insightTrendValue: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 1,

  },
  insightValue: {
  },
  insightCategories: {
    gap: '$spaceXXS',
  },
  insightCategoryItem: {
    gap: '$spaceXXS',
  },
  insightMetrics: {
    gap: '$spaceXXS',
  },
  insightEmpty: {
    marginBottom: '$spaceM',
    marginHorizontal: '$viewOffset',
  },
  accountsHeading: {
    marginTop: '$spaceM',
  },
  headingTight: {
    marginTop: '$spaceXS',
  },

  card: {
    marginLeft: '$cardGap',
  },

  firstCard: {
    marginLeft: '$viewOffset',
  },

  lastCard: {
    marginRight: '$viewOffset',
  },

  inputSearch: {
    marginHorizontal: '$viewOffset',
    marginBottom: '$viewOffset',
  },
});
