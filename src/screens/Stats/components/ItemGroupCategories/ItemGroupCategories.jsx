import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { HorizontalChartItem } from './HorizontalChartItem';
import { getStyles } from './ItemGroupCategories.style';
import { Eyebrow, Heading, Pressable, View } from '../../../../components';
import { useAmountSettings, useApp } from '../../../../contexts';
import { budgetOf, C, L10N, percentText, rankInk } from '../../../../modules';
import { orderByAmount } from '../../modules';

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const TOP_CATEGORIES = 3;

const spokenAmount = (value, currency, language) => {
  try {
    return new Intl.NumberFormat(language, { currency, maximumFractionDigits: 0, style: 'currency' }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
};

const ItemGroupCategories = ({ budgets, dataSource, month, monthLabel, previous, type, year }) => {
  const { baseCurrency, maskAmount } = useAmountSettings();
  const { colors, language } = useApp();
  const { navigate } = useNavigation();
  const [showRest, setShowRest] = useState(false);
  const style = useMemo(() => getStyles(colors), [colors]);

  const totals = [];
  let total = 0;
  Object.keys(dataSource).forEach((category) => {
    if (category >= 0) {
      totals[category] = Object.values(dataSource[category]).reduce((a, b) => (a += b));
      total += totals[category];
    }
  });

  const spentIn = (source, key) => Object.values(source?.[key] || {}).reduce((a, b) => a + b, 0);
  const budgetFor = (key, amount) =>
    type === EXPENSE && budgets?.[key]
      ? budgetOf({
          entry: budgets[key],
          month: year * 12 + month,
          spent: amount,
          spentBefore: previous ? spentIn(previous, key) : budgets[key].limit,
        })
      : undefined;

  const ordered = orderByAmount(totals);
  const top = ordered.slice(0, TOP_CATEGORIES);
  const rest = ordered.slice(TOP_CATEGORIES);
  const restTotal = rest.reduce((sum, { amount }) => sum + amount, 0);

  return (
    <View style={style.container}>
      <Heading eyebrow={monthLabel} value={type === EXPENSE ? L10N.EXPENSES : L10N.INCOMES} />

      {[...top, ...(showRest ? rest : [])].map(({ key, amount }, index) => {
        const color = rankInk(colors, index);
        const budget = budgetFor(key, amount);
        const share = Math.floor((amount / total) * 100);
        const label = [
          L10N.CATEGORIES[type][key],
          percentText(share),
          maskAmount ? undefined : spokenAmount(amount, baseCurrency, language),
          budget?.state === 'over' ? L10N.BUDGET_PASSED : undefined,
        ]
          .filter(Boolean)
          .join(', ');

        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            key={key}
            onPress={() =>
              navigate('category', {
                category: Number(key),
                color,
                merchants: Object.keys(dataSource[key] || {}).length,
                month,
                monthTotal: total,
                type,
                year,
              })
            }
          >
            <HorizontalChartItem
              budget={budget}
              color={color}
              currency={baseCurrency}
              title={L10N.CATEGORIES[type][key]}
              value={amount}
              width={share}
            />
          </Pressable>
        );
      })}

      {/* The summary was a dead end: a fifth of the spend sat behind a row that looked tappable and was not. */}
      {rest.length ? (
        <Pressable
          accessibilityLabel={
            showRest
              ? L10N.SHOW_LESS
              : [
                  `${L10N.OTHERS} · ${rest.length}`,
                  percentText(Math.floor((restTotal / total) * 100)),
                  maskAmount ? undefined : spokenAmount(restTotal, baseCurrency, language),
                ]
                  .filter(Boolean)
                  .join(', ')
          }
          accessibilityRole="button"
          onPress={() => setShowRest(!showRest)}
        >
          {showRest ? (
            <View style={style.showLess}>
              <Eyebrow style={style.showLessLabel}>{L10N.SHOW_LESS}</Eyebrow>
            </View>
          ) : (
            <HorizontalChartItem
              color={colors.textMuted}
              currency={baseCurrency}
              title={`${L10N.OTHERS} · ${rest.length}`}
              value={restTotal}
              width={Math.floor((restTotal / total) * 100)}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

ItemGroupCategories.propTypes = {
  budgets: PropTypes.shape({}),
  dataSource: PropTypes.shape({}).isRequired,
  month: PropTypes.number,
  monthLabel: PropTypes.string,
  previous: PropTypes.shape({}),
  type: PropTypes.number.isRequired,
  year: PropTypes.number,
};

export { ItemGroupCategories };
