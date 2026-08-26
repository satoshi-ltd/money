import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './MonthKpis.style';
import { Eyebrow, Heading, PriceFriendly, View } from '../../../../components';
import { useApp } from '../../../../contexts';
import { L10N } from '../../../../modules';

const MonthKpis = ({ currency, expenses = 0, incomes = 0, title, ...others }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const net = incomes - expenses;

  return (
    <View style={[style.block, others.style]}>
      <Heading eyebrow={L10N.MONTH_TO_DATE} value={title} />

      <View row style={style.row}>
        <View style={style.kpi}>
          <Eyebrow>{L10N.FLOW_IN}</Eyebrow>
          <PriceFriendly currency={currency} operator size="md" value={incomes} />
        </View>
        <View style={[style.kpi, style.kpiDivider]}>
          <Eyebrow>{L10N.FLOW_OUT}</Eyebrow>
          <PriceFriendly currency={currency} size="md" value={-expenses} />
        </View>
        <View style={[style.kpi, style.kpiDivider]}>
          <Eyebrow>{L10N.NET}</Eyebrow>
          <PriceFriendly currency={currency} operator size="md" value={net} />
        </View>
      </View>
    </View>
  );
};

MonthKpis.propTypes = {
  currency: PropTypes.string,
  expenses: PropTypes.number,
  incomes: PropTypes.number,
  title: PropTypes.string,
};

export { MonthKpis };
