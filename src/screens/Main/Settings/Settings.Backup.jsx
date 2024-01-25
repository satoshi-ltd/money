import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform } from 'react-native';

import { Button, Card, View, Text } from '../../../__design-system__';
import { useStore } from '../../../contexts';
import { setNextNotification } from '../../../modules';

const Backup = ({ navigation: { navigate } = {}, ...others }) => {
  const { vaults: accounts, importBackup, settings, txs } = useStore();
  const IS_WEB = Platform.OS === 'web';

  const handleExport = async () => {
    try {
      const fileName = `money-${new Date().toISOString()}.json`;
      const data = JSON.stringify({ accounts, settings, txs });

      if (IS_WEB) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        a.download = fileName;
        return a.click();
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) return alert('Can not share');

      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, data);
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
        let jsonData = {};

        if (IS_WEB) {
          jsonData = await fetch(file.uri).then((res) => res.json());
        } else {
          const fileData = await FileSystem.readAsStringAsync(file.uri);
          jsonData = JSON.parse(fileData);
        }

        if (jsonData.settings && jsonData.accounts && jsonData.txs) {
          navigate('confirm', {
            caption: `Are you sure you want to import the selected JSON file? This will update your current financial data with the information from the file. The import contains ${jsonData.accounts.length} accounts and ${jsonData.txs.length} transactions. Please ensure that the file is correct and up-to-date. This action cannot be undone.`,
            title: 'Confirm Import',
            onAccept: async () => {
              await importBackup(jsonData);
              alert('Imported successfully.');
            },
          });
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

Backup.propTypes = {
  navigation: PropTypes.any,
};

export { Backup };
