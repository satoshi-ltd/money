import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { PLANS } from './Subscription.constants';
import { style } from './Subscription.style';
import { Action, Button, Card, Pressable, Modal, Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';

const Subscription = ({ navigation: { goBack } = {} }) => {
  const { subscription } = useStore();

  const [plan, setPlan] = useState(subscription);

  const handleChange = (id) => {
    setPlan(id);
  };

  const handleRestore = () => {};
  const handleStart = () => {};

  return (
    <Modal offset onClose={goBack} style={style.screen}>
      <View align="center">
        <Logo />
        <Text align="center">No restrictions on accounts and transactions, plus a robust import/export feature.</Text>
      </View>

      <View style={style.options}>
        <Text align="center" bold subtitle>
          Choose your plan
        </Text>

        {PLANS.map(({ id, currency, price, caption, detail }) => (
          <Pressable key={id} onPress={() => handleChange(id)}>
            <Card outlined style={id === plan ? style.optionHighlight : undefined}>
              <View />
              <Text bold color={id === plan ? 'base' : undefined}>{`${currency} ${price} / ${caption}`}</Text>
              {detail && (
                <Text color={id === plan ? 'base' : undefined} tiny>
                  {detail}
                </Text>
              )}
            </Card>
          </Pressable>
        ))}
      </View>

      <View style={style.buttons}>
        <Action color="content" onPress={handleRestore}>
          Restore Purchases
        </Action>
        <Button onPress={handleStart}>Start free 7 day trial</Button>
        <Button outlined onPress={goBack}>
          No thanks
        </Button>
      </View>

      <Text tiny>
        By tapping "Start free 7 day trial", you will not be charged for the next 7 days, your subscription will
        auto-renew for the same price and package length until you cancel via App Store Settings. and you agree to our
        {` `}
        <Text bold tiny>
          Terms
        </Text>
        .
      </Text>
    </Modal>
  );
};

Subscription.displayName = 'Subscription';

Subscription.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Subscription };
