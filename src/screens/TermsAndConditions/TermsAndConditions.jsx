import PropTypes from 'prop-types';
import React from 'react';

import { style } from './TermsAndConditions.style';
import { Modal, ScrollView, Text, View } from '../../__design-system__';

const TermsAndConditions = ({ navigation: { goBack } = {} } = {}) => {
  return (
    <Modal fullscreen onClose={goBack}>
      <ScrollView>
        <View gap style={style.content}>
          <View>
            <Text bold>Terms and Conditions</Text>
            <Text caption>
              Welcome to Money, your rules: Manage, Save, Succeed. Before using our application, we urge you to
              carefully read the following terms and conditions.
            </Text>
          </View>

          <View>
            <Text bold caption>
              1. Acceptance of Terms
            </Text>
            <Text caption>
              By accessing or using our application, you agree to be bound by these Terms and Conditions, as well as our
              Privacy Policy. If you do not agree with any of the terms outlined here, please refrain from using the
              application.
            </Text>
          </View>

          <View>
            <Text bold caption>
              2. Responsible Use
            </Text>
            <Text caption>
              Our application is designed to provide personal finance services. By using it, you commit to using it
              responsibly and in compliance with all applicable laws and regulations.
            </Text>
          </View>

          <View>
            <Text bold caption>
              3. Privacy and Security
            </Text>
            <Text caption>
              We prioritize your privacy. Our Privacy Policy outlines how we collect, store, and use your data. By using
              the application, you consent to our privacy and security practices.
            </Text>
          </View>

          <View>
            <Text bold caption>
              4. No Data Storage
            </Text>
            <Text caption>
              We want to assure you that we do not store any user data. Our application is secure and private, and we do
              not offer any cloud-based systems. Your financial information remains on your device for your privacy and
              security.
            </Text>
          </View>

          <View>
            <Text bold caption>
              5. Financial Transactions
            </Text>
            <Text caption>
              The application may enable you to conduct financial transactions. By doing so, you agree to take
              responsibility for all transactions and ensure the accuracy of the provided information.
            </Text>
          </View>

          <View>
            <Text bold caption>
              6. User Responsibility
            </Text>
            <Text caption>
              You are responsible for maintaining the confidentiality of your account and password. Any activity carried
              out with your account will be considered as performed by you.
            </Text>
          </View>

          <View>
            <Text bold caption>
              7. Changes to Terms
            </Text>
            <Text caption>
              We reserve the right to modify these Terms and Conditions at any time. Changes will become effective
              immediately upon publication. It is your responsibility to periodically review these terms.
            </Text>
          </View>

          <View>
            <Text bold caption>
              8. Contact
            </Text>
            <Text caption>
              If you have any questions or comments about these Terms and Conditions, please contact us at [your contact
              email].
            </Text>
          </View>

          <Text caption>
            Feel free to further customize and adjust these terms to align with the specific features and policies of
            your personal finance management app. As always, consider seeking legal advice to ensure compliance with
            applicable laws and regulations.
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );
};

TermsAndConditions.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { TermsAndConditions };
