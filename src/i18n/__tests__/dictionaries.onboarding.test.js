import { DE, EN, ES, FR, PT } from '../dictionaries';

const ONBOARDING_KEYS = Object.keys(EN).filter((key) => key.startsWith('ONB_'));

describe('i18n/dictionaries', () => {
  test('the onboarding copy exists in every language', () => {
    expect(ONBOARDING_KEYS.length).toBeGreaterThan(20);

    [
      ['ES', ES],
      ['PT', PT],
      ['FR', FR],
      ['DE', DE],
    ].forEach(([name, dictionary]) => {
      const missing = ONBOARDING_KEYS.filter((key) => dictionary[key] === undefined);
      expect({ [name]: missing }).toEqual({ [name]: [] });

      // A count would only need bumping; a set comparison catches a key left behind in one language.
      const extra = Object.keys(dictionary).filter((key) => key.startsWith('ONB_') && !ONBOARDING_KEYS.includes(key));
      expect({ [name]: extra }).toEqual({ [name]: [] });
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
