import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { HorizontalChartItem } from './HorizontalChartItem';
import { style } from './ItemGroupCategories.style';
import { Heading, PriceFriendly } from '../../../../components';
import { useStore } from '../../../../contexts';
import { C, getIcon, L10N } from '../../../../modules';
import { orderByAmount } from '../../modules';

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

const ItemGroupCategories = ({ color, dataSource, type }) => {
  const {
    settings: { baseCurrency },
  } = useStore();
  const [expand, setExpand] = useState(undefined);

  const totals = [];
  let total = 0;
  Object.keys(dataSource).forEach((category) => {
    if (category >= 0) {
      totals[category] = Object.values(dataSource[category]).reduce((a, b) => (a += b));
      total += totals[category];
    }
  });

  return (
    <View style={style.container}>
      <Heading color={color} value={type === EXPENSE ? L10N.EXPENSES : L10N.INCOMES} offset>
        <PriceFriendly
          bold
          color={color}
          currency={baseCurrency}
          fixed={0}
          operator
          value={total * (type === EXPENSE ? -1 : 1)}
        />
      </Heading>

      <View style={style.content}>
        {orderByAmount(totals).map(({ key, amount }) => (
          <Pressable
            key={key}
            onPress={() => setExpand(expand !== key ? key : undefined)}
            style={[style.touchable, expand && expand !== key && { opacity: 0.25 }]}
          >
            <HorizontalChartItem
              amount={Object.keys(dataSource[key])?.length}
              color={color}
              currency={baseCurrency}
              icon={getIcon({ type, category: key })}
              title={L10N.CATEGORIES[type][key]}
              value={amount}
              width={Math.floor((amount / total) * 100)}
            />

            {expand === key && (
              <>
                {orderByAmount(dataSource[key]).map((item) => (
                  <HorizontalChartItem
                    key={`${key}-${item.key}`}
                    currency={baseCurrency}
                    detail
                    highlight={type !== EXPENSE}
                    title={item.key}
                    value={item.amount}
                    width={Math.floor((item.amount / amount) * 100)}
                  />
                ))}
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

ItemGroupCategories.propTypes = {
  color: PropTypes.string,
  dataSource: PropTypes.shape({}).isRequired,
  type: PropTypes.number.isRequired,
};

export { ItemGroupCategories };
