// import { MoneyTheme } from './money.theme';
import { DefaultTheme } from '../__design-system__/theme';

export const DarkTheme = {
  $theme: 'dark',

  ...DefaultTheme,

  $colorBase: '#000000',
  $colorBorder: '#222222',
  $colorContent: '#ffffff',
  $colorContentLight: '#999999',

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
