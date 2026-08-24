import { DE, EN, ES, FR, PT } from '../dictionaries';

const ONBOARDING_KEYS = Object.keys(EN).filter((key) => key.startsWith('ONB_'));

describe('i18n/dictionaries', () => {
  test('the onboarding copy exists in every language', () => {
    expect(ONBOARDING_KEYS.length).toBe(26);

    [
      ['ES', ES],
      ['PT', PT],
      ['FR', FR],
      ['DE', DE],
    ].forEach(([name, dictionary]) => {
      const missing = ONBOARDING_KEYS.filter((key) => dictionary[key] === undefined);
      expect({ [name]: missing }).toEqual({ [name]: [] });
    });
  });

  test('CONTINUE is translated everywhere', () => {
    expect([EN, ES, PT, FR, DE].map((dictionary) => dictionary.CONTINUE)).toEqual([
      'Continue',
      'Continuar',
      'Continuar',
      'Continuer',
      'Weiter',
    ]);
  });
});
