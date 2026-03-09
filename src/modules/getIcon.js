import { ICON } from './icon';

const CATEGORY_ICON = [
  {
    // Expenses
    1: ICON.FOOD,
    3: ICON.TRAVEL,
    4: ICON.DEBT,
    5: ICON.INVESTMENT,
    6: ICON.ENTERTAINMENT,
    7: ICON.SHOPPING,
    8: ICON.HOME,
    9: ICON.HOSPITAL,
    10: ICON.PERSONAL,
    11: ICON.SERVICES,
    12: ICON.TRANSFER,
    13: ICON.TRANSPORTATION,
    14: ICON.EDUCATION,
    15: ICON.INSURANCE,
    99: ICON.SWAP,
  },
  {
    // Incomes
    1: ICON.SALARY,
    2: ICON.INVESTMENT,
    3: ICON.PASSIVE,
    4: ICON.TRANSFER,
    5: ICON.BUSINESS,
    6: ICON.RETIREMENT,
    7: ICON.ROYALTIES,
    8: ICON.BONUSES,
    9: ICON.OTHERS,
    99: ICON.SWAP,
  },
];

const tokenizeTitle = (title = '') =>
  {
    const normalizePhrases = (value = '') =>
      value
        .replace(/work[\s-]?out/gi, 'workout')
        .replace(/co[\s-]?working/gi, 'coworking')
        .replace(/e[\s-]?mail/gi, 'email')
        .replace(/wi[\s-]?fi/gi, 'wifi')
        .replace(/real[\s-]?estate/gi, 'real estate')
        .replace(/credit[\s-]?card/gi, 'credit card')
        .replace(/debit[\s-]?card/gi, 'debit card');

    const singularize = (word = '') => {
      if (word.length <= 3) return word;
      if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
      if (/(sses|ches|shes|xes|zes)$/.test(word)) return word.slice(0, -2);
      if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us') && !word.endsWith('is')) return word.slice(0, -1);
      return word;
    };

    return normalizePhrases(title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, ' ')
      .split(/\s+/)
      .map((word) => word.replace(/^[^a-z0-9]+|[^a-z0-9.]+$/g, ''))
      .filter(Boolean)
      .map((word) => singularize(word));
  };

const withBigrams = (tokens = []) => {
  const list = [...tokens];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    list.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return list;
};

const PRIORITY_RULES = [
  { icon: ICON.REFUND, samples: ['refund', 'chargeback'] },
  { icon: ICON.FEE, samples: ['fee', 'fees', 'commission'] },
  { icon: ICON.LOAN, samples: ['loan', 'debt payment'] },
  { icon: ICON.INTEREST, samples: ['interest'] },
  { icon: ICON.ATM, samples: ['atm', 'cash withdrawal'] },
  { icon: ICON.TAX, samples: ['tax', 'taxes'] },
  { icon: ICON.INVOICE, samples: ['invoice', 'invoice payment'] },
  { icon: ICON.RECEIPT, samples: ['receipt'] },
  { icon: ICON.SALARY, samples: ['salary advance'] },
];

const DOMAIN_RULES = [
  // Widely-used subscription brands and platforms
  { icon: ICON.YOUTUBE, samples: ['youtube premium', 'youtube'] },
  { icon: ICON.NETFLIX, samples: ['netflix'] },
  { icon: ICON.SPOTIFY, samples: ['spotify'] },
  { icon: ICON.ICLOUD, samples: ['icloud', 'apple one', 'apple music'] },
  { icon: ICON.AMAZON, samples: ['amazon prime', 'prime video'] },
  { icon: ICON.GOOGLE, samples: ['google one', 'google drive', 'google workspace', 'google'] },
  { icon: ICON.MICROSOFT, samples: ['microsoft 365', 'office 365', 'microsoft'] },
  { icon: ICON.PAYPAL, samples: ['paypal'] },
  { icon: ICON.STREAMING, samples: ['streaming', 'disney', 'hbo', 'max', 'paramount', 'apple tv'] },
  { icon: ICON.SUBSCRIPTION, samples: ['subscription', 'membership'] },

  // Food and drinks
  { icon: ICON.RESTAURANT, samples: ['restaurant'] },
  { icon: ICON.COFFEE, samples: ['coffee'] },
  { icon: ICON.TEA, samples: ['tea'] },
  { icon: ICON.JUICE, samples: ['juice', 'smoothie'] },
  { icon: ICON.BEVERAGE, samples: ['water', 'drink', 'soda'] },
  { icon: ICON.BEER, samples: ['beer'] },
  { icon: ICON.WINE, samples: ['wine'] },
  { icon: ICON.PIZZA, samples: ['pizza'] },
  { icon: ICON.DESSERT, samples: ['dessert', 'desert', 'cake', 'pastry'] },
  { icon: ICON.BAKERY, samples: ['bakery', 'donut', 'croissant'] },
  { icon: ICON.BURGER, samples: ['burger'] },
  { icon: ICON.CHICKEN, samples: ['chicken'] },
  { icon: ICON.MEAT, samples: ['meat', 'beef', 'barbecue', 'bbq', 'chorizo'] },
  { icon: ICON.FISH, samples: ['fish', 'seafood', 'sardine'] },
  { icon: ICON.FRUIT, samples: ['fruit'] },
  { icon: ICON.GRAINS, samples: ['rice', 'quinoa', 'chickpea', 'lentil', 'oat', 'cereal', 'bean'] },
  { icon: ICON.VEGETABLE, samples: ['vegetable', 'salad', 'olive', 'olive oil'] },
  { icon: ICON.DAIRY, samples: ['dairy', 'milk', 'yogurt', 'cheese'] },
  { icon: ICON.EGG, samples: ['egg'] },
  { icon: ICON.BREAD, samples: ['bread'] },
  { icon: ICON.SNACK, samples: ['snack', 'chocolate', 'candy', 'honey', 'junk food'] },
  { icon: ICON.ICECREAM, samples: ['icecream'] },
  {
    icon: ICON.GROCERY,
    samples: ['grocery', 'supermarket', 'pasta', 'salt'],
  },
  { icon: ICON.NUT, samples: ['nut', 'seed'] },
  { icon: ICON.FOOD, samples: ['breakfast', 'lunch', 'dinner', 'brunch', 'meal'] },

  // Health and wellness
  { icon: ICON.DENTAL, samples: ['dentist', 'dental', 'tooth', 'toothpaste'] },
  { icon: ICON.MEDICAL_TEST, samples: ['blood test', 'screening', 'analysis'] },
  {
    icon: ICON.VITAMIN,
    samples: ['vitamin', 'supplement', 'capsule', 'tablet', 'protein', 'electrolyte', 'calcium', 'magnesium', 'zinc', 'probiotic'],
  },
  { icon: ICON.PILL, samples: ['pill', 'medicine', 'medication', 'pharmacy', 'fiber', 'melatonin'] },
  { icon: ICON.DOCTOR, samples: ['doctor', 'clinic', 'hospital', 'acupuncture'] },
  { icon: ICON.YOGA, samples: ['yoga', 'pilates'] },
  { icon: ICON.BODYBUILDING, samples: ['bodybuilding', 'crossfit', 'weightlifting'] },
  { icon: ICON.FITNESS, samples: ['fitness', 'gym', 'workout'] },
  { icon: ICON.TENNIS, samples: ['tennis'] },
  { icon: ICON.FOOTBALL, samples: ['football', 'soccer'] },
  { icon: ICON.PADEL, samples: ['padel'] },
  { icon: ICON.RACING, samples: ['f1', 'race', 'racing', 'kart', 'cockpit'] },
  { icon: ICON.RUN, samples: ['run', 'running', 'trail', 'swimming', 'sport', 'surf'] },
  { icon: ICON.BICYCLE, samples: ['bike', 'bicycle', 'cycling'] },

  // Travel and transport
  { icon: ICON.GASOLINE, samples: ['gasoline', 'gas station', 'fuel'] },
  { icon: ICON.CAR, samples: ['car', 'truck'] },
  { icon: ICON.MOTORBIKE, samples: ['motorbike', 'scooter', 'motorcycle'] },
  { icon: ICON.TAXI, samples: ['taxi', 'uber', 'grab'] },
  { icon: ICON.BUS, samples: ['bus'] },
  { icon: ICON.TRAIN, samples: ['train', 'skytrain'] },
  { icon: ICON.SUBWAY, samples: ['subway', 'metro'] },
  { icon: ICON.AIRPLANE, samples: ['airplane', 'flight'] },
  { icon: ICON.BOAT, samples: ['boat', 'ship', 'ferry'] },
  { icon: ICON.PARKING, samples: ['parking'] },
  { icon: ICON.TICKET, samples: ['ticket', 'toll', 'tollway'] },
  { icon: ICON.HOTEL, samples: ['hotel', 'hostel', 'airbnb'] },
  { icon: ICON.SUITCASE, samples: ['suitcase', 'backpack', 'luggage', 'baggage'] },

  // Home and utilities
  { icon: ICON.CITY_HOME, samples: ['rent', 'mortgage', 'real estate', 'property'] },
  { icon: ICON.HOME, samples: ['house', 'home', 'household'] },
  { icon: ICON.APARTMENT, samples: ['apartment', 'condo'] },
  { icon: ICON.CLEANING, samples: ['cleaning'] },
  { icon: ICON.FURNITURE, samples: ['furniture', 'sofa', 'chair', 'desk'] },
  { icon: ICON.SECURITY_HOME, samples: ['alarm', 'security', 'lock'] },
  { icon: ICON.REPAIR, samples: ['plumbing', 'plumber', 'electrician'] },
  { icon: ICON.WIFI, samples: ['internet', 'wifi', 'broadband', 'domain', 'hosting'] },
  { icon: ICON.WIFI, samples: ['internet bill'] },
  { icon: ICON.WATER, samples: ['water bill'] },
  { icon: ICON.ELECTRICITY, samples: ['electric', 'electricity', 'power'] },

  // Shopping and personal care
  { icon: ICON.TOY, samples: ['toy'] },
  { icon: ICON.BABY, samples: ['diaper', 'baby'] },
  { icon: ICON.CHILD, samples: ['kid', 'child'] },
  { icon: ICON.SHOE, samples: ['shoe', 'sneaker'] },
  { icon: ICON.WATCH, samples: ['watch'] },
  { icon: ICON.TSHIRT, samples: ['clothe', 'clothing', 'jacket', 'pant', 'trouser', 'shirt', 'tshirt', 'cap'] },
  { icon: ICON.APPLE, samples: ['apple', 'macbook', 'ipad', 'iphone', 'airtag'] },
  { icon: ICON.DEVICES, samples: ['electronic', 'accessory', 'keyboard', 'cable', 'charger', 'adapter', 'sd card'] },
  { icon: ICON.CAMERA, samples: ['camera'] },
  { icon: ICON.DRONE, samples: ['drone'] },
  { icon: ICON.BASKET, samples: ['basket'] },
  { icon: ICON.STORE, samples: ['shopping', 'purchase', 'store'] },
  { icon: ICON.SHOPPING, samples: ['cover', 'case', 'parts', 'storage'] },
  { icon: ICON.PERSONAL, samples: ['soap', 'shampoo', 'razor', 'skincare', 'pad', 'period', 'glass', 'balm', 'massage'] },
  { icon: ICON.PET, samples: ['pet'] },

  // Education and entertainment
  { icon: ICON.STUDY, samples: ['course', 'class', 'tuition', 'study'] },
  { icon: ICON.EDUCATION, samples: ['education', 'school', 'homework', 'kindergarten', 'udemy'] },
  { icon: ICON.BOOK, samples: ['book', 'kindle', 'paperwhite'] },
  { icon: ICON.MOVIE, samples: ['movie', 'film', 'cinema'] },
  { icon: ICON.MUSIC, samples: ['music', 'album'] },
  { icon: ICON.ENTERTAINMENT, samples: ['game', 'playground'] },

  // Finance and admin
  { icon: ICON.INSURANCE, samples: ['insurance'] },
  { icon: ICON.CARD, samples: ['credit card', 'debit card', 'card'] },
  { icon: ICON.BANK, samples: ['bank'] },
  { icon: ICON.SAVINGS, samples: ['saving', 'savings'] },
  { icon: ICON.BITCOIN, samples: ['crypto', 'bitcoin', 'btc', 'exchange'] },
  { icon: ICON.INVESTMENT, samples: ['investment', 'invest', 'trading'] },
  { icon: ICON.SALARY, samples: ['salary', 'payroll'] },
  { icon: ICON.WORK, samples: ['consulting', 'freelance', 'project', 'contract', 'contractor'] },
  { icon: ICON.BUSINESS, samples: ['business'] },
  { icon: ICON.PASSIVE, samples: ['earn', 'interest'] },
  { icon: ICON.GIFT, samples: ['gift', 'birthday'] },
  { icon: ICON.BONUSES, samples: ['cashback', 'bonus'] },
  { icon: ICON.TRANSFER, samples: ['transfer', 'wallet'] },
  { icon: ICON.ARCHIVE, samples: ['archive', 'storage box'] },
  { icon: ICON.FILE, samples: ['statement', 'document', 'copy', 'photocopy', 'paper', 'certificate', 'paperwork', 'license'] },

  // Generic services
  { icon: ICON.GARDEN, samples: ['garden', 'gardener', 'gardening'] },
  { icon: ICON.LAUNDRY, samples: ['laundry'] },
  { icon: ICON.PHONE, samples: ['mobile', 'phone', 'smartphone'] },
  { icon: ICON.DELIVERY, samples: ['delivery', 'courier', 'shipping'] },
  { icon: ICON.REPAIR, samples: ['maintenance', 'repair', 'plumber'] },
  { icon: ICON.SERVICES, samples: ['service', 'accountant'] },
];

const TITLE_ICON_RULES = [...PRIORITY_RULES, ...DOMAIN_RULES];

const getTitleIcon = (captions = []) => {
  for (let index = 0; index < TITLE_ICON_RULES.length; index += 1) {
    const { icon, samples } = TITLE_ICON_RULES[index];
    if (samples.some((value) => captions.includes(value))) return icon;
  }
  return undefined;
};

export const getIcon = ({ type, category, title } = {}) => {
  const captions = typeof title === 'string' ? withBigrams(tokenizeTitle(title)) : [];
  const titleIcon = captions.length ? getTitleIcon(captions) : undefined;
  if (titleIcon) return titleIcon;
  return CATEGORY_ICON[type]?.[category] || ICON.UNKNOWN;
};
