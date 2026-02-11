import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import { InteractionManager, useWindowDimensions } from 'react-native';

import { style } from './FormTransaction.style';
import {
  CardOption,
  Heading,
  InputAccount,
  InputAmount,
  InputDate,
  InputField,
  InputTypeTransaction,
  ScrollView,
} from '../../../components';
import { useStore } from '../../../contexts';
import { C, getIcon, L10N, suggestAccount, suggestAmount, suggestCategory } from '../../../modules';
import { optionSnap } from '../../../theme/layout';
import { queryCategories } from '../helpers';

const EXPENSE = C?.TX?.TYPE?.EXPENSE ?? 0;
const INCOME = C?.TX?.TYPE?.INCOME ?? 1;

const FormTransaction = ({
  account = {},
  accountsList = [],
  accountTouched = false,
  amountTouched = false,
  categoryTouched = false,
  typeTouched = false,
  typeAutoLocked = false,
  autoSuggest = false,
  form,
  onChange,
  onAutoSelectAccount,
  onAutoSelectType,
  onManualAmountChange,
  onManualCategorySelect,
  onTypeChange,
  onSelectAccount,
  showAccount = false,
  showCategory = true,
  showDate = true,
  showType = true,
  type = EXPENSE,
} = {}) => {
  const scrollview = useRef(null);
  const { width } = useWindowDimensions();
  const { settings = {} } = useStore();
  const safeForm = form || {};
  const safeType = type ?? EXPENSE;

  const handleField = (field, fieldValue) => {
    let next = { ...safeForm, [field]: fieldValue };

    if (autoSuggest && field === 'title') {
      const title = fieldValue;
      const otherType = safeType === EXPENSE ? INCOME : EXPENSE;

      const amountValue = Number(next.value);
      const amountEmpty = !Number.isFinite(amountValue) || amountValue <= 0;

      const canAutoSwitchType =
        amountEmpty &&
        !typeAutoLocked &&
        !typeTouched &&
        !categoryTouched &&
        !accountTouched &&
        typeof onAutoSelectType === 'function' &&
        next.category === undefined;

      let effectiveType = safeType;
      const suggestedCurrent =
        showCategory && next.category === undefined
          ? suggestCategory(settings.autoCategory, { title, type: safeType })
          : undefined;
      const suggestedOther =
        showCategory && next.category === undefined
          ? suggestCategory(settings.autoCategory, { title, type: otherType })
          : undefined;

      // If we have a category match only in the other type, auto-switch type (rare case like "mirai").
      if (canAutoSwitchType && suggestedCurrent === undefined && suggestedOther !== undefined) {
        onAutoSelectType(otherType);
        next = { ...next, category: suggestedOther };
        effectiveType = otherType;
      } else if (showCategory && next.category === undefined && suggestedCurrent !== undefined) {
        next = { ...next, category: suggestedCurrent };
      }

      let effectiveAccountHash = account?.hash;

      // Auto-select account only on screens that opt into it (Transaction create flow).
      if (!accountTouched && typeof onAutoSelectAccount === 'function' && accountsList.length) {
        const suggestedHash = suggestAccount(settings.autoAccount, { title, type: effectiveType });
        if (suggestedHash && suggestedHash !== account?.hash) {
          const nextAccount = accountsList.find((a) => a?.hash === suggestedHash);
          if (nextAccount) {
            effectiveAccountHash = suggestedHash;
            onAutoSelectAccount(nextAccount);
          }
        }
      }

      // Auto-fill amount only when stable and only if the user hasn't touched the amount field.
      if (!amountTouched && amountEmpty && effectiveAccountHash) {
        const suggested = suggestAmount(settings.autoAmount, { title, type: effectiveType, account: effectiveAccountHash });
        if (suggested !== undefined) next = { ...next, value: suggested };
      }
    }

    if (autoSuggest && field === 'value' && !amountTouched) onManualAmountChange?.();

    onChange({
      form: next,
      valid:
        (showCategory ? next.category !== undefined : true) &&
        typeof next.title === 'string' &&
        next.title.trim() !== '' &&
        next.value > 0,
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

  const detailRows = [
    showType ? 'type' : null,
    showAccountInput ? 'account' : null,
    showDate ? 'date' : null,
    'concept',
    'amount',
  ].filter(Boolean);
  const isFirst = (name) => detailRows[0] === name;
  const isLast = (name) => detailRows[detailRows.length - 1] === name;

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
                onPress={() => {
                  onManualCategorySelect?.();
                  handleField('category', item.key);
                }}
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

      {showType ? (
        <InputTypeTransaction first={isFirst('type')} last={isLast('type')} value={safeType} onChange={onTypeChange} />
      ) : null}

      {showAccountInput ? (
        <InputAccount
          accounts={accountsList}
          first={isFirst('account')}
          last={isLast('account')}
          onSelect={onSelectAccount}
          selected={account}
        />
      ) : null}

      {showDate && (
        <InputDate
          first={isFirst('date')}
          last={isLast('date')}
          maximumDate={new Date()}
          value={safeForm.timestamp ? new Date(safeForm.timestamp) : new Date()}
          onChange={(value) => handleField('timestamp', value.getTime())}
        />
      )}

      <InputField
        first={isFirst('concept')}
        last={isLast('concept')}
        label={L10N.CONCEPT}
        value={safeForm.title}
        onChange={(value) => handleField('title', value)}
      />

      <InputAmount
        first={isFirst('amount')}
        account={account}
        currency={account.currency}
        value={safeForm.value}
        onChange={(value) => handleField('value', value)}
        last={isLast('amount')}
      />
    </>
  );
};

FormTransaction.propTypes = {
  account: PropTypes.shape({}).isRequired,
  accountsList: PropTypes.arrayOf(PropTypes.shape({})),
  accountTouched: PropTypes.bool,
  amountTouched: PropTypes.bool,
  categoryTouched: PropTypes.bool,
  typeTouched: PropTypes.bool,
  typeAutoLocked: PropTypes.bool,
  autoSuggest: PropTypes.bool,
  form: PropTypes.shape({}).isRequired,
  showCategory: PropTypes.bool,
  showDate: PropTypes.bool,
  showType: PropTypes.bool,
  type: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onAutoSelectAccount: PropTypes.func,
  onAutoSelectType: PropTypes.func,
  onManualAmountChange: PropTypes.func,
  onManualCategorySelect: PropTypes.func,
  onTypeChange: PropTypes.func,
  onSelectAccount: PropTypes.func,
  showAccount: PropTypes.bool,
};

export default FormTransaction;
