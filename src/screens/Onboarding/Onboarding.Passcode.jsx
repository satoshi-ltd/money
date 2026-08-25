import PropTypes from 'prop-types';
import React from 'react';

import { Text, View } from '../../components';
import { L10N } from '../../modules';
import { NumKeyboard } from '../Session/components';

const SLOTS = [0, 1, 2, 3];

const Passcode = ({ confirming = false, onChange, style, value = '' }) => (
  <>
    <View style={[style.pad, style.stepTop]}>
      <Text bold size="xl">
        {confirming ? L10N.ONB_PIN_CONFIRM_TITLE : L10N.ONB_PIN_TITLE}
      </Text>
      <Text size="s" tone="secondary" style={style.caption}>
        {confirming ? L10N.ONB_PIN_CONFIRM_CAPTION : L10N.ONB_PIN_CAPTION}
      </Text>
    </View>

    <View flex style={style.keyboard}>
      <View row style={style.pins}>
        {SLOTS.map((index) => (
          <View key={index} style={[style.pin, value.length > index ? style.pinOn : style.pinOff]} />
        ))}
      </View>

      <NumKeyboard
        onDelete={() => onChange(value.slice(0, -1))}
        onPress={(number) => value.length < 4 && onChange(`${value}${number}`)}
      />
    </View>
  </>
);

Passcode.propTypes = {
  confirming: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  value: PropTypes.string,
};

export { Passcode };
