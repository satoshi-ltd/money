import { Heading, InputAccount, InputDate, ScrollView } from '../../../components';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './FormTransaction.style';
import { CardOption, InputAmount, InputText } from '../../../components';
import { C, getIcon, L10N, suggestCategory } from '../../../modules';
import { queryCategories } from '../helpers';
import { useStore } from '../../../contexts';

const EXPENSE = C?.TX?.TYPE?.EXPENSE ?? 0;

const FormTransaction = ({
  account = {},
  accountsList = [],
  form,
  onChange,
  onSelectAccount,
  showAccount = false,
  showCategory = true,
  showDate = true,
  type = EXPENSE,
} = {}) => {
  const scrollview = useRef(null);
  const { width } = useWindowDimensions();
  const { settings = {} } = useStore();
  const safeForm = form || {};
  const safeType = type ?? EXPENSE;

  useEffect(() => {
    setTimeout(() => {
      const index = sortedCategories.findIndex(({ key }) => key === safeForm.category);
      scrollview.current?.scrollTo({ x: (index - 1) * optionSnap, animated: true });
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeForm]);

  const handleField = (field, fieldValue) => {
    let next = { ...safeForm, [field]: fieldValue };

    if (field === 'title' && showCategory && next.category === undefined) {
      const suggested = suggestCategory(settings.autoCategory, { title: fieldValue, type: safeType });
      if (suggested !== undefined) next = { ...next, category: suggested };
    }

    onChange({
      form: next,
      valid: (showCategory ? next.category !== undefined : true) && next.title !== '' && next.value > 0,
    });
  };

  const optionSnap = StyleSheet.value('$optionSnap');
  const categories = queryCategories({ type: safeType });
  const totals = account?.txs?.reduce(
    (total, { category }) => ((total[category] = (total[category] || 0) + 1), total),
    {},
  ) || {};

  let sortedCategories = [...categories]
    .filter((category) => !!totals[category.key.toString()])
    .sort((a, b) => totals[b.key.toString()] - totals[a.key.toString()]);

  sortedCategories = [
    ...sortedCategories,
    ...categories.filter(({ key }) => !sortedCategories.find((item) => item.key === key)),
  ];
  const showAccountInput = showAccount && accountsList.length && onSelectAccount;

  return (
    <>
      {showCategory && (
        <>
          <Heading value={L10N.CATEGORY} />

          <ScrollView horizontal ref={scrollview} snap={optionSnap} width={width} style={style.scrollView}>
            {sortedCategories.map((item, index) => (
              <CardOption
                key={item.key}
                highlight={safeForm.category === item.key}
                icon={getIcon({ type: safeType, category: item.key })}
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
        </>
      )}

      <Heading value={L10N.DETAILS} />

      {showAccountInput ? (
        <InputAccount accounts={accountsList} first onSelect={onSelectAccount} selected={account} />
      ) : null}

      {showDate && (
        <InputDate
          first={!showAccountInput}
          value={safeForm.timestamp ? new Date(safeForm.timestamp) : new Date()}
          onChange={(value) => handleField('timestamp', value.getTime())}
        />
      )}

      <InputAmount
        first={!showDate && !showAccountInput}
        account={account}
        currency={account.currency}
        value={safeForm.value}
        onChange={(value) => handleField('value', value)}
      />

      <InputText
        last
        label={L10N.CONCEPT}
        value={safeForm.title}
        onChange={(value) => handleField('title', value)}
      />
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  accountsList: PropTypes.arrayOf(PropTypes.shape({})),
  form: PropTypes.shape({}).isRequired,
  showCategory: PropTypes.bool,
  showDate: PropTypes.bool,
  type: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onSelectAccount: PropTypes.func,
  showAccount: PropTypes.bool,
};

export default FormTransaction;
