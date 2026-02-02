import React from 'react';

import { Button, Text, View } from '../../design-system';
import Panel from '../Panel';
import { styles } from './Confirm.styles';

const Confirm = ({ accept, cancel, caption, onAccept, onCancel, title }) => (
  <Panel offset title={title} onBack={onCancel}>
    {caption ? <Text color="contentLight">{caption}</Text> : null}
    <View style={styles.actions}>
      {cancel && onCancel ? (
        <Button outlined flex onPress={onCancel}>
          {cancel}
        </Button>
      ) : null}
      <Button flex onPress={onAccept}>
        {accept}
      </Button>
    </View>
  </Panel>
);

export default Confirm;
