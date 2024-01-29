import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Button, Card, View, Text } from '../../../__design-system__';
import { useStore } from '../../../contexts';
import { L10N } from '../../../modules';
import { BackupService, PurchaseService } from '../../../services';

// ! TODO: Use L10N

const Backup = ({ navigation: { navigate } = {}, ...others }) => {
  const { vaults: accounts, importBackup, settings, subscription, txs } = useStore();

  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const exported = await BackupService.export({ accounts, settings, txs });
    if (exported) alert('Export successful! Your data has been saved.');
  };

  const handleSubscription = () => {
    setBusy(true);
    PurchaseService.getProducts()
      .then((plans) => {
        navigate('subscription', { plans });
        setBusy(false);
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
          alert('Imported successfully.');
        },
      });
    }
  };

  return (
    <Card gap {...others}>
      <View>
        <Text bold>{`${L10N.IMPORT} / ${L10N.EXPORT}`}</Text>
        <Text caption color="contentLight">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima alias natus quia tempora praesentium qui
          omnis.
        </Text>
      </View>

      <View gap row>
        <Button busy={busy} flex outlined onPress={subscription?.productId ? handleExport : handleSubscription}>
          {L10N.EXPORT}
        </Button>
        <Button flex onPress={handleImport}>
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
