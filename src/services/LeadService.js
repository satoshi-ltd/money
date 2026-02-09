import { apiCall } from './modules';

// Lead capture is strictly opt-in and only sent when the user explicitly finishes onboarding.
export const LeadService = {
  send: async ({ email, consent, fingerprint, language, profile, version } = {}) => {
    const safeEmail = `${email || ''}`.trim();
    if (!safeEmail) throw new Error('missing_email');
    if (!consent) throw new Error('missing_consent');

    return apiCall({
      method: 'POST',
      service: 'lead',
      email: safeEmail,
      consent: true,
      fingerprint,
      language,
      version,
      profile,
      createdAt: new Date().toISOString(),
    });
  },
};
