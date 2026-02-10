import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_SURVEY_DATA, SLIDES } from './Onboarding.constants';
import { Slide } from './Onboarding.Slide';
import { getStyles } from './Onboarding.style';
import { isValidEmail } from './utils/isValidEmail';
import { Button, ScrollView, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { LeadService } from '../../services';
import { theme } from '../../theme';

const Onboarding = ({ navigation: { navigate } }) => {
  const scrollview = useRef(null);
  const { colors, language } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const store = useStore();
  const { settings = {}, updateSettings } = store;
  const { width } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [surveyData, setSurveyData] = useState(() => {
    const answers = settings?.userProfile?.answers || {};
    const marketingLead = settings?.marketingLead || {};
    return {
      ...DEFAULT_SURVEY_DATA,
      ...answers,
      email: marketingLead.email || DEFAULT_SURVEY_DATA.email,
    };
  });

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
  };

  const spaceXL = theme.spacing.xl;
  const lastSlide = currentIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[currentIndex] || {};
  const is = {
    last: lastSlide,
    lead: currentSlide?.type === 'lead',
    survey: !!currentSlide?.type && currentSlide?.type !== 'lead',
  };

  const slideSize = width - spaceXL * 2;

  const persistProfile = async (partialAnswers, { completedAt } = {}) => {
    const baseAnswers = settings?.userProfile?.answers || {};
    const patch = partialAnswers || {};
    const merged = { ...baseAnswers, ...patch };

    // Only store survey-relevant fields (avoid persisting transient lead fields inside userProfile).
    delete merged.email;

    // Drop empty-string values to keep the profile compact.
    const answers = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v !== undefined));

    const nextUserProfile = {
      ...(settings?.userProfile || {}),
      version: 1,
      answers,
      completedAt: completedAt !== undefined ? completedAt : settings?.userProfile?.completedAt,
    };

    await updateSettings({ userProfile: nextUserProfile });
  };

  const scrollToIndex = (index) => {
    if (!scrollview.current) return;
    scrollview.current.scrollTo({ x: width * index, animated: true });
  };

  const handleSurveyChange = async (field, value) => {
    const nextSurveyData = { ...surveyData, [field]: value };
    setSurveyData(nextSurveyData);

    await persistProfile({ [field]: value });

    // Auto-advance on any survey selection.
    scrollToIndex(Math.min(SLIDES.length - 1, currentIndex + 1));
  };

  const handleLeadEmail = (email) => setSurveyData((prev) => ({ ...prev, email }));

  const leadEmailValid = isValidEmail(surveyData.email);
  const leadEmailPresent = `${surveyData.email || ''}`.trim().length > 0;

  const handleNext = async () => {
    if (is.last) {
      // Lead capture: optional. We only send if the user provided a valid email.
      if (is.lead && leadEmailPresent && leadEmailValid) {
        const email = `${surveyData.email || ''}`.trim();
        const { fingerprint } = settings || {};
        const profile = settings?.userProfile?.answers || {};

        try {
          const response = await LeadService.send({
            consent: true,
            email,
            fingerprint,
            language,
            profile,
            version: C.VERSION,
          });
          await updateSettings({
            marketingLead: { email, consent: true, sentAt: Date.now(), remote: response || true },
          });
        } catch {
          // Do not block onboarding if the network fails.
          await updateSettings({
            marketingLead: { email, consent: true, sentAt: Date.now(), remote: false },
          });
          eventEmitter.emit(C.EVENT.NOTIFICATION, { error: true, title: L10N.LEAD_SEND_FAILED });
        }
      } else if (is.lead && !leadEmailPresent) {
        // Explicitly persist "no lead" choice (keeps defaults, but updates local email if needed).
        await updateSettings({
          marketingLead: { email: '', consent: false, sentAt: undefined, remote: undefined },
        });
      }

      await persistProfile(surveyData, { completedAt: settings?.userProfile?.completedAt || Date.now() });
      await updateSettings({ onboarded: true });
      navigate('session');
    } else if (scrollview.current) {
      let nextIndex = currentIndex + 1;
      nextIndex = Math.min(SLIDES.length - 1, nextIndex);
      scrollview.current.scrollTo({ x: width * nextIndex, animated: true });
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView horizontal ref={scrollview} snapTo={width} onScroll={handleScroll}>
        {SLIDES.map((slide, index) => (
          <Slide
            key={`slide-${index}`}
            leadEmail={surveyData.email}
            slide={slide}
            slideSize={slideSize}
            styles={styles}
            surveyValue={slide?.type && slide.type !== 'lead' ? surveyData[slide.type] : undefined}
            width={width}
            onLeadEmailChange={handleLeadEmail}
            onSurveyChange={handleSurveyChange}
          />
        ))}
      </ScrollView>

      <View row style={styles.footer}>
        <View flex />

        <Button disabled={is.survey && !surveyData[currentSlide?.type]} onPress={handleNext} style={styles.button}>
          {is.lead ? L10N.START : is.last ? L10N.START : L10N.NEXT}
        </Button>
      </View>
    </SafeAreaView>
  );
};

Onboarding.propTypes = {
  navigation: PropTypes.any,
};

export { Onboarding };
