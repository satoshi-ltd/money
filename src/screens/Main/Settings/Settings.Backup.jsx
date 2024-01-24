import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React from 'react';

import { Button, Card, View, Text } from '../../../__design-system__';
import { useStore } from '../../../contexts';
import { setNextNotification } from '../../../modules';

const Backup = ({ ...others }) => {
  const { vaults: accounts, importBackup, settings, txs } = useStore();

  const handleExport = async () => {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) return alert('Can not share');

      const fileName = `money-${new Date().toISOString()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ accounts, settings, txs }));
      await Sharing.shareAsync(fileUri);

      await setNextNotification();
    } catch (error) {
      alert(`Something went wrong: ${JSON.stringify(error)}`);
    }
  };

  const handleImport = async () => {
    try {
      const { cancelled, assets: [file = {}] = [] } = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: 'application/json',
      });

      if (!cancelled && file.uri) {
        const fileData = await FileSystem.readAsStringAsync(file.uri);
        const jsonData = JSON.parse(fileData);
        if (jsonData.settings && jsonData.accounts && jsonData.txs) {
          await importBackup(jsonData);
          alert('Imported successfully.');
        }
      }
    } catch (error) {
      alert(`Something went wrong: ${JSON.stringify(error)}`);
    }
  };

  return (
    <Card gap {...others}>
      <View>
        <Text bold subtitle>
          Import / Export
        </Text>
        <Text caption color="contentLight">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima alias natus quia tempora praesentium qui
          omnis.
        </Text>
      </View>

      <View gap row>
        <Button flex outlined onPress={handleExport}>
          Export
        </Button>
        <Button flex onPress={handleImport}>
          Import
        </Button>
      </View>
    </Card>
  );
};

Backup.displayName = 'Backup';

Backup.propTypes = {};

export { Backup };
