import { ScrollView } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { queryAvailableAccounts } from './helpers';
import { style } from './SliderAccounts.style';
import { useStore } from '../../contexts';
import { CardOption } from '../CardOption';

const SliderAccounts = ({ account, selected, onChange, ...others }) => {
  const { accounts = [] } = useStore();

  const scrollview = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const index = accounts.findIndex(({ hash }) => selected === hash);
    scrollview.current?.scrollTo({ x: (index - 1) * optionSnap, animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const optionSnap = StyleSheet.value('$optionSnap');
  const availableAccounts = queryAvailableAccounts(accounts, account);

  return (
    <ScrollView {...others} horizontal ref={scrollview} snap={optionSnap} width={width} style={style.scrollview}>
      {availableAccounts.map(({ currency, hash, title, ...rest } = {}, index) => (
        <CardOption
          key={hash}
          currency={currency}
          highlight={selected === hash}
          legend={title}
          onPress={() => onChange({ currency, hash, title, ...rest })}
          style={[
            style.option,
            index === 0 && style.firstOption,
            index === availableAccounts.length - 1 && style.lastOption,
          ]}
        />
      ))}
    </ScrollView>
  );
};

SliderAccounts.propTypes = {
  account: PropTypes.shape({}),
  selected: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export { SliderAccounts };
