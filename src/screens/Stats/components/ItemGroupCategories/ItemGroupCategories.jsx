import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { HorizontalChartItem } from './HorizontalChartItem';
import { getStyles } from './ItemGroupCategories.style';
import { Chip, Eyebrow, Heading, Pressable, View } from '../../../../components';
import { useApp, useStore } from '../../../../contexts';
import { C, ICON, L10N, rankInk } from '../../../../modules';
import { orderByAmount } from '../../modules';

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const TOP_CATEGORIES = 3;

const ItemGroupCategories = ({ dataSource, month, monthLabel, type, year }) => {
  const {
    settings: { baseCurrency },
  } = useStore();
  const { colors } = useApp();
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

  const ordered = orderByAmount(totals);
  const top = ordered.slice(0, TOP_CATEGORIES);
  const rest = ordered.slice(TOP_CATEGORIES);
  const restTotal = rest.reduce((sum, { amount }) => sum + amount, 0);

  return (
    <View style={style.container}>
      <Heading value={type === EXPENSE ? L10N.EXPENSES : L10N.INCOMES}>
        {monthLabel ? <Chip iconRight={ICON.DOWN} label={monthLabel} variant="outline" /> : null}
      </Heading>

      {[...top, ...(showRest ? rest : [])].map(({ key, amount }, index) => {
        const color = rankInk(colors, index);

        return (
          <Pressable
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
              color={color}
              currency={baseCurrency}
              title={L10N.CATEGORIES[type][key]}
              value={amount}
              width={Math.floor((amount / total) * 100)}
            />
          </Pressable>
        );
      })}

      {/* The summary was a dead end: a fifth of the spend sat behind a row that looked tappable and was not. */}
      {rest.length ? (
        <Pressable onPress={() => setShowRest(!showRest)}>
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
  dataSource: PropTypes.shape({}).isRequired,
  month: PropTypes.number,
  monthLabel: PropTypes.string,
  type: PropTypes.number.isRequired,
  year: PropTypes.number,
};

export { ItemGroupCategories };
