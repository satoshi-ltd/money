import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Language.style';
import { Card, Icon, Panel, Pressable, Text, View } from '../../components';
import { useStore } from '../../contexts';
import { setLanguage } from '../../i18n';
import { L10N } from '../../modules';

const LANGUAGES = [
  { id: 'en', flag: '🇺🇸', label: () => L10N.LANGUAGE_EN },
  { id: 'es', flag: '🇪🇸', label: () => L10N.LANGUAGE_ES },
  { id: 'pt', flag: '🇵🇹', label: () => L10N.LANGUAGE_PT },
  { id: 'fr', flag: '🇫🇷', label: () => L10N.LANGUAGE_FR },
  { id: 'de', flag: '🇩🇪', label: () => L10N.LANGUAGE_DE },
];

const Language = ({ navigation: { goBack } = {} }) => {
  const store = useStore();
  const { settings: { language } = {}, updateSettings } = store;
  const [selected, setSelected] = useState();

  useEffect(() => {
    setSelected(language || 'en');
  }, [language]);

  const handleSelect = async (next) => {
    if (!next || next === language) {
      setSelected(next);
      goBack();
      return;
    }

    setSelected(next);
    updateSettings({ language: next });
    await setLanguage(next);
    goBack();
  };

  return (
    <Panel offset title={L10N.LANGUAGE} onBack={goBack}>
      <View style={style.list}>
        {LANGUAGES.map((item) => (
          <Pressable key={item.id} onPress={() => handleSelect(item.id)}>
            <View row style={style.item}>
              <Card style={style.iconCard} size="s">
                <Text size="m">{item.flag}</Text>
              </Card>

              <View flex>
                <Text bold={selected === item.id} numberOfLines={1}>
                  {item.label()}
                </Text>
              </View>

              {selected === item.id ? <Icon name="check" tone="accent" /> : <View style={style.rightPlaceholder} />}
            </View>
          </Pressable>
        ))}
      </View>
    </Panel>
  );
};

Language.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any,
};

export { Language };
