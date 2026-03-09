import { getIcon } from '../getIcon';
import { ICON } from '../icon';

describe('getIcon', () => {
  test('matches meal concepts from title', () => {
    expect(getIcon({ type: 0, category: 10, title: 'Dinner' })).toBe(ICON.FOOD);
    expect(getIcon({ type: 0, category: 10, title: 'Lunch' })).toBe(ICON.FOOD);
    expect(getIcon({ type: 0, category: 10, title: 'Breakfast' })).toBe(ICON.FOOD);
  });

  test('maps drink concepts with dedicated icons', () => {
    expect(getIcon({ type: 0, category: 1, title: 'Juice' })).toBe(ICON.JUICE);
    expect(getIcon({ type: 0, category: 1, title: 'Water' })).toBe(ICON.BEVERAGE);
    expect(getIcon({ type: 0, category: 1, title: 'Beer' })).toBe(ICON.BEER);
  });

  test('handles punctuation and maps generic crypto concepts', () => {
    expect(getIcon({ type: 1, category: 99, title: '🇪🇺 Bitcoin' })).toBe(ICON.BITCOIN);
    expect(getIcon({ type: 1, category: 99, title: 'Crypto exchange' })).toBe(ICON.BITCOIN);
  });

  test('supports bigrams for multi-word concepts', () => {
    expect(getIcon({ type: 0, category: 99, title: 'Real Estate' })).toBe(ICON.CITY_HOME);
    expect(getIcon({ type: 0, category: 13, title: 'Gas Station' })).toBe(ICON.GASOLINE);
  });

  test('maps healthcare supplements and hygiene concepts', () => {
    expect(getIcon({ type: 0, category: 9, title: 'Electrolytes' })).toBe(ICON.VITAMIN);
    expect(getIcon({ type: 0, category: 9, title: 'Toothpaste' })).toBe(ICON.DENTAL);
    expect(getIcon({ type: 0, category: 9, title: 'Acupuncture' })).toBe(ICON.DOCTOR);
    expect(getIcon({ type: 0, category: 9, title: 'Vitamin C' })).toBe(ICON.VITAMIN);
  });

  test('maps motorsport concepts', () => {
    expect(getIcon({ type: 0, category: 6, title: 'F1 race' })).toBe(ICON.RACING);
    expect(getIcon({ type: 0, category: 6, title: 'Kart training' })).toBe(ICON.RACING);
    expect(getIcon({ type: 0, category: 6, title: 'Racing cockpit' })).toBe(ICON.RACING);
  });

  test('maps sports and training concepts', () => {
    expect(getIcon({ type: 0, category: 6, title: 'Yoga class' })).toBe(ICON.YOGA);
    expect(getIcon({ type: 0, category: 6, title: 'Bodybuilding gym' })).toBe(ICON.BODYBUILDING);
    expect(getIcon({ type: 0, category: 6, title: 'Padel match' })).toBe(ICON.PADEL);
  });

  test('maps subscription brands and software services', () => {
    expect(getIcon({ type: 0, category: 11, title: 'YouTube Premium' })).toBe(ICON.YOUTUBE);
    expect(getIcon({ type: 0, category: 11, title: 'Amazon Prime' })).toBe(ICON.AMAZON);
    expect(getIcon({ type: 0, category: 11, title: 'Google AI Plus' })).toBe(ICON.GOOGLE);
    expect(getIcon({ type: 0, category: 11, title: 'Disney Plus' })).toBe(ICON.STREAMING);
  });

  test('maps frequent groceries and household concepts', () => {
    expect(getIcon({ type: 0, category: 1, title: 'Rice' })).toBe(ICON.GRAINS);
    expect(getIcon({ type: 0, category: 1, title: 'Chickpeas' })).toBe(ICON.GRAINS);
    expect(getIcon({ type: 0, category: 8, title: 'Households' })).toBe(ICON.HOME);
    expect(getIcon({ type: 0, category: 13, title: 'Highway Toll' })).toBe(ICON.TICKET);
    expect(getIcon({ type: 0, category: 7, title: 'Diapers' })).toBe(ICON.BABY);
  });

  test('maps business and learning concepts', () => {
    expect(getIcon({ type: 1, category: 5, title: 'Consulting project' })).toBe(ICON.WORK);
    expect(getIcon({ type: 1, category: 3, title: 'Udemy' })).toBe(ICON.EDUCATION);
  });

  test('maps finance docs and refunds', () => {
    expect(getIcon({ type: 0, category: 11, title: 'Tax payment' })).toBe(ICON.TAX);
    expect(getIcon({ type: 0, category: 11, title: 'Invoice #123' })).toBe(ICON.INVOICE);
    expect(getIcon({ type: 0, category: 11, title: 'Refund order' })).toBe(ICON.REFUND);
    expect(getIcon({ type: 0, category: 11, title: 'Bank fee' })).toBe(ICON.FEE);
    expect(getIcon({ type: 0, category: 11, title: 'Loan payment' })).toBe(ICON.LOAN);
    expect(getIcon({ type: 0, category: 11, title: 'ATM cash withdrawal' })).toBe(ICON.ATM);
  });

  test('normalizes semantic variants', () => {
    expect(getIcon({ type: 0, category: 6, title: 'Work-out session' })).toBe(ICON.FITNESS);
    expect(getIcon({ type: 0, category: 11, title: 'Wi-Fi bill' })).toBe(ICON.WIFI);
  });

  test('keeps boundary between service, store and work concepts', () => {
    expect(getIcon({ type: 0, category: 11, title: 'Plumber service' })).toBe(ICON.REPAIR);
    expect(getIcon({ type: 0, category: 7, title: 'Online store purchase' })).toBe(ICON.STORE);
    expect(getIcon({ type: 1, category: 5, title: 'Freelance contract' })).toBe(ICON.WORK);
  });

  test('falls back to category icon when no title match exists', () => {
    expect(getIcon({ type: 0, category: 13, title: 'Unmatched concept' })).toBe(ICON.TRANSPORTATION);
  });
});
