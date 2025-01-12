import { ScrollView } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './FormTransaction.style';
import { CardOption, InputCurrency, InputText } from '../../../components';
import { C, getIcon, L10N } from '../../../modules';
import { queryCategories } from '../helpers';

const { TX: { TYPE: { EXPENSE } } = {} } = C;

const FormTransaction = ({ account = {}, form = {}, onChange, type = EXPENSE }) => {
  const scrollview = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setTimeout(() => {
      const index = sortedCategories.findIndex(({ key }) => key === form.category);
      scrollview.current?.scrollTo({ x: (index - 1) * optionSnap, animated: true });
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleField = (field, fieldValue) => {
    const next = { ...form, [field]: fieldValue };

    onChange({
      form: next,
      valid: next.category !== undefined && next.title !== '' && next.value > 0,
    });
  };

  const optionSnap = StyleSheet.value('$optionSnap');
  const categories = queryCategories({ type });
  const totals = account.txs?.reduce(
    (total, { category }) => ((total[category] = (total[category] || 0) + 1), total),
    {},
  );

  let sortedCategories = [...categories]
    .filter((category) => !!totals[category.key.toString()])
    .sort((a, b) => totals[b.key.toString()] - totals[a.key.toString()]);

  sortedCategories = [
    ...sortedCategories,
    ...categories.filter(({ key }) => !sortedCategories.find((item) => item.key === key)),
  ];

  return (
    <>
      <ScrollView horizontal ref={scrollview} snap={optionSnap} width={width} style={style.scrollView}>
        {sortedCategories.map((item, index) => (
          <CardOption
            key={item.key}
            highlight={form.category === item.key}
            icon={getIcon({ type, category: item.key })}
            legend={item.caption}
            onPress={() => handleField('category', item.key)}
            style={[
              style.option,
              index === 0 && style.firstOption,
              index === categories.length - 1 && style.lastOption,
            ]}
          />
        ))}
      </ScrollView>

      <InputCurrency
        account={account}
        currency={account.currency}
        value={form.value}
        onChange={(value) => handleField('value', value)}
        style={style.inputCurrency}
      />

      <InputText
        label={L10N.CONCEPT}
        value={form.title}
        onChange={(value) => handleField('title', value)}
        style={style.inputTitle}
      />
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({}).isRequired,
  type: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default FormTransaction;
