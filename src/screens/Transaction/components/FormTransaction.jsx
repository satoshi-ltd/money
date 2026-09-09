import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { style } from './FormTransaction.style';
import { Checkbox, Chip, Dropdown, FieldRow, Input, Modal, Pressable, PriceFriendly, Text, View } from '../../../components';
import { useApp, useStore } from '../../../contexts';
import {
  buildTitleMemory,
  C,
  foreignSymbol,
  ICON,
  L10N,
  recallTitle,
  recallTitles,
  suggestAccount,
  suggestAmount,
  suggestCategory,
  verboseDate,
} from '../../../modules';
import { queryCategories } from '../helpers';

const EXPENSE = C?.TX?.TYPE?.EXPENSE ?? 0;
const INCOME = C?.TX?.TYPE?.INCOME ?? 1;

const isNumber = /^[0-9]+([,.][0-9]+)?$|^[0-9]+([,.][0-9]+)?[.,]$/;
const DATE_FORMAT = { day: 'numeric', month: 'short', year: 'numeric' };

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
  onSelectAccount,
  showAccount = false,
  showCategory = true,
  showDate = true,
  type = EXPENSE,
} = {}) => {
  const { colors } = useApp();
  const { session: { locale } = {}, settings = {}, txs = [] } = useStore();
  const { theme: themeMode } = settings;
  const safeForm = form || {};
  const safeType = type ?? EXPENSE;
  const memory = useMemo(() => buildTitleMemory(txs), [txs]);

  const [suggestion, setSuggestion] = useState();
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [accepted, setAccepted] = useState();

  const computeValid = (next) =>
    (showCategory ? next.category !== undefined : true) &&
    typeof next.title === 'string' &&
    next.title.trim() !== '' &&
    next.value > 0;

  const handleField = (field, fieldValue) => {
    let next = { ...safeForm, [field]: fieldValue };
    let applied;

    if (autoSuggest && field === 'title') {
      const title = fieldValue;
      // What the last keystroke filled in is not yours yet: take it back, then read the whole new title afresh.
      const standing = suggestion;
      const baseType = standing?.applied.type !== undefined ? standing.previousType : safeType;
      const baseAccount = standing?.applied.account ? standing.previousAccount : account;
      if (standing) {
        next = {
          ...next,
          ...(standing.applied.category !== undefined ? { category: standing.previousCategory } : {}),
          ...(standing.applied.value !== undefined ? { value: standing.previousValue } : {}),
        };
      }
      const base = next;
      const otherType = baseType === EXPENSE ? INCOME : EXPENSE;
      // A category the screen defaulted is not a choice: the title may overrule it until you pick one yourself.
      const categoryFree = next.category === undefined || !categoryTouched;

      const amountValue = Number(next.value);
      const amountEmpty = !Number.isFinite(amountValue) || amountValue <= 0;

      const canAutoSwitchType =
        amountEmpty &&
        !typeAutoLocked &&
        !typeTouched &&
        !categoryTouched &&
        !accountTouched &&
        typeof onAutoSelectType === 'function' &&
        categoryFree;

      // The title's own memory first; word rules only for a title never seen, where a shared word is all there is.
      const known = recallTitle(memory, { title, type: baseType });
      const suggestedCurrent =
        showCategory && categoryFree
          ? known?.category ?? suggestCategory(settings.autoCategory, { title, type: baseType })
          : undefined;
      // Exact titles only: on a real ledger shared words flipped the type wrongly 20 times where the title did once.
      const suggestedOther =
        showCategory && categoryFree ? recallTitle(memory, { title, type: otherType })?.category : undefined;

      const switchTo =
        canAutoSwitchType && suggestedCurrent === undefined && suggestedOther !== undefined ? otherType : undefined;
      const effectiveType = switchTo ?? baseType;
      if (switchTo !== undefined) {
        next = { ...next, category: suggestedOther };
        applied = { ...applied, category: suggestedOther, type: switchTo };
      } else if (showCategory && categoryFree && suggestedCurrent !== undefined && suggestedCurrent !== next.category) {
        next = { ...next, category: suggestedCurrent };
        applied = { ...applied, category: suggestedCurrent };
      }
      if (effectiveType !== safeType) onAutoSelectType?.(effectiveType);

      let effectiveAccount = baseAccount;

      // Auto-select account only on screens that opt into it (Transaction create flow).
      if (!accountTouched && typeof onAutoSelectAccount === 'function' && accountsList.length) {
        const suggestedHash = known?.account ?? suggestAccount(settings.autoAccount, { title, type: effectiveType });
        const nextAccount =
          suggestedHash && suggestedHash !== baseAccount?.hash
            ? accountsList.find((a) => a?.hash === suggestedHash)
            : undefined;
        if (nextAccount) {
          effectiveAccount = nextAccount;
          applied = { ...applied, account: nextAccount };
        }
      }
      if (effectiveAccount?.hash !== account?.hash) onAutoSelectAccount?.(effectiveAccount);

      // Auto-fill amount only when stable and only if the user hasn't touched the amount field.
      if (!amountTouched && amountEmpty && effectiveAccount?.hash) {
        const suggested = suggestAmount(settings.autoAmount, {
          title,
          type: effectiveType,
          account: effectiveAccount.hash,
        });
        if (suggested !== undefined) {
          next = { ...next, value: suggested };
          applied = { ...applied, value: suggested };
        }
      }

      if (applied) {
        setSuggestion({
          applied,
          previousAccount: baseAccount,
          previousCategory: base.category,
          previousType: baseType,
          previousValue: base.value,
        });
      } else if (standing) {
        setSuggestion(undefined);
      }
    }

    if (autoSuggest && field === 'value' && !amountTouched) {
      onManualAmountChange?.();
      setSuggestion(undefined);
    }

    onChange({ form: next, valid: computeValid(next) });
  };

  const handleAmount = (raw = '') => {
    if (!isNumber.test(raw) || raw.length === 0) return handleField('value', undefined);
    handleField('value', raw.replace(',', '.'));
  };

  const dismissSuggestion = () => {
    const { applied, previousAccount, previousCategory, previousType, previousValue } = suggestion;

    if (applied.type !== undefined) onAutoSelectType?.(previousType);
    if (applied.account && previousAccount?.hash) onAutoSelectAccount?.(previousAccount);

    const next = {
      ...safeForm,
      ...(applied.category !== undefined ? { category: previousCategory } : {}),
      ...(applied.value !== undefined ? { value: previousValue } : {}),
    };
    setSuggestion(undefined);
    onChange({ form: next, valid: computeValid(next) });
  };

  const suggestionLabel = suggestion
    ? [
        suggestion.applied.category !== undefined
          ? L10N.CATEGORIES[suggestion.applied.type ?? safeType]?.[suggestion.applied.category]
          : undefined,
        suggestion.applied.account?.title,
        suggestion.applied.value,
      ]
        .filter((part) => part !== undefined)
        .join(' · ')
    : undefined;

  const categories = queryCategories({ type: safeType });

  const sortedCategories = useMemo(() => {
    const totals =
      account?.txs?.reduce((total, { category }) => ((total[category] = (total[category] || 0) + 1), total), {}) || {};

    const preferred = [...categories]
      .filter((category) => !!totals[category.key.toString()])
      .sort((a, b) => totals[b.key.toString()] - totals[a.key.toString()]);

    return [...preferred, ...categories.filter(({ key }) => !preferred.find((item) => item.key === key))];
  }, [account?.txs, categories]);

  const showAccountInput = showAccount && accountsList.length && onSelectAccount;
  const accountOptions = useMemo(
    () => accountsList.map((item) => ({ account: item, id: item.hash, label: item.title, symbol: item.currency })),
    [accountsList],
  );

  // Once you have accepted one, stop offering: after an explicit tap, more proposals read as second-guessing.
  const proposals = useMemo(
    () =>
      autoSuggest && safeForm.title !== accepted
        ? recallTitles(memory, { prefix: safeForm.title || '', type: safeType })
        : [],
    [accepted, autoSuggest, memory, safeForm.title, safeType],
  );
  const accountOf = (proposal) => accountsList.find(({ hash }) => hash === proposal.account);

  // One tap writes the whole entry: the concept, what it cost, where from and under what.
  const applyProposal = (proposal) => {
    const proposalAccount = accountOf(proposal);
    setAccepted(proposal.title);
    if (proposalAccount && proposalAccount.hash !== account?.hash) onSelectAccount?.(proposalAccount);
    onManualCategorySelect?.();
    onManualAmountChange?.();
    setSuggestion(undefined);
    onChange({
      form: { ...safeForm, category: proposal.category, title: proposal.title, value: proposal.value },
      valid: true,
    });
  };

  const symbol = foreignSymbol(account.currency, settings.baseCurrency);

  const dateValue = safeForm.timestamp ? new Date(safeForm.timestamp) : new Date();
  const isToday = dateValue.toDateString() === new Date().toDateString();
  const dateLabel = isToday
    ? `${L10N.TODAY}, ${verboseDate(dateValue, { locale, day: 'numeric', month: 'short' })}`
    : verboseDate(dateValue, { locale, ...DATE_FORMAT });

  return (
    <>
      {suggestionLabel ? (
        <Chip
          iconRight={ICON.CLOSE}
          label={`${L10N.SUGGESTED}: ${suggestionLabel}`}
          variant="soft"
          style={style.suggestion}
          onPress={dismissSuggestion}
        />
      ) : null}

      <View style={style.group}>
        <FieldRow label={L10N.CONCEPT}>
          <Input
            placeholder="..."
            style={style.rowInput}
            value={safeForm.title}
            onChange={(value) => handleField('title', value)}
          />
        </FieldRow>

        {proposals.map((proposal) => {
          const proposalAccount = accountOf(proposal);

          return (
            <FieldRow divider key={proposal.title} label="" onPress={() => applyProposal(proposal)}>
              <Text medium numberOfLines={1} size="s">
                {proposal.title}
              </Text>
              {proposalAccount ? (
                <Text numberOfLines={1} size="xs" tone="muted">
                  {proposalAccount.title}
                </Text>
              ) : null}
              <PriceFriendly
                currency={proposalAccount?.currency || account.currency}
                size="md"
                tone="accent"
                value={proposal.value}
              />
            </FieldRow>
          );
        })}

        <FieldRow divider label={L10N.AMOUNT}>
          <Input
            keyboardType="decimal-pad"
            placeholder="0"
            style={style.rowFigure}
            value={safeForm.value !== undefined && safeForm.value !== null ? safeForm.value.toString() : ''}
            onChange={handleAmount}
          />
          <Text figure="sm" tone="muted">
            {symbol}
          </Text>
        </FieldRow>

        {showAccountInput ? (
          <View style={[style.rowWrap, showAccounts && style.rowWrapOpen]}>
            <FieldRow chevron divider label={L10N.ACCOUNT} onPress={() => setShowAccounts(true)}>
              <Text medium numberOfLines={1} size="s">
                {`${account.title} ·`}
              </Text>
              <PriceFriendly currency={account.currency} showSymbol size="md" value={account.currentBalance || 0} />
            </FieldRow>
            <Dropdown
              options={accountOptions}
              selected={account?.hash}
              visible={showAccounts}
              onClose={() => setShowAccounts(false)}
              onSelect={(option) => {
                setShowAccounts(false);
                if (option?.account) onSelectAccount?.(option.account);
              }}
            />
          </View>
        ) : null}

        {showCategory ? (
          <View style={[style.rowWrap, showCategories && style.rowWrapOpen]}>
            <FieldRow chevron divider label={L10N.CATEGORY} onPress={() => setShowCategories(true)}>
              <Text medium numberOfLines={1} size="s">
                {sortedCategories.find(({ key }) => key === safeForm.category)?.caption || '…'}
              </Text>
            </FieldRow>
            <Dropdown
              options={sortedCategories.map(({ caption, key }) => ({ id: key, label: caption, value: key }))}
              selected={safeForm.category}
              visible={showCategories}
              onClose={() => setShowCategories(false)}
              onSelect={(option) => {
                setShowCategories(false);
                onManualCategorySelect?.();
                setSuggestion(undefined);
                handleField('category', option.value);
              }}
            />
          </View>
        ) : null}

        {/* Not a FieldRow: its label column is a fixed twelve characters and this copy has to say what it does. */}
        <Pressable
          onPress={() => handleField('moved', !safeForm.moved)}
          style={[style.checkRow, { borderTopColor: colors.border }]}
        >
          <Text size="s" tone="muted">
            {L10N.HIDE_FROM_ANALYTICS}
          </Text>
          <Checkbox checked={safeForm.moved === true} />
        </Pressable>

        {showDate ? (
          <FieldRow chevron divider label={L10N.DATE} onPress={() => setOpenDate(true)}>
            <Text medium size="s">
              {dateLabel}
            </Text>
          </FieldRow>
        ) : null}

      </View>

      {openDate ? (
        <Modal onClose={() => setOpenDate(false)}>
          <DateTimePicker
            accentColor={colors.accent}
            is24Hour
            maximumDate={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            textColor={colors.text}
            themeVariant={themeMode}
            value={dateValue}
            onChange={(event, nextDate) => {
              if (!nextDate) return;
              handleField('timestamp', nextDate.getTime());
              setOpenDate(false);
            }}
          />
        </Modal>
      ) : null}
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
  type: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onAutoSelectAccount: PropTypes.func,
  onAutoSelectType: PropTypes.func,
  onManualAmountChange: PropTypes.func,
  onManualCategorySelect: PropTypes.func,
  onSelectAccount: PropTypes.func,
  showAccount: PropTypes.bool,
};

export default FormTransaction;
