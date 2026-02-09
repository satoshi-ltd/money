import PropTypes from 'prop-types';
import React from 'react';

import { InputField, Text, View } from '../../components';
import { L10N } from '../../modules';

const LeadSlide = ({ title, description, email, onEmailChange, styles }) => {
  const resolvedTitle = title || L10N.ONBOARDING_LEAD_TITLE;
  const resolvedDescription = description || L10N.ONBOARDING_LEAD_CAPTION;

  const inputPlaceholder = L10N.ONBOARDING_LEAD_EMAIL_PLACEHOLDER;
  const hint = L10N.ONBOARDING_LEAD_HINT;

  return (
    <View style={styles.surveyWrap}>
      <View style={styles.surveyHeader}>
        <Text bold size="xl">
          {resolvedTitle}
        </Text>
        <Text tone="secondary">{resolvedDescription}</Text>
      </View>

      <View style={styles.leadForm}>
        <InputField
          autoCapitalize="none"
          first
          keyboardType="email-address"
          last
          placeholder={inputPlaceholder}
          returnKeyType="done"
          value={email}
          onChange={onEmailChange}
        />
        {hint ? (
          <Text size="xs" tone="secondary" style={styles.leadHint}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

LeadSlide.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  email: PropTypes.string,
  onEmailChange: PropTypes.func,
  styles: PropTypes.object.isRequired,
};

export { LeadSlide };
