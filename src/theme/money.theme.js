import { DefaultTheme } from '../__design-system__/theme';

const FONT_L = 21; // subtitle 22
const LINE_HEIGHT = 1.33;

export const MoneyTheme = {
  ...DefaultTheme,

  // $colorAccent: '#ff5c5c',
  // $colorBase: '#000',
  // $colorBorder: '#333',
  // $colorContent: '#fff',
  // $colorContentLight: '#999',

  // --
  $offset: '$spaceM',

  // -- <Icon> -----------------------------------------------------------------
  $iconFamily: 'shield-icons',
  $iconGlyphs: require('../../assets/fonts/Shield-Icons.json'),
  $iconSize: 24,

  // == Components =============================================================
  $cardGap: '$spaceS',
  // -- <CardAccount> ----------------------------------------------------------
  $cardAccountSize: '$spaceM * 10',
  $cardAccountSnap: '$cardAccountSize + $cardGap',
  // -- <Option> ---------------------------------------------------------------
  $optionSize: '$spaceM * 5',
  $optionSnap: '$optionSize + $cardGap',

  // -- <Input> ----------------------------------------------------------------
  $inputHeight: '$spaceM * 4.5',
  $fontInput: 'font-bold',
  $fontInputStyle: 'normal',
  $fontInputVariant: ['normal'],
  $fontInputWeight: '700',
  $fontInputSize: FONT_L,
  $fontInputHeight: FONT_L * LINE_HEIGHT,
  $fontInputPaddingTop: 0,
  $fontInputPaddingRight: 16,
  $fontInputPaddingBottom: 0,
  $fontInputPaddingLeft: 16,
  $fontInputLetterSpacing: 0,
  $inputOptionSize: 20,
  $inputSize: 56,
  $inputSizeSmall: 40,
  $inputSizeLarge: 72,
  $inputFont: 'font-default',

  // -- <InputCurrency> --------------------------------------------------------
};
