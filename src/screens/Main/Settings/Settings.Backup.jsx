import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Button, Card, View, Text } from '../../../__design-system__';
import { useStore } from '../../../contexts';
import { C, L10N } from '../../../modules';
import { BackupService, PurchaseService } from '../../../services';

const { IS_WEB } = C;

const Backup = ({ navigation: { navigate } = {}, ...others }) => {
  const { accounts = [], importBackup, settings, subscription, txs } = useStore();

  const [busy, setBusy] = useState(null);

  const handleExport = async () => {
    const exported = await BackupService.export({ accounts, settings, txs });
    if (exported) alert(L10N.CONFIRM_EXPORT_SUCCESS);
  };

  const handleSubscription = (busyState) => {
    setBusy(busyState);
    PurchaseService.getProducts()
      .then((plans) => {
        navigate('subscription', { plans });
        setBusy(null);
      })
      .catch((error) => alert(error));
  };

  const handleImport = async () => {
    const backup = await BackupService.import().catch((error) => alert(error));

    if (backup) {
      navigate('confirm', {
        caption: L10N.CONFIRM_IMPORT_CAPTION(backup),
        title: L10N.CONFIRM_IMPORT,
        onAccept: async () => {
          await importBackup(backup);
          navigate('dashboard');
          alert(L10N.CONFIRM_IMPORT_SUCCESS);
        },
      });
    }
  };

  return (
    <Card gap {...others}>
      <View>
        <Text bold>{`${L10N.EXPORT} / ${L10N.IMPORT}`}</Text>
        <Text caption color="contentLight">
          {L10N.BACKUP_CAPTION}
        </Text>
      </View>

      <View gap row>
        <Button
          activity={busy === 'export'}
          flex
          outlined
          onPress={IS_WEB || subscription?.productId ? handleExport : () => handleSubscription('export')}
        >
          {L10N.EXPORT}
        </Button>
        <Button
          activity={busy === 'import'}
          flex
          onPress={IS_WEB || subscription?.productId ? handleImport : () => handleSubscription('import')}
        >
          {L10N.IMPORT}
        </Button>
      </View>
    </Card>
  );
};

Backup.displayName = 'Backup';

Backup.propTypes = {
  navigation: PropTypes.any,
};

export { Backup };
