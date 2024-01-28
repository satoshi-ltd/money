import Constants from 'expo-constants';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { PLANS } from './Subscription.constants';
import { style } from './Subscription.style';
import { Action, Button, Card, Pressable, Modal, Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';

const Subscription = ({ navigation: { goBack, navigate } = {} }) => {
  const { subscription, updateSubscription } = useStore();

  const [products, setProducts] = useState([]);
  const [plan, setPlan] = useState(subscription);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('YEAH1');
      if (Constants.appOwnership === 'expo') return;
      console.log('YEAH2');

      const InAppPurchases = require('expo-in-app-purchases');
      console.log('YEAH3');

      try {
        await InAppPurchases.connectAsync();

        const { responseCode, results } = await InAppPurchases.getProductsAsync(['monthly', 'yearly', 'lifetime']);
        console.log('responseCode', responseCode);
        console.log('results', results);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setProducts(results);
        }
        await InAppPurchases.disconnectAsync();
      } catch (err) {
        console.warn('Error al obtener los productos: ', err);
      }
    };

    fetchProducts();
  }, []);

  // const restoreUpgrade = async () => {
  //   if (Constants.appOwnership === 'expo') return false;

  //   const InAppPurchases = await import('expo-in-app-purchases');

  //   try {
  //     await InAppPurchases.connectAsync();

  //     const { results } = await InAppPurchases.getPurchaseHistoryAsync();

  //     for (const result of results || []) {
  //       if (result.productId === 'upgrade' && result.acknowledged) {
  //         // TODO what we save in the store?
  //         updateSubscription({ premium: true });
  //         await InAppPurchases.disconnectAsync();
  //         return true;
  //       }
  //     }
  //     await InAppPurchases.disconnectAsync();
  //     return false;
  //   } catch (err) {
  //     await InAppPurchases.disconnectAsync();
  //     console.warn('Error al realizar la compra: ', err);
  //   }
  // };

  const handlePurchase = async (productId) => {
    if (Constants.appOwnership === 'expo') return;

    // const InAppPurchases = await import('expo-in-app-purchases');
    const InAppPurchases = require('expo-in-app-purchases');

    try {
      await InAppPurchases.connectAsync();

      await InAppPurchases.getProductsAsync([productId]);

      await InAppPurchases.purchaseItemAsync(productId);

      // eslint-disable-next-line no-undef
      return await new Promise((resolve, reject) => {
        InAppPurchases.setPurchaseListener(async (result) => {
          switch (result.responseCode) {
            case InAppPurchases.IAPResponseCode.OK:
            case InAppPurchases.IAPResponseCode.DEFERRED:
              // TODO what we save in the store?
              updateSubscription({ premium: true });
              await InAppPurchases.finishTransactionAsync(result.results[0], false);
              await InAppPurchases.disconnectAsync();
              return resolve(true);
            case InAppPurchases.IAPResponseCode.USER_CANCELED:
              await InAppPurchases.disconnectAsync();
              return resolve(false);
            case InAppPurchases.IAPResponseCode.ERROR:
              await InAppPurchases.disconnectAsync();
              return reject(new Error('IAP Error: ' + result.errorCode));
          }
        });
      });
    } catch (err) {
      await InAppPurchases.disconnectAsync();
      console.warn('Error al realizar la compra: ', err);
    }
  };

  const handleChange = (id) => {
    setPlan(id);
  };

  const handleRestore = () => {};
  const handleStart = () => {
    handlePurchase('lifetime');
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

      <Text>{JSON.stringify(products)}</Text>

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
