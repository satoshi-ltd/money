import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './Subscription.style';
import { Action, Button, Card, Pressable, Modal, Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { PurchaseService } from '../../services';

const Subscription = ({ route: { params: { plans = {} } = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const { subscription, updateSubscription } = useStore();

  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(subscription.productId);

  const handleChange = (id) => {
    setPlan(id);
  };

  const handleRestore = () => {
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          goBack();
        }
      })
      .catch((error) => alert(error));
  };

  const handleStart = () => {
    setBusy(true);
    PurchaseService.buy(plan)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
          setBusy(false);
        }
      })
      .catch((error) => alert(error));
  };

  const handleTermsAndConditions = () => {
    navigate('terms');
  };

  return (
    <Modal onClose={goBack} style={style.modal}>
      <View align="center">
        <Logo />
        <Text align="center">No restrictions on accounts and transactions, plus a robust import/export feature.</Text>
      </View>

      <View style={style.options}>
        <Text align="center" bold subtitle>
          Choose your plan
        </Text>

        {plans.map(({ productId, price, title, description }) => (
          <Pressable key={productId} onPress={() => handleChange(productId)}>
            <Card outlined style={productId === plan ? style.optionHighlight : undefined}>
              <View />
              <Text bold color={productId === plan ? 'base' : undefined}>{`${price} / ${title}`}</Text>
              {productId === 'lifetime' && (
                <Text color={productId === plan ? 'base' : undefined} tiny>
                  {description}
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
        <Button busy={busy} onPress={handleStart}>
          Start free 7 day trial
        </Button>
        <Button outlined onPress={goBack}>
          No thanks
        </Button>
      </View>

      <Text tiny>
        By tapping "Start free 7 day trial", you will not be charged for the next 7 days, your subscription will
        auto-renew for the same price and package length until you cancel via App Store Settings. and you agree to our
        {` `}
        <Pressable onPress={() => handleTermsAndConditions()}>
          <Text bold tiny style={style.pressableTerms}>
            Terms
          </Text>
        </Pressable>
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
