import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';

import { PLAN } from './Subscription.constants';
import { style } from './Subscription.style';
import { Button, Card, Icon, Panel, Pressable, Tabs, Text, View } from '../../components';
import { useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { PurchaseService } from '../../services';

const { EVENT, PRIVACY_URL, TERMS_URL } = C;

const Subscription = ({ route: { params: { plans = [] } = {} } = {}, navigation: { goBack } = {} }) => {
  const { updateSubscription } = useStore();

  const [busy, setBusy] = useState(null);
  const [plan, setPlan] = useState(PLAN.SUBSCRIPTION);

  const handleStart = () => {
    setBusy('purchase');
    const { data } = plans[plan] || {};
    PurchaseService.buy(data)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
          setBusy(null);
        }
      })
      .catch(handleError);
  };

  const handleError = () => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.ERROR_TRY_AGAIN });

  const handleTermsAndConditions = () => {
    Linking.openURL(TERMS_URL);
  };

  const handlePrivacy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  const isLifetime = plan === PLAN.LIFETIME;
  const planData = plans[plan];

  return (
    <Panel gap offset style={style.modal} title={L10N.SUBSCRIPTION} onBack={goBack}>
      <View align="center">
        <Tabs
          accent={isLifetime}
          caption
          selected={isLifetime ? 1 : 0}
          options={[
            { id: PLAN.SUBSCRIPTION, text: L10N.SUBSCRIPTION },
            { id: PLAN.LIFETIME, text: L10N.LIFETIME },
          ]}
          onChange={(option) => setPlan(option.id)}
        />
      </View>

      <View style={style.title}>
        <Text bold size="xl">
          {L10N.SUBSCRIPTION_TITLE}
        </Text>
        <Text bold tone="secondary" size="s">
          {isLifetime ? L10N.SUBSCRIPTION_LIFETIME_DESCRIPTION : L10N.SUBSCRIPTION_DESCRIPTION}
        </Text>
      </View>

      <Card style={style.items}>
        {L10N.SUBSCRIPTION_ITEMS.map(({ icon, description, title }, index) => (
          <View gap row key={`item-${index}`} style={style.item}>
            <Icon name={icon} size="xl" />
            <View flex>
              <Text bold size="s">
                {title}
              </Text>
              <Text tone="secondary" size="xs">
                {description}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <View align="center">
        {isLifetime ? (
          <Text align="center" bold style={style.lifetime} size="s">
            {`${planData?.price || L10N.SUBSCRIPTION_PRICE_FALLBACK_ANNUAL} ${L10N.LIFETIME}`}
          </Text>
        ) : (
          <>
            <Text align="center" bold size="s">
              {`${planData?.price || L10N.SUBSCRIPTION_PRICE_FALLBACK_ANNUAL} ${L10N.ANNUALY} (${
                planData?.pricePerMonth || L10N.SUBSCRIPTION_PRICE_FALLBACK_MONTH
              }/${L10N.MONTH})`}
            </Text>
            <Text align="center" bold size="s">
              {L10N.CANCEL_ANYTIME}
            </Text>
          </>
        )}
      </View>

      <Button loading={busy === 'purchase'} variant={isLifetime ? 'secondary' : 'primary'} onPress={handleStart}>
        {plan === PLAN.LIFETIME ? L10N.PURCHASE : L10N.START_TRIAL}
      </Button>

      <Text align="center" size="xs">
        {L10N.SUBSCRIPTION_TERMS_CAPTION}
        {` `}
        <Pressable onPress={handleTermsAndConditions}>
          <Text bold style={style.pressableTerms} size="xs">
            {L10N.SUBSCRIPTION_TERMS}
          </Text>
        </Pressable>
        {` ${L10N.SUBSCRIPTION_AND} `}
        <Pressable onPress={handlePrivacy}>
          <Text bold style={style.pressableTerms} size="xs">
            {L10N.SUBSCRIPTION_PRIVACY}
          </Text>
        </Pressable>
        .
      </Text>
    </Panel>
  );
};

Subscription.displayName = 'Subscription';

Subscription.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Subscription };
