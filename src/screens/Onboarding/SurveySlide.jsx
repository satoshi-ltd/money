import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { Pressable, Text, View } from '../../components';

const SurveySlide = ({ title, description, options = [], value, onChange, styles }) => {
  const resolvedOptions = Array.isArray(options) ? options : [];

  const selectedTextTone = 'accent';
  const cardSelectedStyle = useMemo(() => [styles.optionCard, styles.optionCardSelected], [styles]);

  return (
    <View style={styles.surveyWrap}>
      <View style={styles.surveyHeader}>
        <Text bold size="xl">
          {title}
        </Text>
        {description ? <Text tone="secondary">{description}</Text> : null}
      </View>

      <View style={styles.surveyOptions}>
        {resolvedOptions.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange?.(option.value)}
              style={selected ? cardSelectedStyle : styles.optionCard}
            >
              <Text bold size="s" tone={selected ? selectedTextTone : undefined}>
                {option.label}
              </Text>
              {option.description ? (
                <Text size="xs" tone="secondary">
                  {option.description}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

SurveySlide.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
  styles: PropTypes.object.isRequired,
};

export { SurveySlide };
