import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Confirm.style';
import { Text, View } from '../../primitives';
import { Button } from '../Button';
import { Modal } from '../Modal';

const Confirm = ({
  accept = 'Accept',
  cancel = 'Cancel',
  caption,
  children,
  title,
  onAccept = () => {},
  onCancel,
  ...others
}) => (
  <Modal onClose={onCancel}>
    <View gap {...others}>
      <View>
        {title && (
          <Text bold subtitle>
            {title}
          </Text>
        )}
        {caption && <Text>{caption}</Text>}
      </View>
      {children}
      <View flex gap row style={style.buttons}>
        {onCancel && (
          <Button flex outlined onPress={onCancel}>
            {cancel}
          </Button>
        )}
        <Button flex onPress={onAccept}>
          {accept}
        </Button>
      </View>
    </View>
  </Modal>
);

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  accept: PropTypes.string,
  cancel: PropTypes.string,
  caption: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string,
  onAccept: PropTypes.func,
  onCancel: PropTypes.func,
};

export { Confirm };
