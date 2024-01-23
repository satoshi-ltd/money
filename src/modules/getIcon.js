import { ICON } from './icon';

const CATEGORY_ICON = [
  {
    // Expenses
    0: ICON.TRASH,
    1: ICON.FOOD,
    3: ICON.TRAVEL,
    4: ICON.DEBT,
    5: ICON.INVESTMENT,
    6: ICON.ENTERTAINMENT,
    7: ICON.SHOPPING,
    8: ICON.UTILITIES,
    9: ICON.HOSPITAL,
    10: ICON.PERSONAL,
    11: ICON.SERVICES,
    12: ICON.TRANSFER,
    13: ICON.OTHERS,
    99: ICON.SWAP,
  },
  {
    // Incomes
    0: ICON.TRASH,
    1: ICON.SALARY,
    2: ICON.INVESTMENT,
    3: ICON.PASIVE,
    4: ICON.TRANSFER,
    5: ICON.OTHERS,
    99: ICON.SWAP,
  },
];

export const getIcon = ({ type, category, title } = {}) => {
  const contains = (samples) => samples.filter((value) => captions.includes(value)).length > 0;

  let captions = title ? title.trim().toLowerCase().split(' ') : undefined;

  if (captions) {
    // Food & Drinks
    if (contains(['water'])) return ICON.WATER;
    if (contains(['coffee'])) return ICON.COFFEE;
    if (contains(['tea'])) return ICON.TEA;
    if (contains(['dessert', 'cake'])) return ICON.DESSERT;
    if (contains(['burger'])) return ICON.BURGER;
    if (contains(['bakery', 'donut', 'croissant'])) return ICON.BAKERY;
    if (contains(['meat'])) return ICON.MEAT;
    if (contains(['fruit', 'fruits'])) return ICON.FRUIT;
    if (contains(['fish'])) return ICON.FISH;
    if (contains(['dairy', 'milk', 'yogurt'])) return ICON.DAIRY;
    if (contains(['egg', 'eggs'])) return ICON.EGG;
    if (contains(['bread'])) return ICON.BREAD;
    if (contains(['snack', 'snacks'])) return ICON.SNACK;
    if (contains(['icecream'])) return ICON.ICECREAM;
    if (contains(['grocery', 'groceries'])) return ICON.GROCERY;
    if (contains(['nut', 'nuts'])) return ICON.NUT;
    if (contains(['vegetable', 'vegetables'])) return ICON.VEGETABLE;
    // Travel
    if (contains(['car'])) return ICON.CAR;
    if (contains(['taxi'])) return ICON.TAXI;
    if (contains(['bus'])) return ICON.BUS;
    if (contains(['airplane'])) return ICON.AIRPLANE;
    if (contains(['motorbike', 'scooter'])) return ICON.MOTORBIKE;
    if (contains(['boat', 'ship'])) return ICON.BOAT;
    if (contains(['train', 'skytrain'])) return ICON.TRAIN;
    if (contains(['subway'])) return ICON.SUBWAY;
    if (contains(['parking'])) return ICON.PARKING;
    if (contains(['bag', 'backpack', 'suitcase', 'trolley'])) return ICON.SUITCASE;
    if (contains(['ticket', 'tollway'])) return ICON.TICKET;
    if (contains(['hotel', 'hostel', 'airbnb'])) return ICON.HOTEL;
    // debt
    if (contains(['salary'])) return ICON.SALARY;
    if (contains(['contract', 'mortgage'])) return ICON.CONTRACT;
    // investment
    if (contains(['gold', 'xau'])) return ICON.GOLD;
    if (contains(['bitcoin', 'btc'])) return ICON.BITCOIN;
    // entertainment
    if (contains(['movie', 'film', 'cinema'])) return ICON.MOVIE;
    // shopping
    if (contains(['run', 'running', 'trail'])) return ICON.RUN;
    if (contains(['shoes'])) return ICON.SHOE;
    if (contains(['watch'])) return ICON.WATCH;
    if (contains(['clothe', 'clothing', 'uniqlo', 'jacket', 'pant', 'trouser', 't-shirt', 'shirt', 'tshirt']))
      return ICON.TSHIRT;
    if (contains(['apple', 'macbook', 'ipad', 'iphone', 'iwatch', 'airtag'])) return ICON.APPLE;
    // Utilities
    if (contains(['gasoline', 'gas station'])) return ICON.GASOLINE;
    if (contains(['phone', 'smartphone'])) return ICON.PHONE;
    if (contains(['villa', 'condo', 'house', 'rent'])) return ICON.HOME;
    if (contains(['condo', 'apartment'])) return ICON.APARTMENT;
    if (contains(['internet', 'wifi'])) return ICON.WIFI;
    if (contains(['water'])) return ICON.WATER;
    if (contains(['electric', 'electricity'])) return ICON.ELECTRICITY;
    // Healthcare
    if (contains(['pill', 'medicine', 'vitamine'])) return ICON.PILL;
    if (contains(['doctor', 'dentist'])) return ICON.DOCTOR;
    // Services
    if (contains(['garden'])) return ICON.GARDEN;
    if (contains(['laundry'])) return ICON.LAUNDRY;
    if (contains(['netflix'])) return ICON.NETFLIX;
    if (contains(['icloud'])) return ICON.ICLOUD;
    if (contains(['spotify'])) return ICON.SPOTIFY;
    if (contains(['paypal'])) return ICON.PAYPAL;
    // ??

    if (contains(['car'])) return ICON.CAR;
    if (contains(['house'])) return ICON.HOME;

    // banks
    if (contains(['kasikorn'])) return ICON.KASIKORN;
    if (contains(['krungthai'])) return ICON.KRUNGTHAI;
    if (contains(['wise', 'transferwise'])) return ICON.WISE;
    if (contains(['n26', 'number26'])) return ICON.N26;
    if (contains(['ing'])) return ICON.ING;
    if (contains(['revolut'])) return ICON.REVOLUT;
    // family
    if (contains(['eki'])) return ICON.EKI;
    if (contains(['benji'])) return ICON.BENJI;
    if (contains(['youri', 'you', 'yuri'])) return ICON.YURI;
  }

  return CATEGORY_ICON[type][category] || ICON.UNKNOWN;
};
