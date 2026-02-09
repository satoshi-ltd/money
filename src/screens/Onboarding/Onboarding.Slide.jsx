import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

import { LeadSlide } from './LeadSlide';
import { IMAGE_SIZE } from './Onboarding.constants';
import { SurveySlide } from './SurveySlide';
import { Text, View } from '../../components';

const Slide = ({ slide, width, styles, slideSize, surveyValue, onSurveyChange, leadEmail, onLeadEmailChange }) => {
  const { image, message, title, type, description, options } = slide || {};
  const isLead = type === 'lead';
  const isSurvey = !!type && !isLead;

  if (isLead) {
    return (
      <View style={[styles.slide, { width }]}>
        <LeadSlide
          description={description}
          email={leadEmail}
          styles={styles}
          title={title}
          onEmailChange={onLeadEmailChange}
        />
      </View>
    );
  }

  if (isSurvey) {
    return (
      <View style={[styles.slide, { width }]}>
        <SurveySlide
          description={description}
          options={options}
          styles={styles}
          title={title}
          value={surveyValue}
          onChange={(value) => onSurveyChange?.(type, value)}
        />
      </View>
    );
  }

  const resolvedImageStyle =
    slideSize && slideSize <= IMAGE_SIZE ? { height: slideSize * 1.2, width: slideSize } : undefined;

  return (
    <View style={[styles.slide, { width }]}>
      {image ? <Image resizeMode="contain" source={image} style={[styles.image, resolvedImageStyle]} /> : null}
      <View style={styles.surveyHeader}>
        <Text bold size="xl">
          {title}
        </Text>
        {message ? <Text tone="secondary">{message}</Text> : null}
      </View>
    </View>
  );
};

Slide.propTypes = {
  slide: PropTypes.shape({}).isRequired,
  width: PropTypes.number.isRequired,
  slideSize: PropTypes.number,
  styles: PropTypes.object.isRequired,

  surveyValue: PropTypes.string,
  onSurveyChange: PropTypes.func,

  leadEmail: PropTypes.string,
  onLeadEmailChange: PropTypes.func,
};

export { Slide };
