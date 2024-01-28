import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { PLANS } from './Subscription.constants';
import { style } from './Subscription.style';
import { Action, Button, Card, Pressable, Modal, Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { PurchaseService } from '../../services';

const Subscription = ({ navigation: { goBack, navigate } = {} }) => {
  const { subscription, updateSubscription } = useStore();

  const [products, setProducts] = useState(PLANS);
  const [plan, setPlan] = useState(subscription);

  useEffect(() => {
    PurchaseService.getProducts()
      .then((results) => {
        if (results) setProducts(results);
      })
      .catch((error) => alert(error));
  }, []);

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
    PurchaseService.buy(plan)
      .then((newSubscription) => {
        if (newSubscription) {
          updateSubscription(newSubscription);
          goBack();
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

        {products.map(({ productId, price, title, description }) => (
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

// const a = {
//   results: [
//     {
//       originalOrderId: '',
//       acknowledged: false,
//       productId: 'monthly',
//       transactionReceiprt: 'MUCHISIMO TEXTO',
//       purchaseState: 1,
//       orderId: '2000000510857950',
//       originalPurchaseTime: 0,
//       purchaseTime: 1706455338000,
//     },
//   ],
//   responseCode: 0,
// };
