import { Button, Modal, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './BaseCurrency.style';
import { SliderCurrencies } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { ServiceRates } from '../../services';

const BaseCurrency = ({ navigation: { goBack } = {} }) => {
  const store = useStore();

  const { settings: { baseCurrency } = {}, updateRates } = store;

  const [activity, setActivity] = useState(false);
  const [currency, setCurrency] = useState();

  useEffect(() => {
    setCurrency(baseCurrency);
  }, [baseCurrency]);

  const handleSubmit = async () => {
    setActivity(true);

    const rates = await ServiceRates.get({ baseCurrency: currency, latest: false }).catch(() =>
      alert(L10N.ERROR_SERVICE_RATES),
    );
    if (rates) await updateRates({ ...rates, currency });

    goBack();
    setActivity(false);
  };

  return (
    <Modal title="Clone" onClose={goBack}>
      <Text bold secondary subtitle style={style.title}>
        {L10N.CHOOSE_CURRENCY}
      </Text>

      <SliderCurrencies selected={currency} onChange={setCurrency} style={style.slider} />

      <View row style={style.buttons}>
        <Button flex outlined onPress={goBack}>
          {L10N.CLOSE}
        </Button>
        <Button activity={activity} disabled={currency === baseCurrency} flex onPress={handleSubmit}>
          {L10N.SAVE}
        </Button>
      </View>
    </Modal>
  );
};

BaseCurrency.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { BaseCurrency };
