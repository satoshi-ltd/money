import { DefaultTheme } from '../__design-system__/theme';

export const LightTheme = {
  $theme: 'light',

  ...DefaultTheme,

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
