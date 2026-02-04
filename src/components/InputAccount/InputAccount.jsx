import Card from '../Card';
import { CurrencyLogo } from '../CurrencyLogo';
import Dropdown from '../Dropdown';
import { Icon, Pressable, Text, View } from '../../design-system';
import { PriceFriendly } from '../PriceFriendly';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './InputAccount.style';
import { L10N } from '../../modules';
import { sortAccounts } from '../../modules/sortAccounts';

const sortAccountsByName = (accounts = []) =>
  [...accounts].sort(({ title = '' }, { title: nextTitle = '' }) =>
    title.localeCompare(nextTitle, undefined, { sensitivity: 'base' }),
  );

const InputAccount = ({ accounts = [], first, last, onSelect, selected }) => {
  const [showSelect, setShowSelect] = useState(false);

  const sortedAccounts = useMemo(() => sortAccounts(accounts), [accounts]);
  const sortedAccountsByName = useMemo(() => sortAccountsByName(accounts), [accounts]);

  useEffect(() => {
    if (!selected && sortedAccounts.length) {
      onSelect(sortedAccounts[0]);
    }
  }, [onSelect, selected, sortedAccounts]);

  const options = useMemo(
    () => sortedAccountsByName.map((item) => ({ id: item.hash, label: item.title, account: item })),
    [sortedAccountsByName],
  );

  const handleSelect = (next) => {
    if (!next) return;
    onSelect(next);
  };

  const renderAccountOption = (option, isSelected) => {
    const accountOption = option.account || {};
    return (
      <View row style={style.dropdownRow}>
        <Card small style={[style.iconCard, style.iconCardDropdown]}>
          <CurrencyLogo
            currency={accountOption.currency}
            muted={!accountOption?.currentBalance || accountOption.currentBalance < 0}
          />
        </Card>
        <View flex style={style.textContainer}>
          <Text bold numberOfLines={2} style={style.text}>
            {accountOption.title}
          </Text>
          <View row style={style.subline}>
            <Text tone="secondary" size="s">
              {L10N.BALANCE}
            </Text>
            <PriceFriendly
              size="s"
              color="contentLight"
              currency={accountOption.currency}
              value={accountOption.currentBalance || 0}
            />
          </View>
        </View>
        {isSelected ? <Icon name="check" tone="accent" /> : <View style={style.rightPlaceholder} />}
      </View>
    );
  };

  return (
    <View style={[style.select, first && !last && style.stacked]}>
      <Pressable onPress={() => setShowSelect(true)}>
        <View
          row
          style={[
            style.item,
            first && style.first,
            first && !last && style.noBottom,
            last && style.last,
            showSelect && style.focus,
          ]}
        >
          <Card small style={style.iconCard}>
            <CurrencyLogo
              currency={selected?.currency}
              muted={!selected?.currentBalance || selected?.currentBalance < 0}
            />
          </Card>
          <View flex style={style.textContainer}>
            <Text bold numberOfLines={2} style={style.text}>
              {selected?.title}
            </Text>
            <View row style={style.subline}>
              <Text tone="secondary" size="s">
                {L10N.BALANCE}
              </Text>
            <PriceFriendly
              size="s"
              color="contentLight"
              currency={selected?.currency}
              value={selected?.currentBalance || 0}
            />
            </View>
          </View>
          <Icon name="chevron-down" tone="secondary" />
        </View>
      </Pressable>

      <Dropdown
        maxItems={6}
        onClose={() => setShowSelect(false)}
        onSelect={(option) => {
          handleSelect(option.account);
          setShowSelect(false);
        }}
        options={options}
        optionStyle={style.dropdownOption}
        renderOption={renderAccountOption}
        selected={selected?.hash}
        visible={showSelect}
        width={StyleSheet.value('$optionSize') * 2.8}
      />
    </View>
  );
};

InputAccount.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape({})),
  first: PropTypes.bool,
  last: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.shape({}),
};

export default InputAccount;
