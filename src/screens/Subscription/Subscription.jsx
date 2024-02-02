import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './Subscription.style';
import { Action, Button, Card, Pressable, Modal, Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { L10N } from '../../modules';
import { PurchaseService } from '../../services';

const Subscription = ({ route: { params: { plans = {} } = {} } = {}, navigation: { goBack, navigate } = {} }) => {
  const { subscription, updateSubscription } = useStore();

  const [busy, setBusy] = useState(null);
  const [plan, setPlan] = useState(subscription.productId);

  const handleChange = (id) => {
    setPlan(id);
  };

  const handleRestore = () => {
    setBusy('restore');
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          alert(L10N.PURCHASE_RESTORED);
          goBack();
          setBusy(null);
        }
      })
      .catch((error) => alert(error));
  };

  const handleStart = () => {
    setBusy('purchase');
    PurchaseService.buy(plan)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
          setBusy(null);
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
        <Text align="center">{L10N.SUBSCRIPTION_CAPTION}</Text>
      </View>

      <View style={style.options}>
        <Text align="center" bold subtitle>
          {L10N.CHOOSE_PLAN}
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
        <Action activity={busy === 'restore'} color="content" onPress={handleRestore}>
          {L10N.RESTORE_PURCHASE}
        </Action>
        <Button activity={busy === 'purchase'} onPress={handleStart}>
          {plan === 'lifetime' ? L10N.PURCHASE : L10N.START_TRIAL}
        </Button>
        <Button outlined onPress={goBack}>
          {L10N.SUBSCRIPTION_CLOSE}
        </Button>
      </View>

      <Text tiny>
        {L10N.SUBSCRIPTION_TERMS_CAPTION}
        {` `}
        <Pressable onPress={() => handleTermsAndConditions()}>
          <Text bold tiny style={style.pressableTerms}>
            {L10N.SUBSCRIPTION_TERMS}
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
