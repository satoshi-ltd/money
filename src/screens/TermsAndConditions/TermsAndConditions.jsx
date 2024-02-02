import PropTypes from 'prop-types';
import React from 'react';

import { style } from './TermsAndConditions.style';
import { Modal, ScrollView, Text, View } from '../../__design-system__';
import { L10N } from '../../modules';

const TermsAndConditions = ({ navigation: { goBack } = {} } = {}) => {
  return (
    <Modal fullscreen onClose={goBack}>
      <ScrollView>
        <View gap style={style.content}>
          <View>
            <Text bold>{L10N.TERMS_AND_CONDITIONS_TITLE}</Text>
            <Text caption>{L10N.TERMS_AND_CONDITIONS_CAPTION}</Text>
          </View>

          {L10N.TERMS_AND_CONDITIONS.map(({ caption, title }) => (
            <View key={title}>
              <Text bold caption>
                {title}
              </Text>
              <Text caption>{caption}</Text>
            </View>
          ))}
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
