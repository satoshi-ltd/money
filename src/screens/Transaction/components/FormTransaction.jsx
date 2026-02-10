import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { InteractionManager, useWindowDimensions } from 'react-native';

import { style } from './FormTransaction.style';
import { CardOption, Heading, InputAccount, InputAmount, InputDate, InputField, ScrollView } from '../../../components';
import { useStore } from '../../../contexts';
import { C, getIcon, L10N, suggestCategory } from '../../../modules';
import { optionSnap } from '../../../theme/layout';
import { queryCategories } from '../helpers';

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

  const categories = queryCategories({ type: safeType });

  const sortedCategories = useMemo(() => {
    const totals =
      account?.txs?.reduce((total, { category }) => ((total[category] = (total[category] || 0) + 1), total), {}) || {};

    const preferred = [...categories]
      .filter((category) => !!totals[category.key.toString()])
      .sort((a, b) => totals[b.key.toString()] - totals[a.key.toString()]);

    return [...preferred, ...categories.filter(({ key }) => !preferred.find((item) => item.key === key))];
  }, [account?.txs, categories]);

  useEffect(() => {
    if (!showCategory) return;
    const index = sortedCategories.findIndex(({ key }) => key === safeForm.category);
    if (index < 0) return;

    // Run after layout; avoid fighting user scroll on unrelated form edits.
    const x = Math.max(0, (index - 1) * optionSnap);
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        scrollview.current?.scrollTo({ x, animated: true });
      });
    });

    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [safeForm.category, showCategory, sortedCategories]);
  const showAccountInput = showAccount && accountsList.length && onSelectAccount;

  return (
    <>
      {showCategory && (
        <>
          <Heading value={L10N.CATEGORY} />

          <ScrollView horizontal ref={scrollview} snapTo={optionSnap} style={[{ width }, style.scrollView]}>
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
                  index === sortedCategories.length - 1 && style.lastOption,
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
          maximumDate={new Date()}
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

      <InputField last label={L10N.CONCEPT} value={safeForm.title} onChange={(value) => handleField('title', value)} />
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
