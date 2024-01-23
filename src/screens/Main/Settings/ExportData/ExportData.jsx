import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './ExportData.style';
import { Button, View } from '../../../../__design-system__';
import { useStore } from '../../../../contexts';

const ExportData = () => {
  const { vaults: accounts, importBackup, settings, txs } = useStore();

  const exportData = async () => {
    try {
      const storedData = JSON.stringify({ accounts, settings, txs });
      const version = new Date().toISOString();

      const fileUri = FileSystem.documentDirectory + `money-${version}.json`;
      await FileSystem.writeAsStringAsync(fileUri, storedData);

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) throw new Error('Can not share');
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: 'application/json',
      });

      if (!result.cancelled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const fileContent = await FileSystem.readAsStringAsync(file.uri);

        const backup = JSON.parse(fileContent);

        importBackup(backup);
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  return (
    <View row style={style.buttons}>
      <Button flex outlined onPress={exportData}>
        Export
      </Button>
      <Button flex outlined onPress={importData}>
        Import
      </Button>
    </View>
  );
};

ExportData.displayName = 'ExportData';

ExportData.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { ExportData };
