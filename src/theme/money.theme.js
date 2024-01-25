import { DefaultTheme } from '../__design-system__/theme';

export const MoneyTheme = {
  ...DefaultTheme,

  // $colorAccent: '#ff5c5c',
  // $colorBase: '#000',
  // $colorBorder: '#222',
  // $colorContent: '#fff',
  // $colorContentLight: '#999',

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
  // -- <InputText> ------------------------------------------------------------
  $inputTextFontSize: '$fontSizeSubtitle',
  $inputTextHeight: '$spaceM * 4.5',
};
